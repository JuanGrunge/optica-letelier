package cl.letelier.optica_letelier.audit;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional
public class AuditService {
    private final AuditLogRepository repo;
    public AuditService(AuditLogRepository repo){ this.repo = repo; }

    public void log(String accion, String entidad, Long entidadId, String detalle){
        AuditLog l = new AuditLog();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        l.setUsuario(auth != null ? auth.getName() : "system");
        l.setAccion(accion); l.setEntidad(entidad); l.setEntidadId(entidadId); l.setDetalle(detalle);
        repo.save(l);
    }
}
