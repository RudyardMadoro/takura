package com.example.takura.media.application;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.Duration;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class AttachmentScanWorker {
    private final JdbcTemplate jdbc; private final TransactionTemplate tx; private final ObjectStoragePort storage; private final MalwareScanner scanner; private final Clock clock;
    public AttachmentScanWorker(JdbcTemplate jdbc,TransactionTemplate tx,ObjectStoragePort storage,MalwareScanner scanner,Clock clock){this.jdbc=jdbc;this.tx=tx;this.storage=storage;this.scanner=scanner;this.clock=clock;}
    public int runOnce(){var job=lease();if(job==null)return 0;MalwareScanner.Result result;try{result=scanner.scan(storage.readPrivate(job.privateKey(),job.privateVersion()));}catch(RuntimeException e){retry(job,"SCANNER_UNAVAILABLE");return 1;}if(result.status()==MalwareScanner.Result.Status.CLEAN)clean(job);else if(result.status()==MalwareScanner.Result.Status.REJECTED)reject(job,"MALWARE_REJECTED");else retry(job,result.status().name());return 1;}
    private Job lease(){return tx.execute(status->{var jobs=jdbc.query("SELECT j.attachment_id,a.private_key,a.private_version,j.attempts FROM takura.attachment_scan_job j JOIN takura.attachment a ON a.id=j.attachment_id WHERE j.state IN ('PENDING','LEASED') AND j.next_attempt_at<=? AND (j.lease_until IS NULL OR j.lease_until<?) ORDER BY j.created_at FOR UPDATE SKIP LOCKED LIMIT 1",(rs,n)->new Job((UUID)rs.getObject(1),rs.getString(2),rs.getString(3),rs.getInt(4)),Timestamp.from(clock.instant()),Timestamp.from(clock.instant()));if(jobs.isEmpty())return null;var j=jobs.getFirst();jdbc.update("UPDATE takura.attachment_scan_job SET state='LEASED',lease_until=?,attempts=attempts+1 WHERE attachment_id=?",Timestamp.from(clock.instant().plus(Duration.ofMinutes(2))),j.attachmentId());return j;});}
    private void clean(Job j){tx.executeWithoutResult(status->{jdbc.update("UPDATE takura.attachment SET state='CLEAN',scan_completed_at=?,rejection_code=NULL,revision=revision+1 WHERE id=? AND state='SCAN_PENDING'",Timestamp.from(clock.instant()),j.attachmentId());jdbc.update("UPDATE takura.attachment_scan_job SET state='COMPLETED',lease_until=NULL,last_result='CLEAN',completed_at=? WHERE attachment_id=?",Timestamp.from(clock.instant()),j.attachmentId());});}
    private void reject(Job j,String code){tx.executeWithoutResult(status->{jdbc.update("UPDATE takura.attachment SET state='REJECTED',scan_completed_at=?,rejection_code=?,revision=revision+1 WHERE id=?",Timestamp.from(clock.instant()),code,j.attachmentId());jdbc.update("UPDATE takura.attachment_scan_job SET state='COMPLETED',lease_until=NULL,last_result=?,completed_at=? WHERE attachment_id=?",code,Timestamp.from(clock.instant()),j.attachmentId());jdbc.update("INSERT INTO takura.notification_outbox(id,event_type,aggregate_id,semantic_key,payload,next_attempt_at,created_at) SELECT ?, 'ATTACHMENT_REPLACEMENT_REQUIRED', enquiry_id, ?, '{\"template\":\"attachment-replacement-required\"}'::jsonb, ?, ? FROM takura.attachment WHERE id=? AND enquiry_id IS NOT NULL ON CONFLICT(semantic_key) DO NOTHING",UUID.randomUUID(),"attachment-replacement:"+j.attachmentId(),Timestamp.from(clock.instant()),Timestamp.from(clock.instant()),j.attachmentId());});}
    private void retry(Job j,String code){jdbc.update("UPDATE takura.attachment_scan_job SET state='PENDING',lease_until=NULL,last_result=?,next_attempt_at=? WHERE attachment_id=?",code,Timestamp.from(clock.instant().plus(Duration.ofMinutes(Math.min(30,j.attempts()+1)))),j.attachmentId());}
    private record Job(UUID attachmentId,String privateKey,String privateVersion,int attempts){}
}
