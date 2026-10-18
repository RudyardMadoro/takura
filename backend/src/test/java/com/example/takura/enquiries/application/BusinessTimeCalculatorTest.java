package com.example.takura.enquiries.application;
import static org.assertj.core.api.Assertions.assertThat;
import java.time.*;import java.util.Set;import org.junit.jupiter.api.Test;
class BusinessTimeCalculatorTest {
 private final BusinessTimeCalculator clock=new BusinessTimeCalculator(); private final ZoneId zone=ZoneId.of("Africa/Johannesburg");
 @Test void mondayTenIsDueTuesdayTen(){var start=ZonedDateTime.of(2026,10,12,10,0,0,0,zone).toInstant();assertThat(clock.addBusinessHours(start,Duration.ofHours(9),zone,LocalTime.of(8,0),LocalTime.of(17,0),Set.of())).isEqualTo(ZonedDateTime.of(2026,10,13,10,0,0,0,zone).toInstant());}
 @Test void sundayStartsMondayAndIsDueAtClose(){var start=ZonedDateTime.of(2026,10,11,10,0,0,0,zone).toInstant();assertThat(clock.addBusinessHours(start,Duration.ofHours(9),zone,LocalTime.of(8,0),LocalTime.of(17,0),Set.of())).isEqualTo(ZonedDateTime.of(2026,10,12,17,0,0,0,zone).toInstant());}
 @Test void holidayAndTimezoneBoundaryAreDeterministic(){var start=ZonedDateTime.of(2026,12,24,16,0,0,0,zone).toInstant();assertThat(clock.addBusinessHours(start,Duration.ofHours(2),zone,LocalTime.of(8,0),LocalTime.of(17,0),Set.of(LocalDate.of(2026,12,25)))).isEqualTo(ZonedDateTime.of(2026,12,28,9,0,0,0,zone).toInstant());}
}
