package com.example.takura.identity.infrastructure;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class IdentityClockConfiguration {
    @Bean Clock clock() { return Clock.systemUTC(); }
}
