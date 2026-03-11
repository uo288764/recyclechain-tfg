package es.uniovi.recyclechain.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserResponse {

    // Getters y Setters
    private Long id;
    private String email;
    private String name;
    private String walletAddress;
    private String role;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(Long id, String email, String name, String walletAddress, String role, Boolean isActive, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.walletAddress = walletAddress;
        this.role = role;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

}