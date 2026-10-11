package com.example.takura.shared.web;

import java.util.List;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    private final com.example.takura.identity.infrastructure.StaffRequestPrincipalResolver resolver;
    WebConfiguration(com.example.takura.identity.infrastructure.StaffRequestPrincipalResolver resolver) { this.resolver = resolver; }
    @Override public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) { resolvers.add(resolver); }

    @Bean
    WebServerFactoryCustomizer<TomcatServletWebServerFactory> nio2Connector() {
        return factory -> factory.setProtocol("org.apache.coyote.http11.Http11Nio2Protocol");
    }
}
