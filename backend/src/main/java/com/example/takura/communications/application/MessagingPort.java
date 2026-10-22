package com.example.takura.communications.application;

/** Disabled-by-default future messaging boundary; no R1 route invokes it. */
public interface MessagingPort {
    ProviderResult sendSms(String approvedTemplate,String syntheticDestination);
    ProviderResult sendWhatsApp(String approvedTemplate,String syntheticDestination);
    boolean verifyCallback(byte[] body,String signature,String requestUrl);
    record ProviderResult(String providerReference,String state) {}
}
