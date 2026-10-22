package com.example.takura.communications.infrastructure;

import com.example.takura.communications.application.CommunicationPort;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("local | test")
public class LocalTestSinkCommunicationAdapter implements CommunicationPort {
    private final Set<String> deliveredKeys = ConcurrentHashMap.newKeySet();
    private static final String SINK = "mailpit@example.invalid";

    @Override
    public void sendToTestSink(String templateCode, String syntheticRecipient) {
        deliveredKeys.add(templateCode + ":" + SINK);
    }
}
