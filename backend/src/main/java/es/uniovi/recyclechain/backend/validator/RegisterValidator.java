package es.uniovi.recyclechain.backend.validator;

import es.uniovi.recyclechain.backend.dto.RegisterRequest;
import es.uniovi.recyclechain.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

@Component
public class RegisterValidator implements Validator {

    @Autowired
    private UserService userService;

    @Override
    public boolean supports(Class<?> clazz) {
        return RegisterRequest.class.equals(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        RegisterRequest registerRequest = (RegisterRequest) target;

        // Validate that passwords are the same
        if (!registerRequest.getPassword().equals(registerRequest.getPasswordConfirm())) {
            errors.rejectValue("passwordConfirm", "Error.register.passwordConfirm.mismatch");
        }

        // Validate that the email is not reghistered
        if (userService.existsByEmail(registerRequest.getEmail())) {
            errors.rejectValue("email", "Error.register.email.duplicate");
        }

        // Validar that the wallet is not registered (if provided)
        if (registerRequest.getWalletAddress() != null && 
            !registerRequest.getWalletAddress().isEmpty()) {
            if (userService.existsByWalletAddress(registerRequest.getWalletAddress())) {
                errors.rejectValue("walletAddress", "Error.register.walletAddress.duplicate");
            }
        }
    }
}