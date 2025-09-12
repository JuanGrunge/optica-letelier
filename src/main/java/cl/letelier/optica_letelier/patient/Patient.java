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

    @NotBlank @Size(max = 120)
    private String nombres;

    @NotBlank @Size(max = 120)
    private String apellidos;

    @Size(max = 20)
    private String rut;

    private LocalDate fechaNac;

    @Size(max = 30)
    private String telefono;

    @Email @Size(max = 180)
    private String email;

    @Size(max = 240)
    private String direccion;

    private boolean activo = true;

    @ManyToMany
    @JoinTable(
        name = "patient_operative",
        joinColumns = @JoinColumn(name = "patient_id"),
        inverseJoinColumns = @JoinColumn(name = "operative_id")
    )
    private Set<cl.letelier.optica_letelier.operative.Operative> operatives = new HashSet<>();

    // getters/setters
    public Long getId() { return id; }
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getRut() { return rut; }
    public void setRut(String rut) { this.rut = rut; }
    public LocalDate getFechaNac() { return fechaNac; }
    public void setFechaNac(LocalDate fechaNac) { this.fechaNac = fechaNac; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
    public Set<cl.letelier.optica_letelier.operative.Operative> getOperatives() { return operatives; }
    public void setOperatives(Set<cl.letelier.optica_letelier.operative.Operative> operatives) { this.operatives = operatives; }
}
