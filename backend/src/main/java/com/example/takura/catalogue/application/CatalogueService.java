package com.example.takura.catalogue.application;

import com.example.takura.identity.application.PermissionService;
import com.example.takura.identity.domain.StaffPrincipal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CatalogueService {
    private static final Set<String> MATERIALS = Set.of("MELAMINE", "MDF", "PLYWOOD", "OTHER");
    private final JdbcTemplate jdbc;
    private final PermissionService permissions;
    private final Clock clock;
    private final boolean demoFixturesEnabled;

    public CatalogueService(JdbcTemplate jdbc, PermissionService permissions, Clock clock,
            @Value("${takura.catalogue.demo-fixtures-enabled:true}") boolean demoFixturesEnabled) {
        this.jdbc = jdbc; this.permissions = permissions; this.clock = clock; this.demoFixturesEnabled = demoFixturesEnabled;
    }

    public Page products(String type, String finish, String thickness, String size, UUID cursor, int requested) {
        int limit = Math.min(Math.max(requested, 1), 12);
        StringBuilder where = new StringBuilder(" WHERE p.enabled AND NOT p.archived AND v.enabled AND NOT v.archived AND v.published_revision IS NOT NULL AND (? OR v.internal_code NOT LIKE 'DEMO-%')");
        List<Object> args = new ArrayList<>();
        args.add(demoFixturesEnabled);
        if (type != null && !type.isBlank()) { where.append(" AND r.material_type=?"); args.add(type.toUpperCase()); }
        if (finish != null && !finish.isBlank()) { where.append(" AND lower(r.finish)=lower(?)"); args.add(finish); }
        if (thickness != null && !thickness.isBlank()) { where.append(" AND r.thickness_mm=?::numeric"); args.add(thickness); }
        if (size != null && size.matches("\\d+x\\d+")) { var dimensions=size.split("x"); where.append(" AND r.sheet_length_mm=? AND r.sheet_width_mm=?"); args.add(Integer.valueOf(dimensions[0])); args.add(Integer.valueOf(dimensions[1])); }
        if (cursor != null) { where.append(" AND p.id>?"); args.add(cursor); }
        args.add(limit + 1);
        var rows = jdbc.query(selectPublic()+where+" ORDER BY p.id LIMIT ?", (rs,n)->map(rs), args.toArray());
        UUID next = rows.size()>limit ? rows.get(limit-1).id() : null;
        if(rows.size()>limit) rows=List.copyOf(rows.subList(0,limit));
        return new Page(rows,next,limit);
    }

    public Product product(String slug) {
        var rows=jdbc.query(selectPublic()+" WHERE p.slug=? AND p.enabled AND NOT p.archived AND v.enabled AND NOT v.archived AND v.published_revision IS NOT NULL AND (? OR v.internal_code NOT LIKE 'DEMO-%') ORDER BY v.sku",(rs,n)->map(rs),slug,demoFixturesEnabled);
        if(rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Published board was not found");
        var first=rows.getFirst();
        return new Product(first.id(),first.slug(),first.name(),first.description(),rows.stream().flatMap(x->x.variants().stream()).toList());
    }

    public List<Hardware> hardware() {
        return jdbc.query("SELECT id,slug,name,category,description,unit,availability_wording,revision FROM takura.hardware_item WHERE enabled AND NOT archived AND (? OR slug NOT LIKE 'example-%') ORDER BY name",(rs,n)->new Hardware((UUID)rs.getObject(1),rs.getString(2),rs.getString(3),rs.getString(4),rs.getString(5),rs.getString(6),rs.getString(7),rs.getLong(8)),demoFixturesEnabled);
    }

    public List<AdminVariant> admin(StaffPrincipal actor) {
        permissions.require(actor,"catalogue:write");
        return jdbc.query("SELECT v.id,p.id,p.slug,p.name,v.sku,v.internal_code,v.enabled,v.archived,v.current_revision,r.material_type,r.finish,r.thickness_mm,r.sheet_length_mm,r.sheet_width_mm,r.unit,r.availability_wording,r.collection_delivery_wording FROM takura.board_variant v JOIN takura.board_product p ON p.id=v.product_id JOIN takura.board_variant_revision r ON r.variant_id=v.id AND r.revision=v.current_revision ORDER BY p.name,v.sku",(rs,n)->mapAdmin(rs));
    }

    @Transactional
    public AdminVariant create(StaffPrincipal actor, WriteVariant request) {
        permissions.require(actor,"catalogue:write"); validate(request);
        UUID product=UUID.randomUUID(), variant=UUID.randomUUID(); var now=Timestamp.from(clock.instant());
        jdbc.update("INSERT INTO takura.board_product(id,slug,name,description,enabled,current_revision,published_revision,created_at,updated_at) VALUES(?,?,?,?,?,1,?, ?,?)",product,request.slug(),request.name(),request.description(),request.enabled(),request.enabled()?1L:null,now,now);
        jdbc.update("INSERT INTO takura.board_variant(id,product_id,sku,internal_code,enabled,current_revision,published_revision,updated_at) VALUES(?,?,?,?,?,1,?,?)",variant,product,request.sku(),request.internalCode(),request.enabled(),request.enabled()?1L:null,now);
        insertRevision(variant,1,request,actor.identityId());
        return admin(actor).stream().filter(v->v.id().equals(variant)).findFirst().orElseThrow();
    }

    @Transactional
    public long update(StaffPrincipal actor, UUID id, long expected, WriteVariant request) {
        permissions.require(actor,"catalogue:write"); validate(request);
        Long revision=jdbc.query("SELECT current_revision FROM takura.board_variant WHERE id=? FOR UPDATE",rs->rs.next()?rs.getLong(1):null,id);
        if(revision==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        if(revision!=expected) throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED,"Catalogue changed; refresh before retrying");
        long next=revision+1; var now=Timestamp.from(clock.instant());
        jdbc.update("UPDATE takura.board_product p SET slug=?,name=?,description=?,enabled=?,archived=false,current_revision=?,published_revision=CASE WHEN ? THEN ? ELSE published_revision END,updated_at=? FROM takura.board_variant v WHERE v.product_id=p.id AND v.id=?",request.slug(),request.name(),request.description(),request.enabled(),next,request.enabled(),next,now,id);
        jdbc.update("UPDATE takura.board_variant SET sku=?,internal_code=?,enabled=?,archived=false,current_revision=?,published_revision=CASE WHEN ? THEN ? ELSE published_revision END,updated_at=? WHERE id=?",request.sku(),request.internalCode(),request.enabled(),next,request.enabled(),next,now,id);
        insertRevision(id,next,request,actor.identityId()); return next;
    }

    @Transactional public long archive(StaffPrincipal actor, UUID id, long expected) {
        permissions.require(actor,"catalogue:write");
        int changed=jdbc.update("UPDATE takura.board_variant SET archived=true,enabled=false,current_revision=current_revision+1,updated_at=? WHERE id=? AND current_revision=?",Timestamp.from(clock.instant()),id,expected);
        if(changed==0) throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED,"Catalogue changed; refresh before retrying");
        return expected+1;
    }

    private void insertRevision(UUID id,long revision,WriteVariant r,UUID actor) { jdbc.update("INSERT INTO takura.board_variant_revision(variant_id,revision,material_type,finish,thickness_mm,sheet_length_mm,sheet_width_mm,unit,availability_wording,collection_delivery_wording,changed_by,changed_at) VALUES(?,?,?,?,?::numeric,?,?,?,?,?,?,?)",id,revision,r.materialType(),r.finish(),r.thicknessMm(),r.sheetLengthMm(),r.sheetWidthMm(),"SHEET",r.availabilityWording(),r.collectionDeliveryWording(),actor,Timestamp.from(clock.instant())); }
    private static void validate(WriteVariant r) { if(!MATERIALS.contains(r.materialType())||r.thicknessMm()==null||!r.thicknessMm().matches("\\d+(?:\\.\\d{1,2})?")||r.sheetLengthMm()<1||r.sheetWidthMm()<1) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid board specification"); if((r.materialType().equals("MDF")||r.materialType().equals("PLYWOOD"))&&!r.finish().equals("RAW")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Undecorated MDF and plywood use RAW finish"); }
    private static String selectPublic(){return "SELECT p.id,p.slug,p.name,p.description,v.id variant_id,v.sku,r.material_type,r.finish,r.thickness_mm,r.sheet_length_mm,r.sheet_width_mm,r.unit,r.availability_wording,r.collection_delivery_wording,r.revision FROM takura.board_product p JOIN takura.board_variant v ON v.product_id=p.id JOIN takura.board_variant_revision r ON r.variant_id=v.id AND r.revision=v.published_revision";}
    private static Product map(ResultSet rs)throws SQLException{var v=new Variant((UUID)rs.getObject("variant_id"),rs.getString("sku"),rs.getString("material_type"),rs.getString("finish"),rs.getBigDecimal("thickness_mm").toPlainString(),rs.getInt("sheet_length_mm"),rs.getInt("sheet_width_mm"),rs.getString("unit"),rs.getString("availability_wording"),rs.getString("collection_delivery_wording"),rs.getLong("revision"));return new Product((UUID)rs.getObject("id"),rs.getString("slug"),rs.getString("name"),rs.getString("description"),List.of(v));}
    private static AdminVariant mapAdmin(ResultSet rs)throws SQLException{return new AdminVariant((UUID)rs.getObject(1),(UUID)rs.getObject(2),rs.getString(3),rs.getString(4),rs.getString(5),rs.getString(6),rs.getBoolean(7),rs.getBoolean(8),rs.getLong(9),rs.getString(10),rs.getString(11),rs.getBigDecimal(12).toPlainString(),rs.getInt(13),rs.getInt(14),rs.getString(15),rs.getString(16),rs.getString(17));}
    public record Page(List<Product> items,UUID nextCursor,int pageSize){}
    public record Product(UUID id,String slug,String name,String description,List<Variant> variants){}
    public record Variant(UUID id,String sku,String materialType,String finish,String thicknessMm,int sheetLengthMm,int sheetWidthMm,String unit,String availabilityWording,String collectionDeliveryWording,long revision){}
    public record Hardware(UUID id,String slug,String name,String category,String description,String unit,String availabilityWording,long revision){}
    public record AdminVariant(UUID id,UUID productId,String slug,String name,String sku,String internalCode,boolean enabled,boolean archived,long revision,String materialType,String finish,String thicknessMm,int sheetLengthMm,int sheetWidthMm,String unit,String availabilityWording,String collectionDeliveryWording){}
    public record WriteVariant(String slug,String name,String description,String sku,String internalCode,String materialType,String finish,String thicknessMm,int sheetLengthMm,int sheetWidthMm,String availabilityWording,String collectionDeliveryWording,boolean enabled){}
}
