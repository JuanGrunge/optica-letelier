package cl.letelier.optica_letelier.audit;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String usuario; // username
    private String accion;  // CREATE/UPDATE/DELETE/etc
    private String entidad; // Patient/Prescription/Invoice
    private Long entidadId;
    @Column(length = 500)
    private String detalle;

    private LocalDateTime fecha = LocalDateTime.now();

    public Long getId(){ return id; }
    public String getUsuario(){ return usuario; }
    public void setUsuario(String u){ this.usuario = u; }
    public String getAccion(){ return accion; }
    public void setAccion(String a){ this.accion = a; }
    public String getEntidad(){ return entidad; }
    public void setEntidad(String e){ this.entidad = e; }
    public Long getEntidadId(){ return entidadId; }
    public void setEntidadId(Long id){ this.entidadId = id; }
    public String getDetalle(){ return detalle; }
    public void setDetalle(String d){ this.detalle = d; }
    public LocalDateTime getFecha(){ return fecha; }
    public void setFecha(LocalDateTime f){ this.fecha = f; }
}
