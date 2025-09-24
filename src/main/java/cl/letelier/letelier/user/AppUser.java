package cl.letelier.letelier.user;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import cl.letelier.letelier.common.TextNormalizer;

@Entity
@Table(name = "app_user")
public class AppUser implements UserDetails {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role = Role.RECEPTOR;

    private boolean enabled = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @Override public String getUsername() { return username; }
    public void setUsername(String u) { this.username = u; }

    @Override public String getPassword() { return password; }
    public void setPassword(String p) { this.password = p; }

    public Role getRole() { return role; }
    public void setRole(Role r) { this.role = r; }

    public boolean isEnabledFlag() { return enabled; }
    public void setEnabledFlag(boolean e) { this.enabled = e; }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return enabled; }

    @PrePersist
    @PreUpdate
    public void normalize(){
        // Username y role en mayúsculas; password se mantiene tal cual (hash)
        this.username = TextNormalizer.upperEs(TextNormalizer.collapseSpaces(this.username));
        if (this.role != null) {
            try { this.role = Role.valueOf(this.role.name().toUpperCase()); } catch (Exception ignored) {}
        }
    }
}
