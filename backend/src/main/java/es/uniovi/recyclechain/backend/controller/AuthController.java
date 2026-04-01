package es.uniovi.recyclechain.backend.controller;

import es.uniovi.recyclechain.backend.dto.*;
import es.uniovi.recyclechain.backend.model.Role;
import es.uniovi.recyclechain.backend.model.User;
import es.uniovi.recyclechain.backend.security.JwtUtil;
import es.uniovi.recyclechain.backend.service.UserService;
import es.uniovi.recyclechain.backend.service.WalletVerificationService;
import es.uniovi.recyclechain.backend.validator.RegisterValidator;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private RegisterValidator registerValidator;

    @Autowired
    private WalletVerificationService walletVerificationService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, BindingResult result) {
        registerValidator.validate(request, result);
        
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }

        User user = userService.registerUser(
            request.getEmail(),
            request.getPassword(),
            request.getName(),
            request.getWalletAddress()
        );

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        AuthResponse response = new AuthResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole().name(),
            user.getWalletAddress()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = userService.getUserByEmail(request.getEmail());
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

            AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.getWalletAddress()
            );

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/wallet-login")
    public ResponseEntity<?> walletLogin(@Valid @RequestBody WalletLoginRequest request) {
        // Verify the MetaMask signature before authenticating
        boolean isValid = walletVerificationService.verifySignature(
                request.getWalletAddress(),
                request.getMessage(),
                request.getSignature()
        );

        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }

        User user = userService.getUserByWalletAddress(request.getWalletAddress());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Wallet not registered");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.getWalletAddress()
        );

        return ResponseEntity.ok(response);
    }
}