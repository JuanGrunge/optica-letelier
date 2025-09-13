package cl.letelier.letelier.prescription;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long>{
    Page<Prescription> findByPacienteId(Long pacienteId, Pageable pageable);
}
