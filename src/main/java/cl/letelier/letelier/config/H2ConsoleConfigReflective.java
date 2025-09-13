package cl.letelier.letelier.config;

import jakarta.servlet.Servlet;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registra el servlet de H2 Console SIN importar org.h2.* a compile-time.
 * Funciona con H2 2.x (JakartaWebServlet) y 1.x (WebServlet) vía reflexión.
 * Requiere: spring.h2.console.enabled=true
 */
@Configuration
@ConditionalOnProperty(value = "spring.h2.console.enabled", havingValue = "true")
public class H2ConsoleConfigReflective {

    @Bean
    public ServletRegistrationBean<?> h2servletRegistration() {
        try {
            Class<?> servletClass;
            try {
                // H2 2.x (Jakarta EE)
                servletClass = Class.forName("org.h2.server.web.JakartaWebServlet");
            } catch (ClassNotFoundException ex) {
                // H2 1.x (javax)
                servletClass = Class.forName("org.h2.server.web.WebServlet");
            }
            Servlet servlet = (Servlet) servletClass.getDeclaredConstructor().newInstance();
            ServletRegistrationBean<?> registration = new ServletRegistrationBean<>(servlet, "/h2-console/*");
            registration.setLoadOnStartup(1);
            return registration;
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo registrar H2 Console (verifica que la dependencia H2 esté en runtime).", e);
        }
    }
}
