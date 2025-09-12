package cl.letelier.optica_letelier.invoice;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "invoice")
public class Invoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull private Long pacienteId;
    private Long prescriptionId; // opcional: boleta puede o no referenciar una receta exacta

    @NotNull private LocalDate fecha = LocalDate.now();
    @NotNull private Integer total;

    @Size(max = 360)
    private String detalle;

    private boolean anulado = false;

    public Long getId(){ return id; }
    public Long getPacienteId(){ return pacienteId; }
    public void setPacienteId(Long v){ this.pacienteId = v; }
    public Long getPrescriptionId(){ return prescriptionId; }
    public void setPrescriptionId(Long v){ this.prescriptionId = v; }
    public LocalDate getFecha(){ return fecha; }
    public void setFecha(LocalDate f){ this.fecha = f; }
    public Integer getTotal(){ return total; }
    public void setTotal(Integer t){ this.total = t; }
    public String getDetalle(){ return detalle; }
    public void setDetalle(String d){ this.detalle = d; }
    public boolean isAnulado(){ return anulado; }
    public void setAnulado(boolean a){ this.anulado = a; }
}
