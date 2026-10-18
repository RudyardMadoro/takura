package com.example.takura.media.application;

import java.net.URI;
import java.time.Duration;
import java.util.Map;

public interface ObjectStoragePort {
    PresignedPost createUploadPost(String key, long exactBytes, String contentType,
                                   String checksumSha256, String attachmentId, Duration lifetime);
    StoredObject headStaging(String key);
    StoredObject pinToPrivate(String stagingKey, String stagingVersion, String privateKey);
    byte[] readPrivate(String key, String version);
    StoredObject writePublicDerivative(String key, byte[] bytes, String contentType);
    URI createPrivateDownload(String key, String version, Duration lifetime);
    void deleteStaging(String key, String version);
    void deletePrivate(String key, String version);
    boolean privateExists(String key, String version);

    record PresignedPost(URI url, Map<String,String> fields, java.time.Instant expiresAt) {}
    record StoredObject(String key, String version, long byteSize, String checksumSha256,
                        String contentType, Map<String,String> metadata) {}
}
