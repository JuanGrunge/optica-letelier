package cl.letelier.letelier.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class SpaForwardFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Sólo para GET navegacionales
        if (!"GET".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();
        // Dejar pasar API, recursos estáticos o cualquier ruta con extensión
        if (uri.startsWith("/api") || uri.startsWith("/assets/") || uri.startsWith("/static/")
                || uri.startsWith("/favicon") || uri.endsWith(".html") || uri.contains(".")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Forward a index.html para rutas SPA (sin extensión) cuando no coinciden recursos
        request.getRequestDispatcher("/index.html").forward(request, response);
    }
}

