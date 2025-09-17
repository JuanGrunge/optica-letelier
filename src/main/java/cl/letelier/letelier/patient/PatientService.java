package cl.letelier.letelier.patient;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional
public class PatientService {
    private final PatientRepository repo;
    public PatientService(PatientRepository repo){this.repo=repo;}

    public Page<PatientDTO> search(String q, Pageable pageable){
        if(q==null || q.isBlank()) return repo.findByActivoTrue(pageable).map(PatientMapper::toDTO);
        String nq = q.replaceAll("[.\\-\\s]", "");
        return repo.searchByRutOrNameFlexible(q, nq, pageable).map(PatientMapper::toDTO);
    }
    public PatientDTO get(Long id){return repo.findById(id).map(PatientMapper::toDTO).orElseThrow();}
    public PatientDTO create(PatientDTO dto){
        Patient p = new Patient();
        PatientMapper.updateEntity(p,dto);
        return PatientMapper.toDTO(repo.save(p));
    }
    public PatientDTO update(Long id, PatientDTO dto){
        Patient p = repo.findById(id).orElseThrow();
        PatientMapper.updateEntity(p,dto);
        return PatientMapper.toDTO(repo.save(p));
    }
    public void softDelete(Long id){
        Patient p = repo.findById(id).orElseThrow();
        p.setActivo(false); repo.save(p);
    }

    public long countActive(){
        return repo.countByActivoTrue();
    }
}
