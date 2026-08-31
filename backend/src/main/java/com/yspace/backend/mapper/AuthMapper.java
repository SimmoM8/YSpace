package com.yspace.backend.mapper;

import com.yspace.backend.dto.AuthResponseDto;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {
    public AuthResponseDto toDto(String token){
        return new AuthResponseDto(token);
    }
}
