package cl.letelier.letelier.invoice;

import cl.letelier.letelier.common.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController{
    private final InvoiceService service;
    public InvoiceController(InvoiceService service){this.service=service;}

    @GetMapping @PreAuthorize("hasAnyRole('ADMIN','OPTICO','RECEPTOR')")
    public PageResponse<InvoiceDTO> list(@RequestParam(required=false) Long pacienteId,
                                         @RequestParam(defaultValue="0") int page,
                                         @RequestParam(defaultValue="20") int size){
        Page<InvoiceDTO> p = service.list(pacienteId,page,size); return PageResponse.of(p);
    }
    @GetMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','OPTICO','RECEPTOR')")
    public InvoiceDTO get(@PathVariable Long id){return service.get(id);}
    @PostMapping @PreAuthorize("hasAnyRole('ADMIN','OPTICO')")
    public InvoiceDTO create(@RequestBody InvoiceDTO dto){return service.create(dto);}
    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','OPTICO')")
    public InvoiceDTO update(@PathVariable Long id,@RequestBody InvoiceDTO dto){return service.update(id,dto);}
    @PostMapping("/{id}/annul") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> annul(@PathVariable Long id){service.annul(id); return ResponseEntity.noContent().build();}
}
