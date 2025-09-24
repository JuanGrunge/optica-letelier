package cl.letelier.letelier.operative;

import java.time.LocalDate;
public record OperativeDTO(Long id, String nombre, String lugar, String direccion, String comuna, LocalDate fecha, String observaciones, boolean activo){}
