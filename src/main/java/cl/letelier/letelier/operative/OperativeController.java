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
    public OperativeController(OperativeService service){this.service=service;}

    @GetMapping @PreAuthorize("hasAnyRole('ADMIN','OPTICO','RECEPTOR')")
    public PageResponse<OperativeDTO> list(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){
        Page<OperativeDTO> p = service.list(page,size); return PageResponse.of(p);
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
}
