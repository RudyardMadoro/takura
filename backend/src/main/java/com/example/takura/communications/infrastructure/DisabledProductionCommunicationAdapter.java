package com.example.takura.communications.infrastructure;

import com.example.takura.communications.application.CommunicationPort;
import com.example.takura.communications.application.DeliveryFailure;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("production")
@ConditionalOnProperty(name="takura.communications.ses.enabled",havingValue="false",matchIfMissing=true)
public final class DisabledProductionCommunicationAdapter implements CommunicationPort {
    @Override public void sendToTestSink(String templateCode,String recipient) {
        throw new DeliveryFailure(DeliveryFailure.Kind.PERMANENT,"COMMUNICATION_DISABLED",null);
    }
}
