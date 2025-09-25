package cl.letelier.letelier.prescription;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.math.BigDecimal;
import cl.letelier.letelier.common.TextNormalizer;

@Entity @Table(name="prescription")
public class Prescription {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @NotNull private Long pacienteId;
    @Column(precision = 6, scale = 2) private BigDecimal odEsfera;
    @Column(precision = 6, scale = 2) private BigDecimal odCilindro;
    @Column(precision = 5, scale = 2) private BigDecimal odEje;
    @Column(precision = 6, scale = 2) private BigDecimal oiEsfera;
    @Column(precision = 6, scale = 2) private BigDecimal oiCilindro;
    @Column(precision = 5, scale = 2) private BigDecimal oiEje;
    @Column(precision = 6, scale = 2) private BigDecimal addPower;
    @Column(length=360) private String observaciones;
    private LocalDate fecha = LocalDate.now();
    private boolean activo = true;

    public Long getId(){return id;}
    public Long getPacienteId(){return pacienteId;} public void setPacienteId(Long v){this.pacienteId=v;}
    public BigDecimal getOdEsfera(){return odEsfera;} public void setOdEsfera(BigDecimal v){this.odEsfera=v;}
    public BigDecimal getOdCilindro(){return odCilindro;} public void setOdCilindro(BigDecimal v){this.odCilindro=v;}
    public BigDecimal getOdEje(){return odEje;} public void setOdEje(BigDecimal v){this.odEje=v;}
    public BigDecimal getOiEsfera(){return oiEsfera;} public void setOiEsfera(BigDecimal v){this.oiEsfera=v;}
    public BigDecimal getOiCilindro(){return oiCilindro;} public void setOiCilindro(BigDecimal v){this.oiCilindro=v;}
    public BigDecimal getOiEje(){return oiEje;} public void setOiEje(BigDecimal v){this.oiEje=v;}
    public BigDecimal getAddPower(){return addPower;} public void setAddPower(BigDecimal v){this.addPower=v;}
    public String getObservaciones(){return observaciones;} public void setObservaciones(String v){this.observaciones=v;}
    public LocalDate getFecha(){return fecha;} public void setFecha(LocalDate v){this.fecha=v;}
    public boolean isActivo(){return activo;} public void setActivo(boolean v){this.activo=v;}

    @PrePersist
    @PreUpdate
    public void normalize(){
        this.observaciones = TextNormalizer.upperEs(TextNormalizer.collapseSpaces(this.observaciones));
    }
}
