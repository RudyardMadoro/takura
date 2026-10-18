package com.example.takura.media.application;

import com.example.takura.identity.application.PermissionService;
import com.example.takura.identity.domain.StaffPrincipal;
import com.example.takura.media.application.UploadService.UploadException;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.sql.Timestamp;
import java.time.Clock;
import java.util.List;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MediaLibraryService {
    private final JdbcTemplate jdbc; private final ObjectStoragePort storage; private final PermissionService permissions; private final AttachmentValidator validator; private final Clock clock; private final boolean videoEnabled;
    public MediaLibraryService(JdbcTemplate jdbc,ObjectStoragePort storage,PermissionService permissions,AttachmentValidator validator,Clock clock,@Value("${takura.media.reviewed-video-enabled:false}")boolean videoEnabled){this.jdbc=jdbc;this.storage=storage;this.permissions=permissions;this.validator=validator;this.clock=clock;this.videoEnabled=videoEnabled;}
    public List<View> list(StaffPrincipal actor){permissions.require(actor,"content:write");return jdbc.query("SELECT id,media_type,stage,visibility,scan_status,publication_clearance,rights_status,caption,alt_text,revision FROM takura.media_asset ORDER BY id",(rs,n)->view(rs));}

    @Transactional public View register(StaffPrincipal actor,Create request){
        permissions.require(actor,"content:write");if(blank(request.caption())||blank(request.altText())||blank(request.rightsReference()))throw error(HttpStatus.BAD_REQUEST,"MEDIA_METADATA_REQUIRED","Caption, informative alt text and rights evidence are required.");
        Source source=source(request.attachmentId(),actor.identityId());UUID id=UUID.randomUUID();
        if("video/mp4".equals(source.contentType())){if(!videoEnabled)throw error(HttpStatus.CONFLICT,"VIDEO_DISABLED","Reviewed video handling is disabled in this environment.");if(request.posterAssetId()==null||blank(request.captionsReference()))throw error(HttpStatus.BAD_REQUEST,"VIDEO_METADATA_REQUIRED","Reviewed video requires a cleared poster and captions reference.");Integer poster=jdbc.queryForObject("SELECT count(*) FROM takura.media_asset WHERE id=? AND media_type='IMAGE' AND visibility='PUBLIC' AND scan_status='CLEAN' AND publication_clearance='CLEARED'",Integer.class,request.posterAssetId());if(poster==null||poster!=1)throw error(HttpStatus.BAD_REQUEST,"VIDEO_POSTER_INVALID","Choose a cleared public image poster.");var validation=validator.validate("mp4",storage.readPrivate(source.key(),source.version()));if(!validation.accepted())throw error(HttpStatus.BAD_REQUEST,validation.rejectionCode(),"The video failed bounded probing.");jdbc.update("INSERT INTO takura.media_asset(id,repository_path,visibility,scan_status,publication_clearance,caption,alt_text,rights_reference,demo_only,source_attachment_id,media_type,stage,rights_status,duration_seconds,poster_asset_id,captions_reference,revision) VALUES(?,?,'PRIVATE','CLEAN','PENDING',?,?,?,false,?,'VIDEO',?,'CONFIRMED',?,?,?,0)",id,"pending://"+id,request.caption().trim(),request.altText().trim(),request.rightsReference().trim(),request.attachmentId(),request.stage(),validation.durationSeconds(),request.posterAssetId(),request.captionsReference().trim());}
        else {BufferedImage image=decode(source);jdbc.update("INSERT INTO takura.media_asset(id,repository_path,visibility,scan_status,publication_clearance,caption,alt_text,rights_reference,demo_only,source_attachment_id,media_type,stage,rights_status,width_px,height_px,revision) VALUES(?,?,'PRIVATE','CLEAN','PENDING',?,?,?,false,?,'IMAGE',?,'CONFIRMED',?,?,0)",id,"pending://"+id,request.caption().trim(),request.altText().trim(),request.rightsReference().trim(),request.attachmentId(),request.stage(),image.getWidth(),image.getHeight());}return one(id);
    }

    @Transactional public View clear(StaffPrincipal actor,UUID id,long revision){
        permissions.require(actor,"content:publish");var assets=jdbc.query("SELECT a.source_attachment_id,s.owner_identity_id,a.media_type FROM takura.media_asset a JOIN takura.attachment x ON x.id=a.source_attachment_id JOIN takura.upload_session s ON s.id=x.upload_session_id WHERE a.id=? AND a.revision=? AND a.scan_status='CLEAN' AND a.rights_status='CONFIRMED' AND a.publication_clearance='PENDING' AND (a.media_type='IMAGE' OR (a.media_type='VIDEO' AND a.poster_asset_id IS NOT NULL AND a.captions_reference IS NOT NULL)) FOR UPDATE",(rs,n)->new AssetSource((UUID)rs.getObject(1),(UUID)rs.getObject(2),rs.getString(3)),id,revision);if(assets.isEmpty())throw error(HttpStatus.PRECONDITION_FAILED,"MEDIA_PRECONDITION_FAILED","The asset changed or is not clearable.");Source source=source(assets.getFirst().attachment(),assets.getFirst().owner());
        String key;ObjectStoragePort.StoredObject stored;Integer width=null,height=null;String contentType;
        if("VIDEO".equals(assets.getFirst().mediaType())){if(!videoEnabled)throw error(HttpStatus.CONFLICT,"VIDEO_DISABLED","Reviewed video handling is disabled.");byte[] bytes=storage.readPrivate(source.key(),source.version());var validation=validator.validate("mp4",bytes);if(!validation.accepted())throw error(HttpStatus.CONFLICT,validation.rejectionCode(),"The video no longer passes bounded probing.");key="derivatives/"+id+"/reviewed.mp4";contentType="video/mp4";stored=storage.writePublicDerivative(key,bytes,contentType);}else{BufferedImage image=decode(source);try{var output=new ByteArrayOutputStream();ImageIO.write(image,"jpg",output);key="derivatives/"+id+"/display.jpg";contentType="image/jpeg";width=image.getWidth();height=image.getHeight();stored=storage.writePublicDerivative(key,output.toByteArray(),contentType);}catch(java.io.IOException e){throw error(HttpStatus.CONFLICT,"MEDIA_PROCESSING_FAILED","The metadata-stripped derivative could not be created.");}}
        jdbc.update("INSERT INTO takura.media_derivative(id,media_asset_id,object_key,object_version,checksum_sha256,content_type,width_px,height_px,public_approved,created_at) VALUES(?,?,?,?,?,?,?,?,true,?)",UUID.randomUUID(),id,key,stored.version(),stored.checksumSha256(),contentType,width,height,Timestamp.from(clock.instant()));jdbc.update("UPDATE takura.media_asset SET repository_path=?,visibility='PUBLIC',publication_clearance='CLEARED',revision=revision+1 WHERE id=?",key,id);return one(id);
    }
    private Source source(UUID attachment,UUID owner){var rows=jdbc.query("SELECT private_key,private_version,declared_content_type FROM takura.attachment a JOIN takura.upload_session s ON s.id=a.upload_session_id WHERE a.id=? AND a.state='CLEAN' AND s.purpose='STAFF_MEDIA' AND s.owner_identity_id=?",(rs,n)->new Source(rs.getString(1),rs.getString(2),rs.getString(3)),attachment,owner);if(rows.isEmpty())throw error(HttpStatus.BAD_REQUEST,"MEDIA_SOURCE_INVALID","Choose a clean staff-owned upload.");if(!rows.getFirst().contentType().startsWith("image/")&&!"video/mp4".equals(rows.getFirst().contentType()))throw error(HttpStatus.BAD_REQUEST,"MEDIA_TYPE_UNSUPPORTED","This media type cannot be published.");return rows.getFirst();}
    private BufferedImage decode(Source source){try{var image=ImageIO.read(new ByteArrayInputStream(storage.readPrivate(source.key(),source.version())));if(image==null)throw error(HttpStatus.BAD_REQUEST,"MEDIA_DECODE_FAILED","The image could not be decoded.");return image;}catch(java.io.IOException e){throw error(HttpStatus.BAD_REQUEST,"MEDIA_DECODE_FAILED","The image could not be decoded.");}}
    private View one(UUID id){return jdbc.query("SELECT id,media_type,stage,visibility,scan_status,publication_clearance,rights_status,caption,alt_text,revision FROM takura.media_asset WHERE id=?",(rs,n)->view(rs),id).getFirst();}
    private static View view(java.sql.ResultSet rs)throws java.sql.SQLException{return new View((UUID)rs.getObject(1),rs.getString(2),rs.getString(3),rs.getString(4),rs.getString(5),rs.getString(6),rs.getString(7),rs.getString(8),rs.getString(9),rs.getLong(10));}
    private static boolean blank(String value){return value==null||value.isBlank();}private static UploadException error(HttpStatus status,String code,String message){return new UploadException(status,code,message);}
    private record Source(String key,String version,String contentType){} private record AssetSource(UUID attachment,UUID owner,String mediaType){}
    public record Create(UUID attachmentId,String stage,String caption,String altText,String rightsReference,UUID posterAssetId,String captionsReference){}
    public record View(UUID id,String mediaType,String stage,String visibility,String scanStatus,String publicationClearance,String rightsStatus,String caption,String altText,long revision){}
}
