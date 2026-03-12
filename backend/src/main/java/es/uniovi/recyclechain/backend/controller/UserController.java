package es.uniovi.recyclechain.backend.controller;

import es.uniovi.recyclechain.backend.dto.UserResponse;
import es.uniovi.recyclechain.backend.model.User;
import es.uniovi.recyclechain.backend.security.CustomUserDetails;
import es.uniovi.recyclechain.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        
        UserResponse response = new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getWalletAddress(),
            user.getRole().name(),
            user.getIsActive(),
            user.getCreatedAt()
        );
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/link-wallet")
    public ResponseEntity<?> linkWallet(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestParam String walletAddress
    ) {
        if (userService.existsByWalletAddress(walletAddress)) {
            return ResponseEntity.badRequest().body("Wallet already linked to another account");
        }

        userService.linkWallet(userDetails.getUser().getId(), walletAddress);
        return ResponseEntity.ok("Wallet linked successfully");
    }
}