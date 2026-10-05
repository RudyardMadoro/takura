package com.example.takura;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.not;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:security-test",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.flyway.enabled=false"
})
class SecurityAndHealthTest {
    @Autowired MockMvc mvc;

    @Test
    void publicHealthIsMinimalAndCorrelated() throws Exception {
        mvc.perform(get("/api/v1/health").header("X-Correlation-ID", "safe-test-id"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Correlation-ID", "safe-test-id"))
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void hostileCorrelationValueIsNotReflected() throws Exception {
        mvc.perform(get("/api/v1/health").header("X-Correlation-ID", "hostile value with spaces"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Correlation-ID", not("hostile value with spaces")));
    }

    @Test
    void privateEndpointDeniesAnonymousRequests() throws Exception {
        mvc.perform(get("/api/v1/admin/probe")).andExpect(status().isUnauthorized());
    }
}
