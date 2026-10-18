package com.example.takura.operations.infrastructure;

import com.example.takura.communications.application.OutboxWorker;
import com.example.takura.media.application.AttachmentScanWorker;
import com.example.takura.media.application.StorageMaintenanceWorker;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@Profile("worker")
class WorkerConfiguration {
    private final OutboxWorker outbox; private final AttachmentScanWorker scans; private final StorageMaintenanceWorker storage;
    WorkerConfiguration(OutboxWorker outbox,AttachmentScanWorker scans,StorageMaintenanceWorker storage) { this.outbox = outbox; this.scans = scans; this.storage=storage; }
    @Scheduled(fixedDelayString = "${takura.worker.poll-delay-ms:5000}")
    void poll() {
        outbox.runOnce();
        scans.runOnce();
        storage.cleanupOnce();
    }
    @Scheduled(fixedDelayString = "${takura.worker.reconcile-delay-ms:3600000}") void reconcile(){storage.reconcileOnce();}
}
