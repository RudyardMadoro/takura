package com.example.takura.communications.application;

import com.example.takura.quotations.application.QuoteSecretProtector;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Duration;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class OutboxWorker {
    private static final Logger log=LoggerFactory.getLogger(OutboxWorker.class);
    private static final long[] RETRY_MINUTES={1,5,15,60,240};
    private final JdbcTemplate jdbc; private final TransactionTemplate transactions; private final CommunicationPort port;
    private final ObjectMapper json; private final Clock clock; private final QuoteSecretProtector secrets;
    @Value("${takura.communications.staff-alert-recipient:staff-operations@example.invalid}") private String staffAlertRecipient="staff-operations@example.invalid";
    public OutboxWorker(JdbcTemplate jdbc,TransactionTemplate transactions,CommunicationPort port,ObjectMapper json,Clock clock,QuoteSecretProtector secrets){this.jdbc=jdbc;this.transactions=transactions;this.port=port;this.json=json;this.clock=clock;this.secrets=secrets;}
    public int runOnce(){List<Job> jobs=claim(20);jobs.forEach(this::deliver);return jobs.size();}
    List<Job> claim(int limit){return transactions.execute(status->jdbc.query("WITH ready AS (SELECT id FROM takura.notification_outbox WHERE (state='PENDING' OR (state='LEASED' AND lease_until<?)) AND next_attempt_at<=? ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT ?) UPDATE takura.notification_outbox o SET state='LEASED',lease_until=?,leased_by=? FROM ready WHERE o.id=ready.id RETURNING o.id,o.payload::text,o.attempts,o.trace_context,o.originating_correlation_id,o.originating_trace_id",(rs,n)->new Job((UUID)rs.getObject(1),rs.getString(2),rs.getInt(3),rs.getString(4),rs.getString(5),rs.getString(6)),now(),now(),limit,Timestamp.from(clock.instant().plus(Duration.ofMinutes(2))),"worker-"+UUID.randomUUID()));}
    void deliver(Job job){try(MDC.MDCCloseable c=MDC.putCloseable("correlation_id",safe(job.correlationId()));MDC.MDCCloseable t=MDC.putCloseable("trace_id",safe(job.traceId()))){var node=json.readTree(job.payload());String secretId=node.path("delivery_secret_id").asText();if(!secretId.isBlank())deliverQuote(job,node,UUID.fromString(secretId));else deliverOrdinary(job,node);}catch(DeliveryFailure failure){handleFailure(job,failure.kind(),failure.safeCode());}catch(Exception failure){handleFailure(job,DeliveryFailure.Kind.TRANSIENT,"PROVIDER_UNAVAILABLE");}}
    private void deliverQuote(Job job,com.fasterxml.jackson.databind.JsonNode node,UUID secretId){var rows=jdbc.query("SELECT s.encrypted_token,s.nonce,e.email,r.id,g.enquiry_id FROM takura.quote_delivery_secret s JOIN takura.quote_revision r ON r.id=s.quote_revision_id JOIN takura.quote_group g ON g.id=r.quote_group_id JOIN takura.enquiry e ON e.id=g.enquiry_id WHERE s.id=? AND s.destroyed_at IS NULL",(rs,n)->new Object[]{rs.getBytes(1),rs.getBytes(2),rs.getString(3),rs.getObject(4),rs.getObject(5)},secretId);if(rows.isEmpty()||rows.getFirst()[2]==null)throw new DeliveryFailure(DeliveryFailure.Kind.PERMANENT,"DELIVERY_SECRET_UNAVAILABLE",null);String recipient=(String)rows.getFirst()[2];ensureNotSuppressed(recipient);String token=secrets.unprotect((byte[])rows.getFirst()[0],(byte[])rows.getFirst()[1]);port.sendQuoteToTestSink(node.path("template").asText(),recipient,"/quote/view#"+token);transactions.executeWithoutResult(s->{markDelivered(job.id());jdbc.update("UPDATE takura.quote_revision SET dispatch_state='ACCEPTED' WHERE id=? AND dispatch_state='PENDING'",rows.getFirst()[3]);jdbc.update("UPDATE takura.enquiry SET quote_dispatch_evidence=?,state=CASE WHEN state='QUOTE_IN_PREPARATION' THEN 'QUOTE_SENT' ELSE state END,revision=revision+1 WHERE id=?",rows.getFirst()[3].toString(),rows.getFirst()[4]);jdbc.update("UPDATE takura.quote_delivery_secret SET encrypted_token='\\x'::bytea,nonce='\\x'::bytea,destroyed_at=? WHERE id=?",now(),secretId);});}
    private void deliverOrdinary(Job job,com.fasterxml.jackson.databind.JsonNode node){String recipient=node.path("recipient").asText();if(recipient.isBlank())recipient=staffAlertRecipient;ensureNotSuppressed(recipient);port.sendToTestSink(node.path("template").asText(),recipient);transactions.executeWithoutResult(s->markDelivered(job.id()));}
    private void ensureNotSuppressed(String recipient){Boolean blocked=jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM takura.communication_suppression WHERE channel='EMAIL' AND destination_hash=? AND active)",Boolean.class,hash(recipient.toLowerCase()));if(Boolean.TRUE.equals(blocked))throw new DeliveryFailure(DeliveryFailure.Kind.PERMANENT,"DESTINATION_SUPPRESSED",null);}
    private void markDelivered(UUID id){jdbc.update("UPDATE takura.notification_outbox SET state='DELIVERED',completed_at=?,lease_until=NULL,leased_by=NULL,failure_code=NULL,possibly_accepted=false,provider_reference=COALESCE(?,provider_reference) WHERE id=?",now(),port.lastProviderReference(),id);}
    private void handleFailure(Job job,DeliveryFailure.Kind kind,String code){int attempt=job.attempts()+1;String state;Timestamp next=now();boolean unknown=kind==DeliveryFailure.Kind.UNKNOWN;if(unknown)state="DELIVERY_UNKNOWN";else if(kind==DeliveryFailure.Kind.PERMANENT||attempt>=RETRY_MINUTES.length)state="FAILED_REQUIRES_REVIEW";else{state="PENDING";next=Timestamp.from(clock.instant().plus(Duration.ofMinutes(RETRY_MINUTES[attempt-1])));}Timestamp scheduled=next;transactions.executeWithoutResult(s->jdbc.update("UPDATE takura.notification_outbox SET state=?,attempts=?,next_attempt_at=?,lease_until=NULL,leased_by=NULL,failure_code=?,possibly_accepted=? WHERE id=?",state,attempt,scheduled,code,unknown,job.id()));log.warn("notification_delivery_failed state={} code={} attempt={}",state,code,attempt);}
    private Timestamp now(){return Timestamp.from(clock.instant());}
    private static String hash(String value){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}
    private static String safe(String value){if(value==null)return "";String cleaned=value.replaceAll("[^A-Za-z0-9_.:-]","");return cleaned.substring(0,Math.min(64,cleaned.length()));}
    record Job(UUID id,String payload,int attempts,String traceContext,String correlationId,String traceId){}
}
