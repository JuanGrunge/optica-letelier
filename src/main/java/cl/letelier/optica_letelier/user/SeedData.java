package cl.letelier.optica_letelier.user;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedData {
    @Bean
    CommandLineRunner seedUsers(AppUserRepository repo, PasswordEncoder enc) {
        return args -> {
            if (repo.count() == 0) {
                AppUser admin = new AppUser(); admin.setUsername("admin"); admin.setPassword(enc.encode("admin123")); admin.setRole(Role.ADMIN);
                AppUser receptor = new AppUser(); receptor.setUsername("receptor"); receptor.setPassword(enc.encode("receptor123")); receptor.setRole(Role.RECEPTOR);
                AppUser optico = new AppUser(); optico.setUsername("optico"); optico.setPassword(enc.encode("optico123")); optico.setRole(Role.OPTICO);
                repo.save(admin); repo.save(receptor); repo.save(optico);
            }
        };
    }
}
