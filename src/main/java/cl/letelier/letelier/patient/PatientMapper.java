package cl.letelier.letelier.patient;

public class PatientMapper {
    public static PatientDTO toDTO(Patient p){
        return new PatientDTO(
            p.getId(), p.getNombres(), p.getApellidos(), p.getRut(),
            p.getFechaNac(), p.getTelefono(), p.getEmail(), p.getDireccion(), p.isActivo()
        );
    }
    public static void updateEntity(Patient p, PatientDTO d){
        p.setNombres(d.nombres());
        p.setApellidos(d.apellidos());
        p.setRut(d.rut());
        p.setFechaNac(d.fechaNac());
        p.setTelefono(d.telefono());
        p.setEmail(d.email());
        p.setDireccion(d.direccion());
        p.setActivo(d.activo());
    }
}
