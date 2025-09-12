package cl.letelier.optica_letelier.patient;

public class PatientMapper {
    public static PatientDTO toDTO(Patient p) {
        return new PatientDTO(
                p.getId(), p.getNombres(), p.getApellidos(), p.getRut(),
                p.getFechaNac(), p.getTelefono(), p.getEmail(), p.getDireccion(), p.isActivo()
        );
    }
    public static void updateEntity(Patient p, PatientDTO dto) {
        p.setNombres(dto.nombres());
        p.setApellidos(dto.apellidos());
        p.setRut(dto.rut());
        p.setFechaNac(dto.fechaNac());
        p.setTelefono(dto.telefono());
        p.setEmail(dto.email());
        p.setDireccion(dto.direccion());
        p.setActivo(dto.activo());
    }
}
