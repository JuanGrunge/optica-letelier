package cl.letelier.letelier.patient;

import cl.letelier.letelier.common.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService service;
    public PatientController(PatientService service){this.service=service;}

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPTICO','RECEPTOR')")
    public PageResponse<PatientDTO> list(@RequestParam(required=false) String q,
                                         @RequestParam(defaultValue="0") int page,
                                         @RequestParam(defaultValue="20") int size){
        Page<PatientDTO> p = service.search(q, PageRequest.of(page,size));
        return PageResponse.of(p);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPTICO','RECEPTOR')")
    public PatientDTO get(@PathVariable Long id){return service.get(id);}

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPTICO')")
    public PatientDTO create(@RequestBody PatientDTO dto){return service.create(dto);}

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPTICO')")
    public PatientDTO update(@PathVariable Long id, @RequestBody PatientDTO dto){return service.update(id,dto);}

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id){service.softDelete(id);return ResponseEntity.noContent().build();}

    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('ADMIN','OPTICO','RECEPTOR')")
    public Map<String, Long> count(){
        return Map.of("total", service.countActive());
    }
}
