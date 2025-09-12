package cl.letelier.optica_letelier.prescription;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional
public class PrescriptionService{
    private final PrescriptionRepository repo;
    public PrescriptionService(PrescriptionRepository repo){this.repo=repo;}
    public Page<PrescriptionDTO> list(Long pacienteId,int page,int size){
        if(pacienteId!=null) return repo.findByPacienteId(pacienteId, PageRequest.of(page,size)).map(PrescriptionMapper::toDTO);
        return repo.findAll(PageRequest.of(page,size)).map(PrescriptionMapper::toDTO);
    }
    public PrescriptionDTO get(Long id){return repo.findById(id).map(PrescriptionMapper::toDTO).orElseThrow();}
    public PrescriptionDTO create(PrescriptionDTO dto){Prescription e=new Prescription(); PrescriptionMapper.updateEntity(e,dto); return PrescriptionMapper.toDTO(repo.save(e));}
    public PrescriptionDTO update(Long id, PrescriptionDTO dto){Prescription e=repo.findById(id).orElseThrow(); PrescriptionMapper.updateEntity(e,dto); return PrescriptionMapper.toDTO(repo.save(e));}
    public void softDelete(Long id){Prescription e=repo.findById(id).orElseThrow(); e.setActivo(false); repo.save(e);}
}
