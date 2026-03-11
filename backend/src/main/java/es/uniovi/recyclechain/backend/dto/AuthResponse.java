package es.uniovi.recyclechain.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long userId;
    private String email;
    private String name;
    private String role;
    private String walletAddress;

    public AuthResponse(String token, Long userId, String email, String name, String role, String walletAddress) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.role = role;
        this.walletAddress = walletAddress;
    }

}