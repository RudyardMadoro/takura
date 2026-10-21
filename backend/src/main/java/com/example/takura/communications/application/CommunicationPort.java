package com.example.takura.communications.application;

public interface CommunicationPort {
    void sendToTestSink(String templateCode, String syntheticRecipient);
    default void sendQuoteToTestSink(String templateCode, String syntheticRecipient, String customerUrl) {
        sendToTestSink(templateCode, syntheticRecipient);
    }
}
