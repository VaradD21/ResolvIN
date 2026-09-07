package com.resolvedesk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ResolveDeskApplication {
    public static void main(String[] args) {
        SpringApplication.run(ResolveDeskApplication.class, args);
    }
}
