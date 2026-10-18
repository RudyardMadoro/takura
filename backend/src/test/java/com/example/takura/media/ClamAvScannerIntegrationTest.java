package com.example.takura.media;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.takura.media.application.MalwareScanner;
import com.example.takura.media.infrastructure.ClamAvScanner;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

class ClamAvScannerIntegrationTest {
    @Test void scansSafeAndStandardEicarFixturesWhenLocalClamAvIsAvailable() throws Exception {
        try(var socket=new Socket()){socket.connect(new InetSocketAddress("127.0.0.1",13310),500);}catch(Exception unavailable){Assumptions.abort("Local ClamAV is not available");}
        var scanner=new ClamAvScanner("127.0.0.1",13310,10000);
        assertThat(scanner.scan("Takura synthetic safe fixture".getBytes(StandardCharsets.UTF_8)).status()).isEqualTo(MalwareScanner.Result.Status.CLEAN);
        String eicar="X5O!P%@AP[4\\PZX54(P^)7CC)7}$"+"EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";
        assertThat(scanner.scan(eicar.getBytes(StandardCharsets.US_ASCII)).status()).isEqualTo(MalwareScanner.Result.Status.REJECTED);
    }
}
