package cl.letelier.optica_letelier.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

/**
 * BYPASS TOTAL de seguridad para /h2-console/**.
 * Esto evita que CUALQUIER filtro (incluido JwtAuthFilter) intercepte esas requests.
 * Se activa solo cuando spring.h2.console.enabled=true.
 */
@Configuration
@ConditionalOnProperty(value = "spring.h2.console.enabled", havingValue = "true")
public class H2WebSecurityIgnoreConfig {

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers("/h2-console/**");
    }
}
