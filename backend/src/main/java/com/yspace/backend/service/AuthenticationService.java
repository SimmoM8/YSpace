package com.yspace.backend.service;

import com.yspace.backend.dto.AuthResponseDto;
import com.yspace.backend.dto.LoginRequestDto;
import com.yspace.backend.mapper.AuthMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuthMapper authMapper;

    public AuthenticationService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            AuthMapper authMapper
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.authMapper = authMapper;
    }

    public AuthResponseDto login(LoginRequestDto request) {
        Authentication authentication = authenticationManager.authenticate
                (
                        UsernamePasswordAuthenticationToken
                                .unauthenticated(
                                        request.getEmail(),
                                        request.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.createToken(userDetails);

        return authMapper.toDto(token);
    }
}