package cl.letelier.letelier.audit;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import cl.letelier.letelier.common.TextNormalizer;

@Entity @Table(name="audit_log")
public class AuditLog {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    private String usuario; private String accion; private String entidad; private Long entidadId;
    @Column(length=500) private String detalle;
    private LocalDateTime fecha = LocalDateTime.now();
    public Long getId(){return id;}
    public String getUsuario(){return usuario;} public void setUsuario(String v){this.usuario=v;}
    public String getAccion(){return accion;} public void setAccion(String v){this.accion=v;}
    public String getEntidad(){return entidad;} public void setEntidad(String v){this.entidad=v;}
    public Long getEntidadId(){return entidadId;} public void setEntidadId(Long v){this.entidadId=v;}
    public String getDetalle(){return detalle;} public void setDetalle(String v){this.detalle=v;}
    public LocalDateTime getFecha(){return fecha;} public void setFecha(LocalDateTime v){this.fecha=v;}

    @PrePersist
    @PreUpdate
    public void normalize(){
        this.usuario = TextNormalizer.upperEs(TextNormalizer.collapseSpaces(this.usuario));
        this.accion = TextNormalizer.upperEs(TextNormalizer.collapseSpaces(this.accion));
        this.entidad = TextNormalizer.upperEs(TextNormalizer.collapseSpaces(this.entidad));
        this.detalle = TextNormalizer.upperEs(TextNormalizer.collapseSpaces(this.detalle));
    }
}
