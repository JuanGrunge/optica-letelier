package cl.letelier.letelier.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Cadena de seguridad SOLO para /h2-console/** en desarrollo.
 * Aísla por completo la consola de la cadena principal y relaja headers solo en esa ruta.
 */
@Configuration
@ConditionalOnProperty(value = "spring.h2.console.enabled", havingValue = "true")
public class H2ConsoleSecurityDev {

    @Bean
    @Order(0) // máxima prioridad: se evalúa antes que cualquier otra cadena
    public SecurityFilterChain h2ConsoleChain(HttpSecurity http) throws Exception {
        http.securityMatcher("/h2-console/**")
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            // Desactiva headers por defecto y añade solo lo necesario
            .headers(h -> {
                h.defaultsDisabled();
                h.frameOptions(f -> f.sameOrigin());
                h.contentSecurityPolicy(csp -> csp.policyDirectives(
                        "default-src 'self' 'unsafe-inline' data: blob:; " +
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; " +
                        "style-src 'self' 'unsafe-inline'; " +
                        "img-src 'self' data: blob:; " +
                        "font-src 'self' data:; " +
                        "connect-src 'self' data: blob:; " +
                        "frame-ancestors 'self'"
                ));
            })
            .csrf(csrf -> csrf.ignoringRequestMatchers("/h2-console/**"));
        return http.build();
    }
}
