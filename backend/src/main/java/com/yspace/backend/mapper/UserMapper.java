package com.yspace.backend.mapper;

import com.yspace.backend.dto.RegisterRequestDto;
import com.yspace.backend.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public User toEntity(RegisterRequestDto dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        return user;
    }
}
