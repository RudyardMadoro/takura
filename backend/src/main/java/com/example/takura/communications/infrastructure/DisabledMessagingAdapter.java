package com.example.takura.communications.infrastructure;
import com.example.takura.communications.application.MessagingPort;
import org.springframework.stereotype.Component;
@Component public final class DisabledMessagingAdapter implements MessagingPort {
 public ProviderResult sendSms(String t,String d){throw new IllegalStateException("SMS is disabled");}
 public ProviderResult sendWhatsApp(String t,String d){throw new IllegalStateException("WhatsApp is disabled");}
 public boolean verifyCallback(byte[] b,String s,String u){return false;}
}
