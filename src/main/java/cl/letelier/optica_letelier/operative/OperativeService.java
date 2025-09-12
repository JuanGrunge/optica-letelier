package cl.letelier.optica_letelier.operative;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional
public class OperativeService {
    private final OperativeRepository repo;
    public OperativeService(OperativeRepository repo){ this.repo = repo; }

    public Page<OperativeDTO> list(int page, int size){
        return repo.findAll(PageRequest.of(page, size)).map(OperativeMapper::toDTO);
    }
    public OperativeDTO get(Long id){ return repo.findById(id).map(OperativeMapper::toDTO).orElseThrow(); }
    public OperativeDTO create(OperativeDTO dto){
        Operative o = new Operative();
        OperativeMapper.updateEntity(o, dto);
        return OperativeMapper.toDTO(repo.save(o));
    }
    public OperativeDTO update(Long id, OperativeDTO dto){
        Operative o = repo.findById(id).orElseThrow();
        OperativeMapper.updateEntity(o, dto);
        return OperativeMapper.toDTO(repo.save(o));
    }
    public void softDelete(Long id){
        Operative o = repo.findById(id).orElseThrow();
        o.setActivo(false);
        repo.save(o);
    }
}
