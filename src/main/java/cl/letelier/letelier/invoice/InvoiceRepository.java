package cl.letelier.letelier.invoice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long>{
    Page<Invoice> findByPacienteId(Long pacienteId, Pageable pageable);
}
