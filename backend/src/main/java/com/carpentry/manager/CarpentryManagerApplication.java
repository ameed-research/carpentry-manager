package com.carpentry.manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class CarpentryManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarpentryManagerApplication.class, args);
    }

}
