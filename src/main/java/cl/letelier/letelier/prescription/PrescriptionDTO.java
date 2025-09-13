package cl.letelier.letelier.prescription;

import java.time.LocalDate;

public record PrescriptionDTO(
    Long id, Long pacienteId,
    Double odEsfera, Double odCilindro, Integer odEje,
    Double oiEsfera, Double oiCilindro, Integer oiEje,
    Double addPower, String observaciones, LocalDate fecha, boolean activo
){}
