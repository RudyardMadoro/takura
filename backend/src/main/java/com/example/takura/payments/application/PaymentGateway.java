package com.example.takura.payments.application;

/** Extension contract only. R1 has no checkout routes and payment_enabled remains false. */
public interface PaymentGateway {
    String createHostedPayment(String immutableQuoteRevisionId);
    boolean verifyNotification(byte[] body, String signature);
    String fetchStatus(String providerReference);
    void refund(String providerReference, String exactAmount, String currency);
}
