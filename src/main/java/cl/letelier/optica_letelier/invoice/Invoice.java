package cl.letelier.optica_letelier.invoice;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity @Table(name="invoice")
public class Invoice {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @NotNull private Long pacienteId;
    private Long prescriptionId;
    @NotNull private LocalDate fecha = LocalDate.now();
    @NotNull private Integer total;
    @Column(length=360) private String detalle;
    private boolean anulado=false;

    public Long getId(){return id;}
    public Long getPacienteId(){return pacienteId;} public void setPacienteId(Long v){this.pacienteId=v;}
    public Long getPrescriptionId(){return prescriptionId;} public void setPrescriptionId(Long v){this.prescriptionId=v;}
    public LocalDate getFecha(){return fecha;} public void setFecha(LocalDate v){this.fecha=v;}
    public Integer getTotal(){return total;} public void setTotal(Integer v){this.total=v;}
    public String getDetalle(){return detalle;} public void setDetalle(String v){this.detalle=v;}
    public boolean isAnulado(){return anulado;} public void setAnulado(boolean v){this.anulado=v;}
}
