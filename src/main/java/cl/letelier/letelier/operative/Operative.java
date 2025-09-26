package cl.letelier.letelier.operative;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import cl.letelier.letelier.common.TextNormalizer;

@Entity @Table(name="operative")
public class Operative {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @NotBlank @Size(max=160) private String nombre;
    @Size(max=240) private String lugar;
    @Size(max=240) private String direccion;
    @Size(max=120) private String comuna;
    private LocalDate fecha;
    @Size(max=360) private String observaciones;
    private boolean activo=false;

    public Long getId(){return id;}
    public String getNombre(){return nombre;} public void setNombre(String v){this.nombre=v;}
    public String getLugar(){return lugar;} public void setLugar(String v){this.lugar=v;}
    public String getDireccion(){return direccion;} public void setDireccion(String v){this.direccion=v;}
    public String getComuna(){return comuna;} public void setComuna(String v){this.comuna=v;}
    public LocalDate getFecha(){return fecha;} public void setFecha(LocalDate v){this.fecha=v;}
    public String getObservaciones(){return observaciones;} public void setObservaciones(String v){this.observaciones=v;}
    public boolean isActivo(){return activo;} public void setActivo(boolean v){this.activo=v;}

    @PrePersist
    @PreUpdate
    public void normalize(){
        this.nombre = TextNormalizer.upperEs(TextNormalizer.nfc(this.nombre));
        this.lugar = TextNormalizer.upperEs(TextNormalizer.nfc(this.lugar));
        this.direccion = TextNormalizer.addressCase(TextNormalizer.nfc(this.direccion));
        this.comuna = TextNormalizer.upperEs(TextNormalizer.nfc(this.comuna));
        this.observaciones = TextNormalizer.upperEs(TextNormalizer.collapseSpaces(this.observaciones));
    }
}
