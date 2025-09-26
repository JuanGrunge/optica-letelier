package cl.letelier.letelier.operative;

import cl.letelier.letelier.common.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operatives")
public class OperativeController{
    private final OperativeService service;
    private final cl.letelier.letelier.patient.PatientService patientService;
    public OperativeController(OperativeService service, cl.letelier.letelier.patient.PatientService patientService){this.service=service; this.patientService = patientService;}

    @GetMapping @PreAuthorize("hasAnyRole('ADMIN','OPTICO','RECEPTOR')")
    public PageResponse<OperativeDTO> list(@RequestParam(defaultValue="0") int page,
                                           @RequestParam(defaultValue="20") int size,
                                           @RequestParam(required=false) Boolean active){
        Page<OperativeDTO> p = service.list(page,size,active); return PageResponse.of(p);
    }
    @GetMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','OPTICO','RECEPTOR')")
    public OperativeDTO get(@PathVariable Long id){return service.get(id);}
    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public OperativeDTO create(@RequestBody OperativeDTO dto){return service.create(dto);}
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public OperativeDTO update(@PathVariable Long id,@RequestBody OperativeDTO dto){return service.update(id,dto);}
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id){service.softDelete(id); return ResponseEntity.noContent().build();}

    @GetMapping("/places")
    @PreAuthorize("hasAnyRole('ADMIN','OPTICO','RECEPTOR')")
    public java.util.List<String> places(){ return service.distinctPlaces(); }

    @GetMapping("/{id}/patients")
    @PreAuthorize("hasAnyRole('ADMIN','OPTICO','RECEPTOR')")
    public cl.letelier.letelier.common.PageResponse<cl.letelier.letelier.patient.PatientDTO> patientsByOperative(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size){
        var p = patientService.listByOperative(id, page, size);
        return cl.letelier.letelier.common.PageResponse.of(p);
    }

    // Toggle active state (prototype-friendly, optional force flag ignored here)
    public static class ActiveReq { public boolean active; public boolean isActive(){ return active; } }
    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    public OperativeDTO setActive(@PathVariable Long id,
                                  @RequestParam(name="force", defaultValue = "false") boolean force,
                                  @RequestBody ActiveReq body){
        return service.setActive(id, body != null && body.isActive());
    }
}
