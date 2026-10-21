package com.example.takura;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.sql.DriverManager;
import java.sql.SQLException;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class PostgresqlMigrationTest {
    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17.11-alpine3.24");

    @Test
    void migrationsAreIdempotentAndRuntimeCannotChangeSchema() throws Exception {
        try (var admin = DriverManager.getConnection(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
             var statement = admin.createStatement()) {
            statement.execute("CREATE ROLE takura_migrator LOGIN PASSWORD 'migration-test' NOSUPERUSER NOCREATEDB NOCREATEROLE");
            statement.execute("CREATE ROLE takura_runtime LOGIN PASSWORD 'runtime-test' NOSUPERUSER NOCREATEDB NOCREATEROLE");
            statement.execute("GRANT CONNECT ON DATABASE " + POSTGRES.getDatabaseName() + " TO takura_migrator, takura_runtime");
            statement.execute("GRANT CREATE ON DATABASE " + POSTGRES.getDatabaseName() + " TO takura_migrator");
            statement.execute("CREATE SCHEMA takura AUTHORIZATION takura_migrator");
        }
        Flyway flyway = Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), "takura_migrator", "migration-test")
                .locations("classpath:db/migration")
                .defaultSchema("takura")
                .schemas("takura")
                .load();
        assertThat(flyway.migrate().migrationsExecuted).isEqualTo(8);
        assertThat(flyway.migrate().migrationsExecuted).isZero();

        try (var runtime = DriverManager.getConnection(POSTGRES.getJdbcUrl(), "takura_runtime", "runtime-test");
             var statement = runtime.createStatement()) {
            assertThat(statement.executeQuery("SELECT count(*) FROM takura.service_code").next()).isTrue();
            assertThat(statement.executeQuery("SELECT count(*) FROM takura.board_variant").next()).isTrue();
            assertThat(statement.executeQuery("SELECT count(*) FROM takura.notification_outbox").next()).isTrue();
            assertThat(statement.executeQuery("SELECT count(*) FROM takura.enquiry_service_detail").next()).isTrue();
            assertThat(statement.executeQuery("SELECT count(*) FROM takura.assessment").next()).isTrue();
            assertThat(statement.executeQuery("SELECT count(*) FROM takura.operational_audit").next()).isTrue();
            assertThrows(SQLException.class, () -> statement.execute("DROP TABLE takura.service_code"));
            assertThrows(SQLException.class, () -> statement.execute("CREATE TABLE takura.forbidden(id integer)"));
        }
    }
}
