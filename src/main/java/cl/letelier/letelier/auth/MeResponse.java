package cl.letelier.letelier.auth;

import org.springframework.security.core.userdetails.UserDetails;

public record MeResponse(Long id, String username, String role) {
    public static MeResponse from(UserDetails user) {
        String role = user.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse("");
        Long id = null;
        try {
            var field = user.getClass().getDeclaredField("id");
            field.setAccessible(true);
            id = (Long) field.get(user);
        } catch (Exception ignored) { }
        return new MeResponse(id, user.getUsername(), role);
    }
}