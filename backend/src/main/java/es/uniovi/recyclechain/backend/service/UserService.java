package es.uniovi.recyclechain.backend.service;

import es.uniovi.recyclechain.backend.model.Role;
import es.uniovi.recyclechain.backend.model.User;
import es.uniovi.recyclechain.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User getUser(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User getUserByWalletAddress(String walletAddress) {
        return userRepository.findByWalletAddress(walletAddress).orElse(null);
    }

    public void addUser(User user) {
        // Encrypt passoword
        if (user.getPasswordHash() != null && !user.getPasswordHash().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        }
        userRepository.save(user);
    }

    public User registerUser(String email, String password, String name, String walletAddress) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setName(name);
        user.setWalletAddress(walletAddress);
        user.setRole(Role.ROLE_USER);
        user.setIsActive(true);
        return userRepository.save(user);
    }

    public User registerEmployee(String email, String password, String name) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setName(name);
        user.setRole(Role.ROLE_EMPLOYEE);
        user.setIsActive(true);
        return userRepository.save(user);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean existsByWalletAddress(String walletAddress) {
        return userRepository.existsByWalletAddress(walletAddress);
    }

    public void linkWallet(Long userId, String walletAddress) {
        User user = getUser(userId);
        if (user != null) {
            user.setWalletAddress(walletAddress);
            userRepository.save(user);
        }
    }

    public boolean checkPassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }
}