package cl.letelier.optica_letelier.patient;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "patient")
public class Patient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Size(max=120) private String nombres;
    @NotBlank @Size(max=120) private String apellidos;
    @Size(max=20) private String rut;
    private LocalDate fechaNac;
    @Size(max=30) private String telefono;
    @Email @Size(max=180) private String email;
    @Size(max=240) private String direccion;
    private boolean activo = true;

    @ManyToMany
    @JoinTable(name="patient_operative",
        joinColumns=@JoinColumn(name="patient_id"),
        inverseJoinColumns=@JoinColumn(name="operative_id"))
    private Set<cl.letelier.optica_letelier.operative.Operative> operatives = new HashSet<>();

    public Long getId(){return id;}
    public String getNombres(){return nombres;}
    public void setNombres(String v){this.nombres=v;}
    public String getApellidos(){return apellidos;}
    public void setApellidos(String v){this.apellidos=v;}
    public String getRut(){return rut;}
    public void setRut(String v){this.rut=v;}
    public LocalDate getFechaNac(){return fechaNac;}
    public void setFechaNac(LocalDate v){this.fechaNac=v;}
    public String getTelefono(){return telefono;}
    public void setTelefono(String v){this.telefono=v;}
    public String getEmail(){return email;}
    public void setEmail(String v){this.email=v;}
    public String getDireccion(){return direccion;}
    public void setDireccion(String v){this.direccion=v;}
    public boolean isActivo(){return activo;}
    public void setActivo(boolean v){this.activo=v;}
    public Set<cl.letelier.optica_letelier.operative.Operative> getOperatives(){return operatives;}
    public void setOperatives(Set<cl.letelier.optica_letelier.operative.Operative> v){this.operatives=v;}
}
