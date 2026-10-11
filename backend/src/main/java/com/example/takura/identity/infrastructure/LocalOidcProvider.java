package com.example.takura.identity.infrastructure;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.proc.SecurityContext;
import java.math.BigInteger;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Configuration @Profile("local")
@ConditionalOnProperty(name="takura.security.local-provider-enabled",havingValue="true")
class LocalOidcProvider {
    @Bean RSAKey localOidcKey() throws Exception {var pair=KeyPairGenerator.getInstance("RSA");pair.initialize(2048);var keys=pair.generateKeyPair();return new RSAKey.Builder((RSAPublicKey)keys.getPublic()).privateKey((RSAPrivateKey)keys.getPrivate()).keyID(UUID.randomUUID().toString()).build();}
    @Bean JwtEncoder localJwtEncoder(RSAKey key){return new NimbusJwtEncoder(new ImmutableJWKSet<SecurityContext>(new JWKSet(key)));}
}

@RestController @Profile("local")
@ConditionalOnProperty(name="takura.security.local-provider-enabled",havingValue="true")
class LocalOidcController {
    private static final String ISSUER="http://127.0.0.1:8080/dev-oidc";
    private static final Map<String,String> IDENTITIES=Map.of("owner","demo-owner","coordinator","demo-coordinator","estimator","demo-estimator","approver","demo-approver","editor","demo-editor","reviewer","demo-reviewer");
    private final RSAKey key; private final JwtEncoder encoder; private final Map<String,Code> codes=new ConcurrentHashMap<>();
    LocalOidcController(RSAKey key,JwtEncoder encoder){this.key=key;this.encoder=encoder;}
    @GetMapping("/dev-oidc/.well-known/openid-configuration") Map<String,Object> discovery(){return Map.of("issuer",ISSUER,"authorization_endpoint",ISSUER+"/authorize","token_endpoint",ISSUER+"/token","jwks_uri",ISSUER+"/jwks","response_types_supported",Set.of("code"),"subject_types_supported",Set.of("public"),"id_token_signing_alg_values_supported",Set.of("RS256"),"code_challenge_methods_supported",Set.of("S256"));}
    @GetMapping("/dev-oidc/jwks") Map<String,Object> jwks(){return new JWKSet(key.toPublicJWK()).toJSONObject();}
    @GetMapping("/dev-oidc/authorize") ResponseEntity<Void> authorize(@RequestParam("redirect_uri")String redirect,@RequestParam String state,@RequestParam String nonce,@RequestParam("code_challenge")String challenge,@RequestParam(value="login_hint",defaultValue="owner")String identity,@RequestParam(value="mfa",defaultValue="true")boolean mfa){if(!redirect.startsWith("http://localhost:4201/")&&!redirect.startsWith("http://127.0.0.1:4201/"))return ResponseEntity.badRequest().build();String subject=IDENTITIES.get(identity);if(subject==null)return ResponseEntity.badRequest().build();String code=UUID.randomUUID().toString();codes.put(code,new Code(subject,nonce,challenge,mfa,Instant.now()));return ResponseEntity.status(302).location(URI.create(redirect+"?code="+code+"&state="+state)).build();}
    @PostMapping(value="/dev-oidc/token",consumes=MediaType.APPLICATION_FORM_URLENCODED_VALUE) ResponseEntity<?> token(@RequestBody MultiValueMap<String,String> form)throws Exception{Code code=codes.remove(form.getFirst("code"));String verifier=form.getFirst("code_verifier");if(code==null||verifier==null||!challenge(verifier).equals(code.challenge)||code.created.isBefore(Instant.now().minusSeconds(120)))return ResponseEntity.status(400).body(Map.of("error","invalid_grant"));Instant now=Instant.now();var accessClaims=JwtClaimsSet.builder().issuer(ISSUER).subject(code.subject).audience(java.util.List.of("takura-api")).issuedAt(now).notBefore(now).expiresAt(now.plusSeconds(600)).claim("client_id","takura-staff-local").claim("token_use","access").claim("scope","takura.staff").claim("auth_time",code.created.getEpochSecond()).claim("amr",code.mfa?java.util.List.of("pwd","mfa"):java.util.List.of("pwd")).build();var idClaims=JwtClaimsSet.builder().issuer(ISSUER).subject(code.subject).audience(java.util.List.of("takura-staff-local")).issuedAt(now).expiresAt(now.plusSeconds(600)).claim("nonce",code.nonce).claim("auth_time",code.created.getEpochSecond()).claim("amr",code.mfa?java.util.List.of("pwd","mfa"):java.util.List.of("pwd")).build();var header=JwsHeader.with(SignatureAlgorithm.RS256).keyId(key.getKeyID()).build();String access=encoder.encode(JwtEncoderParameters.from(header,accessClaims)).getTokenValue();String id=encoder.encode(JwtEncoderParameters.from(header,idClaims)).getTokenValue();return ResponseEntity.ok(Map.of("access_token",access,"id_token",id,"token_type","Bearer","expires_in",600,"scope","takura.staff"));}
    private static String challenge(String verifier)throws Exception{return Base64.getUrlEncoder().withoutPadding().encodeToString(MessageDigest.getInstance("SHA-256").digest(verifier.getBytes(StandardCharsets.US_ASCII)));}
    private record Code(String subject,String nonce,String challenge,boolean mfa,Instant created){}
}
