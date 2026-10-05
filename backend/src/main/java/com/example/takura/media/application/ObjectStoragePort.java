package com.example.takura.media.application;

import java.net.URI;
import java.time.Duration;

public interface ObjectStoragePort {
    URI createUploadCapability(String syntheticObjectKey, long maximumBytes, Duration lifetime);
}
