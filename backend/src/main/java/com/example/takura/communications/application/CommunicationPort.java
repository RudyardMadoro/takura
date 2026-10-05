package com.example.takura.communications.application;

public interface CommunicationPort {
    void sendToTestSink(String templateCode, String syntheticRecipient);
}
