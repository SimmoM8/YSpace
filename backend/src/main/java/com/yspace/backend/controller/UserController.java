package com.yspace.backend.controller;

import com.yspace.backend.dto.RegisterRequestDto;
import com.yspace.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDto request){
        userService.register(request);

        return ResponseEntity.ok("User registered successfully");
    }
}
