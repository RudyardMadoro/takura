package com.example.takura.communications.infrastructure;

import com.example.takura.communications.application.CommunicationPort;
import com.example.takura.communications.application.DeliveryFailure;
import java.time.Duration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.exception.ApiCallTimeoutException;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.*;

@Component
@Profile("production")
@ConditionalOnProperty(name="takura.communications.ses.enabled",havingValue="true")
public final class SesCommunicationAdapter implements CommunicationPort {
    private final SesV2Client ses;
    private final String sender;
    private final ThreadLocal<String> lastReference = new ThreadLocal<>();

    public SesCommunicationAdapter(
        @org.springframework.beans.factory.annotation.Value("${takura.communications.ses.sender}") String sender,
        @org.springframework.beans.factory.annotation.Value("${takura.communications.ses.region:af-south-1}") String region) {
        if (sender.endsWith("@example.invalid")) throw new IllegalStateException("Production SES sender must be approved");
        this.sender=sender;
        this.ses=SesV2Client.builder().region(software.amazon.awssdk.regions.Region.of(region))
            .overrideConfiguration(c->c.apiCallTimeout(Duration.ofSeconds(10))).build();
    }

    @Override public void sendToTestSink(String templateCode,String recipient) { send(templateCode,recipient,null); }
    @Override public void sendQuoteToTestSink(String templateCode,String recipient,String customerUrl) { send(templateCode,recipient,customerUrl); }

    private void send(String template,String recipient,String safeLink) {
        String subject=switch(template){case "quote-issued"->"Your quotation is ready";case "enquiry-acknowledgement"->"We received your request";default->"Takura service update";};
        String body="Reference update from Takura. "+(safeLink==null?"We will contact you using your selected route.":"Open your secure quotation: "+safeLink);
        try {
            var result=ses.sendEmail(SendEmailRequest.builder().fromEmailAddress(sender).destination(Destination.builder().toAddresses(recipient).build())
                .content(EmailContent.builder().simple(Message.builder().subject(Content.builder().data(subject).build())
                    .body(Body.builder().text(Content.builder().data(body).build()).build()).build()).build()).build());
            lastReference.set(result.messageId());
        } catch (TooManyRequestsException e) {
            throw new DeliveryFailure(DeliveryFailure.Kind.TRANSIENT,"SES_TRANSIENT",e);
        } catch (ApiCallTimeoutException e) {
            throw new DeliveryFailure(DeliveryFailure.Kind.UNKNOWN,"SES_TIMEOUT_UNKNOWN",e);
        } catch (SesV2Exception e) {
            throw new DeliveryFailure(e.statusCode()>=500?DeliveryFailure.Kind.TRANSIENT:DeliveryFailure.Kind.PERMANENT,"SES_REJECTED",e);
        }
    }
    @Override public String lastProviderReference(){String value=lastReference.get();lastReference.remove();return value;}
}
