package cl.letelier.letelier.prescription;

import java.time.LocalDate;
import java.math.BigDecimal;

public record PrescriptionDTO(
    Long id, Long pacienteId,
    BigDecimal odEsfera, BigDecimal odCilindro, BigDecimal odEje,
    BigDecimal oiEsfera, BigDecimal oiCilindro, BigDecimal oiEje,
    BigDecimal addPower, String observaciones, LocalDate fecha, boolean activo
){}
