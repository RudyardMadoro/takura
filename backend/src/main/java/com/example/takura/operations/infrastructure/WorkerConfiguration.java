package com.example.takura.operations.infrastructure;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@Profile("worker")
class WorkerConfiguration {
    @Bean
    Clock workerClock() {
        return Clock.systemUTC();
    }

    /** Scheduling anchor for future bounded outbox leases; deliberately performs no external work in phase 01. */
    @Scheduled(fixedDelayString = "${takura.worker.poll-delay-ms:5000}")
    void poll() {
        // Worker contracts arrive with vertical slices. No request path or provider call is created here.
    }
}
