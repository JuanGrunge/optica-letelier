package cl.letelier.optica_letelier.controller;

import cl.letelier.optica_letelier.security.JwtService;
import cl.letelier.optica_letelier.user.AppUser;
import cl.letelier.optica_letelier.user.AppUserRepository;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AppUserRepository repo;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, AppUserRepository repo) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.repo = repo;
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) { }
    public record LoginResponse(String accessToken, Map<String,Object> user) { }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            var auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password())
            );
            var user = (AppUser) auth.getPrincipal();
            var token = jwtService.generateToken(user);
            return ResponseEntity.ok(new LoginResponse(token, Map.of(
                "id", user.getId(), "username", user.getUsername(), "role", user.getRole().name()
            )));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(Map.of("error","invalid_credentials"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestHeader("Authorization") String bearer) {
        if (bearer == null || !bearer.startsWith("Bearer ")) return ResponseEntity.status(401).build();
        var token = bearer.substring(7);
        var username = jwtService.extractUsername(token);
        var user = repo.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();
        var newToken = jwtService.generateToken(user);
        return ResponseEntity.ok(Map.of("accessToken", newToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() { return ResponseEntity.noContent().build(); }
}
