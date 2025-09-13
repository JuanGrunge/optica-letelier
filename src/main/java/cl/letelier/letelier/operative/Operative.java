package cl.letelier.letelier.operative;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity @Table(name="operative")
public class Operative {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @NotBlank @Size(max=160) private String nombre;
    @Size(max=240) private String lugar;
    @Size(max=240) private String direccion;
    private LocalDate fecha;
    @Size(max=360) private String observaciones;
    private boolean activo=true;

    public Long getId(){return id;}
    public String getNombre(){return nombre;} public void setNombre(String v){this.nombre=v;}
    public String getLugar(){return lugar;} public void setLugar(String v){this.lugar=v;}
    public String getDireccion(){return direccion;} public void setDireccion(String v){this.direccion=v;}
    public LocalDate getFecha(){return fecha;} public void setFecha(LocalDate v){this.fecha=v;}
    public String getObservaciones(){return observaciones;} public void setObservaciones(String v){this.observaciones=v;}
    public boolean isActivo(){return activo;} public void setActivo(boolean v){this.activo=v;}
}
