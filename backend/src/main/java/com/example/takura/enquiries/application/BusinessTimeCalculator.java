package com.example.takura.enquiries.application;

import java.time.*;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class BusinessTimeCalculator {
    public Instant addBusinessHours(Instant submitted, Duration target, ZoneId zone, LocalTime opens,
            LocalTime closes, Set<LocalDate> holidays) {
        ZonedDateTime cursor = submitted.atZone(zone);
        Duration remaining = target;
        while (!remaining.isZero()) {
            cursor = nextOpen(cursor, opens, closes, holidays);
            ZonedDateTime close = cursor.toLocalDate().atTime(closes).atZone(zone);
            Duration available = Duration.between(cursor, close);
            if (!remaining.minus(available).isPositive()) return cursor.plus(remaining).toInstant();
            remaining = remaining.minus(available);
            cursor = close.plusNanos(1);
        }
        return cursor.toInstant();
    }

    private ZonedDateTime nextOpen(ZonedDateTime value, LocalTime opens, LocalTime closes,
            Set<LocalDate> holidays) {
        ZonedDateTime cursor = value;
        while (!businessDay(cursor.toLocalDate(), holidays) || !cursor.toLocalTime().isBefore(closes)) {
            cursor = cursor.toLocalDate().plusDays(1).atTime(opens).atZone(cursor.getZone());
        }
        if (cursor.toLocalTime().isBefore(opens)) cursor = cursor.toLocalDate().atTime(opens).atZone(cursor.getZone());
        return cursor;
    }

    private boolean businessDay(LocalDate date, Set<LocalDate> holidays) {
        return date.getDayOfWeek() != DayOfWeek.SATURDAY && date.getDayOfWeek() != DayOfWeek.SUNDAY
                && !holidays.contains(date);
    }
}
