package cl.letelier.optica_letelier.prescription;

import cl.letelier.optica_letelier.common.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {
    private final PrescriptionService service;
    public PrescriptionController(PrescriptionService service){ this.service = service; }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPTICO','RECEPTOR')")
    public PageResponse<PrescriptionDTO> list(@RequestParam(required = false) Long pacienteId,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int size){
        Page<PrescriptionDTO> p = service.list(pacienteId, page, size);
        return PageResponse.of(p);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPTICO','RECEPTOR')")
    public PrescriptionDTO get(@PathVariable Long id){ return service.get(id); }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPTICO')")
    public PrescriptionDTO create(@RequestBody PrescriptionDTO dto){ return service.create(dto); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPTICO')")
    public PrescriptionDTO update(@PathVariable Long id, @RequestBody PrescriptionDTO dto){ return service.update(id, dto); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id){ service.softDelete(id); return ResponseEntity.noContent().build(); }
}
