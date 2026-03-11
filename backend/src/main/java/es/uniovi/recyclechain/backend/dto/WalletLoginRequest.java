package es.uniovi.recyclechain.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WalletLoginRequest {

    @NotBlank(message = "Wallet address is required")
    private String walletAddress;

    @NotBlank(message = "Signature is required")
    private String signature;

    @NotBlank(message = "Message is required")
    private String message;

    public WalletLoginRequest() {
    }

}