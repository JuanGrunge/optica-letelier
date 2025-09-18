package cl.letelier.letelier.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${app.dev.allow-iframe:false}")
    private boolean allowIframe;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/assets/**", "/favicon.ico",
                                 "/health", "/login", "/pacientes", "/archivo").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/operatives/places").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req,res,e) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED))
                .accessDeniedHandler((req,res,e) -> res.sendError(HttpServletResponse.SC_FORBIDDEN))
            );

        if (allowIframe) {
            // En desarrollo, desactiva por completo los headers de seguridad
            // para permitir ser embebido en el WebView de VS Code.
            http.headers(h -> h.disable());
        }

        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        // DelegatingPasswordEncoder: soporta {noop}, {bcrypt}, etc.
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(System.getProperty("app.cors.allowed-origins", "*").split(",")));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization","Content-Type","X-CSRF-Token"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
