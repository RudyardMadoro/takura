package com.example.takura.media.infrastructure;

import com.example.takura.media.application.ObjectStoragePort;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CopyObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Component
public class S3ObjectStorageAdapter implements ObjectStoragePort {
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC);
    private static final DateTimeFormatter AMZ = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC);
    private final S3Client s3; private final S3Presigner presigner; private final AwsCredentialsProvider credentials;
    private final ObjectMapper json; private final Clock clock; private final String region;
    private final String quarantineBucket; private final String privateBucket; private final String publicBucket; private final URI uploadOrigin;
    public S3ObjectStorageAdapter(S3Client s3,S3Presigner presigner,AwsCredentialsProvider credentials,ObjectMapper json,Clock clock,
            @Value("${takura.storage.region:us-east-1}") String region,
            @Value("${takura.storage.quarantine-bucket:takura-local-quarantine}") String quarantineBucket,
            @Value("${takura.storage.private-bucket:takura-local-private-clean}") String privateBucket,
            @Value("${takura.storage.public-bucket:takura-local-approved-public}") String publicBucket,
            @Value("${takura.storage.upload-origin:http://127.0.0.1:19000}") URI uploadOrigin) {
        this.s3=s3;this.presigner=presigner;this.credentials=credentials;this.json=json;this.clock=clock;this.region=region;
        this.quarantineBucket=quarantineBucket;this.privateBucket=privateBucket;this.publicBucket=publicBucket;this.uploadOrigin=uploadOrigin;
    }
    @Override public PresignedPost createUploadPost(String key,long exactBytes,String contentType,String checksum,String attachmentId,Duration lifetime) {
        var now=clock.instant();String day=DAY.format(now),amz=AMZ.format(now);var creds=credentials.resolveCredentials();
        String scope=day+"/"+region+"/s3/aws4_request",credential=creds.accessKeyId()+"/"+scope;
        Map<String,String> fields=new LinkedHashMap<>();fields.put("key",key);fields.put("Content-Type",contentType);
        fields.put("x-amz-algorithm","AWS4-HMAC-SHA256");fields.put("x-amz-credential",credential);fields.put("x-amz-date",amz);
        fields.put("x-amz-checksum-sha256",Base64.getEncoder().encodeToString(java.util.HexFormat.of().parseHex(checksum)));fields.put("x-amz-meta-sha256",checksum);
        fields.put("x-amz-meta-attachment-id",attachmentId);fields.put("x-amz-server-side-encryption","AES256");
        if(creds instanceof software.amazon.awssdk.auth.credentials.AwsSessionCredentials session)fields.put("x-amz-security-token",session.sessionToken());
        try {
            var conditions=new java.util.ArrayList<Object>();conditions.add(Map.of("bucket",quarantineBucket));
            fields.forEach((k,v)->conditions.add(Map.of(k,v)));conditions.add(List.of("content-length-range",exactBytes,exactBytes));
            String expiration=DateTimeFormatter.ISO_INSTANT.format(now.plus(lifetime).truncatedTo(java.time.temporal.ChronoUnit.MILLIS));
            String policy=Base64.getEncoder().encodeToString(json.writeValueAsBytes(Map.of("expiration",expiration,"conditions",conditions)));
            byte[] dateKey=hmac(("AWS4"+creds.secretAccessKey()).getBytes(StandardCharsets.UTF_8),day),regionKey=hmac(dateKey,region);
            byte[] serviceKey=hmac(regionKey,"s3"),signingKey=hmac(serviceKey,"aws4_request");
            fields.put("policy",policy);fields.put("x-amz-signature",java.util.HexFormat.of().formatHex(hmac(signingKey,policy)));
            return new PresignedPost(URI.create(uploadOrigin+"/"+quarantineBucket),Map.copyOf(fields),now.plus(lifetime));
        } catch(Exception e){throw new IllegalStateException("Could not create scoped upload policy",e);}
    }
    @Override public StoredObject headStaging(String key){return head(quarantineBucket,key,null);}
    @Override public StoredObject pinToPrivate(String stagingKey,String stagingVersion,String privateKey){String source=quarantineBucket+"/"+encode(stagingKey)+(stagingVersion==null?"":"?versionId="+encode(stagingVersion));var c=s3.copyObject(CopyObjectRequest.builder().copySource(source).destinationBucket(privateBucket).destinationKey(privateKey).metadataDirective("COPY").serverSideEncryption("AES256").build());return head(privateBucket,privateKey,c.versionId());}
    @Override public byte[] readPrivate(String key,String version){return s3.getObjectAsBytes(GetObjectRequest.builder().bucket(privateBucket).key(key).versionId(version).build()).asByteArray();}
    @Override public StoredObject writePublicDerivative(String key,byte[] bytes,String contentType){var p=s3.putObject(PutObjectRequest.builder().bucket(publicBucket).key(key).contentType(contentType).serverSideEncryption("AES256").build(),RequestBody.fromBytes(bytes));return head(publicBucket,key,p.versionId());}
    @Override public URI createPrivateDownload(String key,String version,Duration lifetime){var get=GetObjectRequest.builder().bucket(privateBucket).key(key).versionId(version).build();return URI.create(presigner.presignGetObject(GetObjectPresignRequest.builder().signatureDuration(lifetime).getObjectRequest(get).build()).url().toString());}
    @Override public void deleteStaging(String key,String version){s3.deleteObject(b->b.bucket(quarantineBucket).key(key).versionId(version));}
    @Override public void deletePrivate(String key,String version){s3.deleteObject(b->b.bucket(privateBucket).key(key).versionId(version));}
    @Override public boolean privateExists(String key,String version){try{head(privateBucket,key,version);return true;}catch(software.amazon.awssdk.services.s3.model.S3Exception missing){return false;}}
    private StoredObject head(String bucket,String key,String version){var b=HeadObjectRequest.builder().bucket(bucket).key(key).checksumMode("ENABLED");if(version!=null)b.versionId(version);var h=s3.headObject(b.build());return new StoredObject(key,h.versionId(),h.contentLength(),checksum(h.checksumSHA256(),h.metadata().get("sha256")),h.contentType(),h.metadata());}
    private static String checksum(String sdk,String metadata){if(metadata!=null)return metadata.toLowerCase();if(sdk==null)return null;try{return java.util.HexFormat.of().formatHex(Base64.getDecoder().decode(sdk));}catch(IllegalArgumentException ignored){return sdk;}}
    private static byte[] hmac(byte[] key,String value)throws Exception{Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(key,"HmacSHA256"));return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));}
    private static String encode(String value){return URLEncoder.encode(value,StandardCharsets.UTF_8).replace("+","%20").replace("%2F","/");}
}
