package com.example.takura.operations.infrastructure;

import com.example.takura.communications.application.OutboxWorker;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@Profile("worker")
class WorkerConfiguration {
    private final OutboxWorker outbox;
    WorkerConfiguration(OutboxWorker outbox) { this.outbox = outbox; }
    @Scheduled(fixedDelayString = "${takura.worker.poll-delay-ms:5000}")
    void poll() {
        outbox.runOnce();
    }
}
