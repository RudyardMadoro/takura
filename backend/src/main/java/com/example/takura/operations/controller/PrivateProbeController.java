package com.example.takura.operations.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
class PrivateProbeController {
    @GetMapping("/probe")
    Map<String, String> probe() {
        return Map.of("status", "private");
    }
}
