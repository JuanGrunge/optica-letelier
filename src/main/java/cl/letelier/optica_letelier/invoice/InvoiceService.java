package cl.letelier.optica_letelier.invoice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional
public class InvoiceService{
    private final InvoiceRepository repo;
    public InvoiceService(InvoiceRepository repo){this.repo=repo;}
    public Page<InvoiceDTO> list(Long pacienteId,int page,int size){
        if(pacienteId!=null) return repo.findByPacienteId(pacienteId, PageRequest.of(page,size)).map(InvoiceMapper::toDTO);
        return repo.findAll(PageRequest.of(page,size)).map(InvoiceMapper::toDTO);
    }
    public InvoiceDTO get(Long id){return repo.findById(id).map(InvoiceMapper::toDTO).orElseThrow();}
    public InvoiceDTO create(InvoiceDTO dto){Invoice e=new Invoice(); InvoiceMapper.updateEntity(e,dto); return InvoiceMapper.toDTO(repo.save(e));}
    public InvoiceDTO update(Long id, InvoiceDTO dto){Invoice e=repo.findById(id).orElseThrow(); InvoiceMapper.updateEntity(e,dto); return InvoiceMapper.toDTO(repo.save(e));}
    public void annul(Long id){Invoice e=repo.findById(id).orElseThrow(); e.setAnulado(true); repo.save(e);}
}
