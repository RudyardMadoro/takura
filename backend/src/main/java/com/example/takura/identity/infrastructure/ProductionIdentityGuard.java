package com.example.takura.identity.infrastructure;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
@Component class ProductionIdentityGuard implements ApplicationRunner {
 private final Environment environment;private final boolean localProvider;
 ProductionIdentityGuard(Environment environment,@Value("${takura.security.local-provider-enabled:false}")boolean localProvider){this.environment=environment;this.localProvider=localProvider;}
 @Override public void run(ApplicationArguments args){if(localProvider&&Arrays.asList(environment.getActiveProfiles()).contains("production"))throw new IllegalStateException("The development OIDC provider is forbidden in production");}
}
