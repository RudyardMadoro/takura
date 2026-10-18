package com.example.takura.media.infrastructure;

import java.net.URI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
class StorageConfiguration {
    @Bean AwsCredentialsProvider storageCredentials(@Value("${takura.storage.access-key:}") String access,
            @Value("${takura.storage.secret-key:}") String secret) {
        return access.isBlank() ? DefaultCredentialsProvider.create()
                : StaticCredentialsProvider.create(AwsBasicCredentials.create(access, secret));
    }
    @Bean S3Client s3Client(AwsCredentialsProvider credentials,
            @Value("${takura.storage.region:us-east-1}") String region,
            @Value("${takura.storage.endpoint:}") String endpoint) {
        var builder = S3Client.builder().credentialsProvider(credentials).region(Region.of(region))
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(!endpoint.isBlank()).build());
        if (!endpoint.isBlank()) builder.endpointOverride(URI.create(endpoint));
        return builder.build();
    }
    @Bean S3Presigner s3Presigner(AwsCredentialsProvider credentials,
            @Value("${takura.storage.region:us-east-1}") String region,
            @Value("${takura.storage.endpoint:}") String endpoint) {
        var builder = S3Presigner.builder().credentialsProvider(credentials).region(Region.of(region))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(!endpoint.isBlank()).build());
        if (!endpoint.isBlank()) builder.endpointOverride(URI.create(endpoint));
        return builder.build();
    }
}
