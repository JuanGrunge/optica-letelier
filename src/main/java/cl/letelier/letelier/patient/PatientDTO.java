package cl.letelier.letelier.patient;

import java.time.LocalDate;

public record PatientDTO(
        Long id,
        String nombres,
        String apellidos,
        String rut,
        LocalDate fechaNac,
        String telefono,
        String email,
        String direccion,
        boolean activo
) {}
