package cl.letelier.letelier.auth;

import cl.letelier.letelier.security.JwtService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<MeResponse> login(@RequestBody LoginRequest body) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(body.username(), body.password())
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        UserDetails user = (UserDetails) auth.getPrincipal();

        // Generate JWT using existing JwtService
        final String token = jwtService.generateToken(user);

        // HttpOnly cookie
        ResponseCookie cookie = ResponseCookie.from("AUTH", token)
                .httpOnly(true)
                .secure(false) // TODO: true en prod con HTTPS
                .sameSite("Lax")
                .path("/")
                .build();

        MeResponse payload = MeResponse.from(user);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(payload);
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal UserDetails user) {
        if (user == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(MeResponse.from(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cookie = ResponseCookie.from("AUTH", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }
}
