package com.example.takura.shared.web;

import org.springframework.boot.actuate.autoconfigure.web.ManagementContextConfiguration;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;

@ManagementContextConfiguration(proxyBeanMethods = false)
public class ManagementConnectorConfiguration {
    @Bean
    WebServerFactoryCustomizer<TomcatServletWebServerFactory> managementNio2Connector() {
        return factory -> factory.setProtocol("org.apache.coyote.http11.Http11Nio2Protocol");
    }
}
