package com.example.takura.media.infrastructure;
import com.example.takura.media.application.MalwareScanner;import org.springframework.context.annotation.Profile;import org.springframework.stereotype.Component;
@Component @Profile("test-controlled-scan") public class ControlledScanAdapter implements MalwareScanner{
 @Override public Result scan(byte[] bytes){String value=new String(bytes,java.nio.charset.StandardCharsets.US_ASCII);if(value.contains("SYNTHETIC_REJECT"))return new Result(Result.Status.REJECTED,"controlled-test-v1");if(value.contains("SYNTHETIC_OUTAGE"))return new Result(Result.Status.UNAVAILABLE,"controlled-test-v1");return new Result(Result.Status.CLEAN,"controlled-test-v1");}
}
