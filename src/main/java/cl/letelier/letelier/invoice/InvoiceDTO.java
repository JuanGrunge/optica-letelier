package cl.letelier.letelier.invoice;

import java.time.LocalDate;
public record InvoiceDTO(Long id, Long pacienteId, Long prescriptionId, LocalDate fecha, Integer total, String detalle, boolean anulado){}
