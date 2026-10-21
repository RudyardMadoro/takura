package com.example.takura.quotations.application;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class QuoteSecretProtector {
    private final byte[] key;
    private final SecureRandom random = new SecureRandom();

    public QuoteSecretProtector(@Value("${takura.quote.delivery-key:}") String encoded) {
        this.key = encoded.isBlank() ? null : Base64.getDecoder().decode(encoded);
    }

    public ProtectedSecret protect(String token) {
        if (key == null || key.length != 32) throw new IllegalStateException("A 256-bit quote delivery key is required before issue.");
        try {
            byte[] nonce = new byte[12]; random.nextBytes(nonce);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, nonce));
            return new ProtectedSecret(cipher.doFinal(token.getBytes(StandardCharsets.UTF_8)), nonce);
        } catch (Exception e) { throw new IllegalStateException("Quote delivery secret protection failed", e); }
    }

    public String unprotect(byte[] ciphertext, byte[] nonce) {
        if (key == null || key.length != 32) throw new IllegalStateException("A 256-bit quote delivery key is required.");
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, nonce));
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (Exception e) { throw new IllegalStateException("Quote delivery secret recovery failed", e); }
    }

    public record ProtectedSecret(byte[] ciphertext, byte[] nonce) {}
}
