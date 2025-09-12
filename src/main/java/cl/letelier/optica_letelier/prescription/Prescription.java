package cl.letelier.optica_letelier.prescription;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "prescription")
public class Prescription {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private Long pacienteId; // FK simple (sin relación JPA para mantenerlo mínimo y evitar cascadas no deseadas)

    // OD
    private Double odEsfera;
    private Double odCilindro;
    private Integer odEje;

    // OI
    private Double oiEsfera;
    private Double oiCilindro;
    private Integer oiEje;

    private Double addPower;

    @Size(max = 360)
    private String observaciones;

    private LocalDate fecha = LocalDate.now();

    private boolean activo = true;

    public Long getId(){ return id; }
    public Long getPacienteId(){ return pacienteId; }
    public void setPacienteId(Long pacienteId){ this.pacienteId = pacienteId; }
    public Double getOdEsfera(){ return odEsfera; }
    public void setOdEsfera(Double v){ this.odEsfera = v; }
    public Double getOdCilindro(){ return odCilindro; }
    public void setOdCilindro(Double v){ this.odCilindro = v; }
    public Integer getOdEje(){ return odEje; }
    public void setOdEje(Integer v){ this.odEje = v; }
    public Double getOiEsfera(){ return oiEsfera; }
    public void setOiEsfera(Double v){ this.oiEsfera = v; }
    public Double getOiCilindro(){ return oiCilindro; }
    public void setOiCilindro(Double v){ this.oiCilindro = v; }
    public Integer getOiEje(){ return oiEje; }
    public void setOiEje(Integer v){ this.oiEje = v; }
    public Double getAddPower(){ return addPower; }
    public void setAddPower(Double v){ this.addPower = v; }
    public String getObservaciones(){ return observaciones; }
    public void setObservaciones(String obs){ this.observaciones = obs; }
    public LocalDate getFecha(){ return fecha; }
    public void setFecha(LocalDate f){ this.fecha = f; }
    public boolean isActivo(){ return activo; }
    public void setActivo(boolean activo){ this.activo = activo; }
}
