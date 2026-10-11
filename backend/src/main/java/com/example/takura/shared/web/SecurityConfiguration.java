package com.example.takura.shared.web;

import com.example.takura.identity.infrastructure.StaffSessionFilter;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
class SecurityConfiguration {
    @Bean SecurityFilterChain applicationSecurity(HttpSecurity http, StaffSessionFilter sessionFilter,
            CorsConfigurationSource corsConfigurationSource) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/v1/health", "/api/v1/public/config").permitAll()
                        .requestMatchers("/actuator/health/liveness", "/actuator/health/readiness").permitAll()
                        .requestMatchers("/dev-oidc/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/session").authenticated()
                        .requestMatchers("/api/v1/admin/**").authenticated()
                        .anyRequest().denyAll())
                .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> {})
                        .authenticationEntryPoint((request, response, exception) -> response.sendError(HttpServletResponse.SC_UNAUTHORIZED)))
                .addFilterAfter(sessionFilter, BearerTokenAuthenticationFilter.class)
                .httpBasic(basic -> basic.disable()).formLogin(form -> form.disable()).build();
    }

    @Bean JwtDecoder jwtDecoder(@Value("${takura.security.oidc.issuer}") String issuer,
            @Value("${takura.security.oidc.jwk-set-uri:}") String jwkSetUri,
            @Value("${takura.security.oidc.client-id}") String clientId,
            @Value("${takura.security.oidc.audience}") String audience,
            @Value("${takura.security.oidc.required-scope:takura.staff}") String requiredScope) {
        JwtDecoder decoder = jwkSetUri.isBlank() ? JwtDecoders.fromIssuerLocation(issuer)
                : NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        if (decoder instanceof NimbusJwtDecoder nimbus) {
            OAuth2TokenValidator<Jwt> contract = jwt -> validateContract(jwt, clientId, audience, requiredScope);
            nimbus.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefaultWithIssuer(issuer), contract));
        }
        return decoder;
    }

    static OAuth2TokenValidatorResult validateContract(Jwt jwt,String clientId,String audience,String requiredScope) {
        String scope=jwt.getClaimAsString("scope");Object amr=jwt.getClaim("amr");boolean valid=jwt.getAudience().contains(audience)
                &&clientId.equals(jwt.getClaimAsString("client_id"))&&"access".equals(jwt.getClaimAsString("token_use"))
                &&scope!=null&&List.of(scope.split(" ")).contains(requiredScope)&&jwt.getClaim("auth_time")!=null
                &&amr instanceof List<?> methods&&methods.contains("mfa");
        return valid?OAuth2TokenValidatorResult.success():OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token","Required access-token claims are invalid",null));
    }

    @Bean CorsConfigurationSource corsConfigurationSource(
            @Value("${takura.security.allowed-origins:http://localhost:4201}") List<String> origins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "If-Match", "X-Correlation-ID", "X-Staff-Session"));
        config.setExposedHeaders(List.of("ETag", "X-Correlation-ID"));
        config.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
