package cl.letelier.letelier.patient;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    @Query(value = "select * from patient p where p.activo=true and (" +
            " lower(p.apellidos) like lower('%' || :q || '%') or" +
            " lower(p.nombres)  like lower('%' || :q || '%') or" +
            " lower(p.rut)      like lower('%' || :q || '%') or" +
            " lower(replace(replace(replace(p.rut, '.', ''), '-', ''), ' ', '')) like lower('%' || :nq || '%')" +
            ")",
            countQuery = "select count(*) from patient p where p.activo=true and (" +
                    " lower(p.apellidos) like lower('%' || :q || '%') or" +
                    " lower(p.nombres)  like lower('%' || :q || '%') or" +
                    " lower(p.rut)      like lower('%' || :q || '%') or" +
                    " lower(replace(replace(replace(p.rut, '.', ''), '-', ''), ' ', '')) like lower('%' || :nq || '%')" +
                    ")",
            nativeQuery = true)
    Page<Patient> searchByRutOrNameFlexible(@Param("q") String q, @Param("nq") String nq, Pageable pageable);
}
