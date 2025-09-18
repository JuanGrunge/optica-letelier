package cl.letelier.letelier.patient;

import cl.letelier.letelier.operative.Operative;
import cl.letelier.letelier.operative.OperativeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service @Transactional
public class PatientService {
    private final PatientRepository repo;
    private final OperativeRepository opRepo;
    public PatientService(PatientRepository repo, OperativeRepository opRepo){this.repo=repo; this.opRepo=opRepo;}

    public Page<PatientDTO> search(String q, Pageable pageable){
        if(q==null || q.isBlank()) return repo.findByActivoTrue(pageable).map(PatientMapper::toDTO);
        String nq = q.replaceAll("[.\\-\\s]", "");
        return repo.searchByRutOrNameFlexible(q, nq, pageable).map(PatientMapper::toDTO);
    }
    public PatientDTO get(Long id){return repo.findById(id).map(PatientMapper::toDTO).orElseThrow();}
    public PatientDTO create(PatientDTO dto){
        Patient p = new Patient();
        PatientMapper.updateEntity(p,dto);
        // Primer guardado para obtener ID
        p = repo.save(p);

        // Asegurar operativos del día actual (si no existen, crearlos)
        LocalDate today = LocalDate.now();
        Operative centro = opRepo.findByNombreAndFecha("Operativo Centro", today)
                .orElseGet(() -> opRepo.save(newOperative("Operativo Centro", "CESFAM Centro", "Calle Salud 100", today)));
        Operative norte = opRepo.findByNombreAndFecha("Operativo Norte", today)
                .orElseGet(() -> opRepo.save(newOperative("Operativo Norte", "Clínica Norte", "Av. Norte 200", today)));
        Operative sur = opRepo.findByNombreAndFecha("Operativo Sur", today)
                .orElseGet(() -> opRepo.save(newOperative("Operativo Sur", "Consultorio Sur", "Av. Sur 300", today)));

        // Asignación round-robin por ID
        int mod = (int)(p.getId() % 3);
        Operative chosen = (mod == 0 ? centro : (mod == 1 ? norte : sur));
        p.getOperatives().add(chosen);
        p = repo.save(p);
        return PatientMapper.toDTO(p);
    }

    private Operative newOperative(String nombre, String lugar, String direccion, LocalDate fecha){
        Operative o = new Operative();
        o.setNombre(nombre); o.setLugar(lugar); o.setDireccion(direccion); o.setFecha(fecha); o.setActivo(true);
        return o;
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
