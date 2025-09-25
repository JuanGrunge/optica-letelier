package cl.letelier.letelier.operative;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OperativeRepository extends JpaRepository<Operative, Long>{
    Optional<Operative> findByNombreAndFecha(String nombre, LocalDate fecha);
    Optional<Operative> findFirstByLugarOrderByFechaDesc(String lugar);
    Optional<Operative> findFirstByNombreOrderByFechaDesc(String nombre);

    @Query("select distinct coalesce(o.lugar, o.nombre) from Operative o where o.activo = true order by 1")
    List<String> findDistinctPlaces();

    Page<Operative> findByActivoTrue(Pageable pageable);
}
