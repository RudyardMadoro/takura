package com.example.takura;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class TakuraApplication {
    public static void main(String[] args) {
        SpringApplication.run(TakuraApplication.class, args);
    }
}
