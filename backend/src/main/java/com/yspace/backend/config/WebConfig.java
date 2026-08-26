package com.yspace.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Apply to ALL endpoints (/** means everything)
                .allowedOrigins("*") // Allow any frontend origin
                .allowedMethods("*") // Allow GET, POST, PUT, DELETE, etc.
                .allowedHeaders("*"); // Allow all headers
    }
}
