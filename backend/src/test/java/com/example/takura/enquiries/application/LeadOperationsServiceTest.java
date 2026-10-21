package com.example.takura.enquiries.application;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class LeadOperationsServiceTest {
    @Test void exactStateTablePermitsRequiredBoardBypassAndRejectsUnsafeJumps() {
        assertThat(LeadOperationsService.allowsTransition("CONTACTED", "QUOTE_IN_PREPARATION")).isTrue();
        assertThat(LeadOperationsService.allowsTransition("NEW", "QUOTE_SENT")).isFalse();
        assertThat(LeadOperationsService.allowsTransition("QUOTE_IN_PREPARATION", "QUOTE_SENT")).isTrue();
        assertThat(LeadOperationsService.allowsTransition("WON", "CONTACTED")).isFalse();
    }

    @Test void terminalStatesOnlyReopenToContacted() {
        assertThat(LeadOperationsService.allowsTransition("CLOSED", "CONTACTED")).isTrue();
        assertThat(LeadOperationsService.allowsTransition("SPAM", "CONTACTED")).isTrue();
        assertThat(LeadOperationsService.allowsTransition("CLOSED", "NEW")).isFalse();
    }
}
