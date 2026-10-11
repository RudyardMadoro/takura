package com.example.takura.enquiries.application;

import com.example.takura.identity.application.PermissionService;
import com.example.takura.identity.domain.StaffPrincipal;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EnquiryService {
    private static final Pattern EMAIL=Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private final JdbcTemplate jdbc; private final ObjectMapper json; private final Clock clock; private final PermissionService permissions;
    private final String noticeVersion; private final boolean demoFixturesEnabled;
    public EnquiryService(JdbcTemplate jdbc,ObjectMapper json,Clock clock,PermissionService permissions,@Value("${takura.enquiries.privacy-notice-version:demo-privacy-v1}")String noticeVersion,@Value("${takura.catalogue.demo-fixtures-enabled:true}")boolean demoFixturesEnabled){this.jdbc=jdbc;this.json=json;this.clock=clock;this.permissions=permissions;this.noticeVersion=noticeVersion;this.demoFixturesEnabled=demoFixturesEnabled;}

    @Transactional
    public Receipt create(String key, Request request, String riskSource, String correlationId) {
        if(key==null||key.isBlank()||key.length()>200) throw new DomainException(HttpStatus.BAD_REQUEST,"IDEMPOTENCY_KEY_REQUIRED","A valid Idempotency-Key is required");
        String keyHash=sha(key), body=canonical(request), digest=sha(body);
        jdbc.query("SELECT pg_advisory_xact_lock(hashtext(?))", rs -> { rs.next(); return null; }, keyHash);
        var replay=jdbc.query("SELECT request_digest,response_payload::text FROM takura.idempotency_record WHERE namespace='public-enquiry' AND key_hash=? AND expires_at>?",(rs,n)->new String[]{rs.getString(1),rs.getString(2)},keyHash,Timestamp.from(clock.instant()));
        if(!replay.isEmpty()) { if(!replay.getFirst()[0].equals(digest))throw new DomainException(HttpStatus.CONFLICT,"IDEMPOTENCY_CONFLICT","This key was already used for different form content"); try{return json.readValue(replay.getFirst()[1],Receipt.class);}catch(JsonProcessingException e){throw new IllegalStateException(e);} }
        validate(request); enforceQuota(riskSource);
        UUID owner=jdbc.query("SELECT i.id FROM takura.staff_identity i JOIN takura.staff_team t ON t.staff_identity_id=i.id WHERE i.active AND t.team_code='BOARDS' AND EXISTS(SELECT 1 FROM takura.staff_role r WHERE r.staff_identity_id=i.id AND r.role_code='SALES_COORDINATOR') ORDER BY i.id LIMIT 1",rs->rs.next()?(UUID)rs.getObject(1):null);
        UUID id=UUID.randomUUID(); String reference="ENQ-"+clock.instant().atZone(java.time.ZoneOffset.UTC).getYear()+"-"+String.format(Locale.ROOT,"%06d",jdbc.queryForObject("SELECT nextval('takura.enquiry_reference_sequence')",Long.class)); var now=Timestamp.from(clock.instant());
        jdbc.update("INSERT INTO takura.enquiry(id,reference,team_code,owner_identity_id,full_name,email,phone,preferred_contact,country_code,town_or_suburb,description,privacy_notice_version,privacy_acknowledged_at,marketing_opt_in,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",id,reference,"BOARDS",owner,request.contact().fullName().trim(),blank(request.contact().email()),blank(request.contact().phone()),request.contact().preferredContact(),request.location().countryCode().toUpperCase(),request.location().townOrSuburb().trim(),request.description().trim(),noticeVersion,now,request.marketingOptIn(),now);
        int line=0; for(var item:request.requestLines()){line++; Snapshot snapshot=snapshot(item,line);jdbc.update("INSERT INTO takura.enquiry_request_line(enquiry_id,line_number,variant_id,requested_specification,quantity,unit,fulfilment,collection_preference,substitutes_allowed,specification_snapshot) VALUES(?,?,?,?,?,?,?,?,?,?::jsonb)",id,line,item.variantId(),blank(item.requestedSpecification()),item.quantity(),item.unit(),item.fulfilment(),item.collectionPreference(),item.substitutesAllowed(),write(snapshot));}
        if(request.contact().email()!=null&&!request.contact().email().isBlank()) addEvent(id,"ENQUIRY_RECEIVED","ack:"+id,"{\"template\":\"board-enquiry-acknowledgement\",\"recipient\":\"customer-"+id+"@example.invalid\"}",correlationId);
        addEvent(id,"ENQUIRY_ASSIGNED","staff:"+id,"{\"template\":\"board-enquiry-staff-alert\",\"recipient\":\"boards-team@example.invalid\"}",correlationId);
        Receipt receipt=new Receipt(reference,"RECEIVED",owner==null?"The boards team will review this unassigned request.":"The boards team will review your request and contact you.",correlationId);
        jdbc.update("INSERT INTO takura.idempotency_record(namespace,key_hash,request_digest,enquiry_id,response_payload,created_at,expires_at) VALUES('public-enquiry',?,?,?,?::jsonb,?,?)",keyHash,digest,id,write(receipt),now,Timestamp.from(clock.instant().plus(24,ChronoUnit.HOURS)));
        return receipt;
    }

    public InboxPage list(StaffPrincipal actor,String state,UUID cursor,int requested){requireInbox(actor);int size=Math.min(Math.max(requested,1),50);String scope=scope(actor);var rows=jdbc.query("SELECT e.id,e.reference,e.state,e.team_code,e.owner_identity_id,e.created_at FROM takura.enquiry e WHERE "+scope+(state==null?"":" AND e.state=?")+(cursor==null?"":" AND e.id<?")+" ORDER BY e.created_at DESC,e.id DESC LIMIT ?",(rs,n)->new InboxItem((UUID)rs.getObject(1),rs.getString(2),rs.getString(3),rs.getString(4),(UUID)rs.getObject(5),rs.getTimestamp(6).toInstant()),params(actor,state,cursor,size+1));UUID next=rows.size()>size?rows.get(size-1).id():null;if(rows.size()>size)rows=List.copyOf(rows.subList(0,size));return new InboxPage(rows,next,size);}
    public long count(StaffPrincipal actor,String state){requireInbox(actor);return jdbc.queryForObject("SELECT count(*) FROM takura.enquiry e WHERE "+scope(actor)+(state==null?"":" AND e.state=?"),Long.class,state==null?new Object[]{}:new Object[]{state});}
    public Detail detail(StaffPrincipal actor,UUID id){requireInbox(actor);var rows=jdbc.query("SELECT e.id,e.reference,e.state,e.team_code,e.owner_identity_id,e.full_name,e.email,e.phone,e.preferred_contact,e.country_code,e.town_or_suburb,e.description,e.marketing_opt_in,e.created_at FROM takura.enquiry e WHERE e.id=? AND "+scope(actor),(rs,n)->new Detail((UUID)rs.getObject(1),rs.getString(2),rs.getString(3),rs.getString(4),(UUID)rs.getObject(5),rs.getString(6),rs.getString(7),rs.getString(8),rs.getString(9),rs.getString(10),rs.getString(11),rs.getString(12),rs.getBoolean(13),rs.getTimestamp(14).toInstant(),jdbc.query("SELECT line_number,quantity,unit,fulfilment,collection_preference,substitutes_allowed,specification_snapshot::text FROM takura.enquiry_request_line WHERE enquiry_id=? ORDER BY line_number",(lr,k)->new Line(lr.getInt(1),lr.getInt(2),lr.getString(3),lr.getString(4),lr.getString(5),lr.getString(6),lr.getString(7)),id)),id);if(rows.isEmpty())throw new DomainException(HttpStatus.NOT_FOUND,"ENQUIRY_NOT_FOUND","Enquiry was not found");return rows.getFirst();}
    private String scope(StaffPrincipal p){if(p.may("enquiry:all:read"))return "TRUE";if(p.teams().contains("BOARDS"))return "(e.team_code='BOARDS' AND (e.owner_identity_id IS NULL OR e.owner_identity_id='"+p.identityId()+"' OR EXISTS(SELECT 1 FROM takura.enquiry_record_grant g WHERE g.enquiry_id=e.id AND g.staff_identity_id='"+p.identityId()+"')))";return "EXISTS(SELECT 1 FROM takura.enquiry_record_grant g WHERE g.enquiry_id=e.id AND g.staff_identity_id='"+p.identityId()+"')";}
    private void requireInbox(StaffPrincipal p){if(!(p.may("enquiry:assigned:read")||p.may("enquiry:all:read")||p.may("record:granted:read")))throw new org.springframework.security.access.AccessDeniedException("Enquiry access is not granted");}
    private Object[] params(StaffPrincipal p,String state,UUID cursor,int limit){var a=new java.util.ArrayList<>();if(state!=null)a.add(state);if(cursor!=null)a.add(cursor);a.add(limit);return a.toArray();}
    private Snapshot snapshot(RequestLine line,int index){if(line.variantId()==null)return new Snapshot(null,null,null,null,null,null,null,line.requestedSpecification(),null);var rows=jdbc.query("SELECT v.sku,r.material_type,r.finish,r.thickness_mm,r.sheet_length_mm,r.sheet_width_mm,r.unit,r.revision FROM takura.board_variant v JOIN takura.board_product p ON p.id=v.product_id JOIN takura.board_variant_revision r ON r.variant_id=v.id AND r.revision=v.published_revision WHERE v.id=? AND v.enabled AND NOT v.archived AND p.enabled AND NOT p.archived AND (? OR v.internal_code NOT LIKE 'DEMO-%')",(rs,n)->new Snapshot(rs.getString(1),rs.getString(2),rs.getString(3),rs.getBigDecimal(4).toPlainString(),rs.getInt(5),rs.getInt(6),rs.getString(7),null,rs.getLong(8)),line.variantId(),demoFixturesEnabled);if(rows.isEmpty())throw new FieldDomainException(HttpStatus.CONFLICT,"VARIANT_UNAVAILABLE","A selected board is no longer available",List.of(new FieldError("request_lines["+(index-1)+"].variant_id","VARIANT_UNAVAILABLE","Remove it or describe the specification for staff review.")));return rows.getFirst();}
    private void validate(Request r){
        var errors=new java.util.ArrayList<FieldError>();
        if(r.services()==null||r.services().size()!=1||!r.services().contains("BOARD_SALES"))errors.add(new FieldError("services","SERVICE_UNAVAILABLE","Only board sales is available in this phase."));
        if(r.contact()==null||r.contact().fullName()==null||r.contact().fullName().trim().length()<2||r.contact().fullName().trim().length()>120)errors.add(new FieldError("contact.full_name","INVALID_LENGTH","Enter a name of 2 to 120 characters."));
        if(r.contact()!=null&&!SetHolder.CONTACT.contains(r.contact().preferredContact()))errors.add(new FieldError("contact.preferred_contact","CONTACT_ROUTE_INVALID","Choose email, call or WhatsApp."));
        if(r.contact()!=null&&"EMAIL".equals(r.contact().preferredContact())&&(r.contact().email()==null||!EMAIL.matcher(r.contact().email()).matches()))errors.add(new FieldError("contact.email","VALID_EMAIL_REQUIRED","Enter a valid email address."));
        if(r.contact()!=null&&SetHolder.PHONE.contains(r.contact().preferredContact())&&(r.contact().phone()==null||r.contact().phone().trim().length()<7))errors.add(new FieldError("contact.phone","VALID_PHONE_REQUIRED","Enter a usable phone number."));
        if(r.location()==null||r.location().countryCode()==null||!r.location().countryCode().matches("[A-Za-z]{2}"))errors.add(new FieldError("location.country_code","COUNTRY_REQUIRED","Choose a two-letter country code."));
        if(r.location()==null||r.location().townOrSuburb()==null||r.location().townOrSuburb().trim().length()<2)errors.add(new FieldError("location.town_or_suburb","LOCATION_REQUIRED","Enter a town or suburb."));
        if(r.description()==null||r.description().trim().length()<10||r.description().trim().length()>5000)errors.add(new FieldError("description","INVALID_LENGTH","Enter 10 to 5000 characters."));
        if(!r.privacyAcknowledged())errors.add(new FieldError("privacy_acknowledged","ACKNOWLEDGEMENT_REQUIRED","Review and acknowledge the privacy notice."));
        if(!noticeVersion.equals(r.privacyNoticeVersion()))throw new DomainException(HttpStatus.CONFLICT,"NOTICE_VERSION_CHANGED","The privacy notice changed; review it before submitting.");
        if(r.attachmentIds()!=null&&!r.attachmentIds().isEmpty())errors.add(new FieldError("attachment_ids","ATTACHMENTS_NOT_SUPPORTED","Attachments arrive in Phase 06 and cannot be accepted yet."));
        if(r.requestLines()==null||r.requestLines().isEmpty()||r.requestLines().size()>10)errors.add(new FieldError("request_lines","LINE_COUNT_INVALID","Add between one and ten board lines."));
        else for(int i=0;i<r.requestLines().size();i++){var l=r.requestLines().get(i);if((l.variantId()==null)==(l.requestedSpecification()==null||l.requestedSpecification().isBlank()))errors.add(new FieldError("request_lines["+i+"]","VARIANT_OR_SPECIFICATION_REQUIRED","Choose a board or describe one."));if(l.requestedSpecification()!=null&&l.requestedSpecification().length()>500)errors.add(new FieldError("request_lines["+i+"].requested_specification","INVALID_LENGTH","Keep the specification within 500 characters."));if(l.quantity()<1||l.quantity()>9999)errors.add(new FieldError("request_lines["+i+"].quantity","POSITIVE_INTEGER_REQUIRED","Enter a whole number from 1 to 9999."));if(!"SHEET".equals(l.unit())||!"FULL_SHEET".equals(l.fulfilment()))errors.add(new FieldError("request_lines["+i+"]","FULL_SHEET_REQUIRED","This phase accepts full sheets in SHEET units."));if(!SetHolder.COLLECTION.contains(l.collectionPreference()))errors.add(new FieldError("request_lines["+i+"].collection_preference","INVALID_CHOICE","Choose collection, delivery or undecided."));if(!SetHolder.SUBSTITUTES.contains(l.substitutesAllowed()))errors.add(new FieldError("request_lines["+i+"].substitutes_allowed","INVALID_CHOICE","Choose yes, no or discuss."));}
        if(!errors.isEmpty())throw new FieldDomainException(HttpStatus.BAD_REQUEST,"VALIDATION_FAILED","Review the highlighted fields",errors);
    }
    private void enforceQuota(String source){String hash=sha(source==null?"unknown":source);var start=Timestamp.from(clock.instant().truncatedTo(ChronoUnit.MINUTES).minus(clock.instant().atZone(java.time.ZoneOffset.UTC).getMinute()%10,ChronoUnit.MINUTES));jdbc.update("INSERT INTO takura.enquiry_abuse_bucket(risk_hash,window_start,submission_count) VALUES(?,?,1) ON CONFLICT(risk_hash,window_start) DO UPDATE SET submission_count=takura.enquiry_abuse_bucket.submission_count+1",hash,start);Integer count=jdbc.queryForObject("SELECT submission_count FROM takura.enquiry_abuse_bucket WHERE risk_hash=? AND window_start=?",Integer.class,hash,start);if(count!=null&&count>5)throw new DomainException(HttpStatus.TOO_MANY_REQUESTS,"RATE_LIMITED","Too many requests; wait before trying again.");}
    private void addEvent(UUID id,String type,String key,String payload,String trace){jdbc.update("INSERT INTO takura.notification_outbox(id,event_type,aggregate_id,semantic_key,payload,next_attempt_at,trace_context,created_at) VALUES(?,?,?,?,?::jsonb,?,?,?)",UUID.randomUUID(),type,id,key,payload,Timestamp.from(clock.instant()),trace,Timestamp.from(clock.instant()));}
    private String canonical(Object o){return write(o);} private String write(Object o){try{return json.writeValueAsString(o);}catch(JsonProcessingException e){throw new IllegalArgumentException(e);}}
    private static String blank(String s){return s==null||s.isBlank()?null:s.trim();} private static String sha(String s){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}
    private static final class SetHolder{static final java.util.Set<String> PHONE=java.util.Set.of("CALL","WHATSAPP");static final java.util.Set<String> CONTACT=java.util.Set.of("EMAIL","CALL","WHATSAPP");static final java.util.Set<String> COLLECTION=java.util.Set.of("COLLECTION","DELIVERY","UNDECIDED");static final java.util.Set<String> SUBSTITUTES=java.util.Set.of("YES","NO","DISCUSS");}
    public record Contact(String fullName,String email,String phone,String preferredContact){} public record Location(String countryCode,String townOrSuburb){}
    public record Request(List<String> services,Contact contact,Location location,String description,List<RequestLine> requestLines,List<String> attachmentIds,boolean privacyAcknowledged,String privacyNoticeVersion,boolean marketingOptIn){}
    public record RequestLine(UUID variantId,String requestedSpecification,int quantity,String unit,String fulfilment,String collectionPreference,String substitutesAllowed){}
    public record Receipt(String reference,String result,String nextStep,String correlationId){}
    public record Snapshot(String sku,String materialType,String finish,String thicknessMm,Integer sheetLengthMm,Integer sheetWidthMm,String unit,String requestedSpecification,Long revision){}
    public record InboxItem(UUID id,String reference,String state,String teamCode,UUID ownerIdentityId,java.time.Instant createdAt){} public record InboxPage(List<InboxItem> items,UUID nextCursor,int pageSize){}
    public record Line(int lineNumber,int quantity,String unit,String fulfilment,String collectionPreference,String substitutesAllowed,String specificationSnapshot){}
    public record Detail(UUID id,String reference,String state,String teamCode,UUID ownerIdentityId,String fullName,String email,String phone,String preferredContact,String countryCode,String townOrSuburb,String description,boolean marketingOptIn,java.time.Instant createdAt,List<Line> requestLines){}
    public record FieldError(String path,String code,String userMessage){}
    public static class DomainException extends RuntimeException{public final HttpStatus status;public final String code;public DomainException(HttpStatus s,String c,String m){super(m);status=s;code=c;}}
    public static final class FieldDomainException extends DomainException{public final List<FieldError> errors;public FieldDomainException(HttpStatus s,String c,String m,List<FieldError> e){super(s,c,m);errors=e;}}
}
