package cl.letelier.letelier.patient;

public class PatientMapper {
    public static PatientDTO toDTO(Patient p){
        String opLugar = null;
        String opDireccion = null;
        String opComuna = null;
        try {
            var ops = p.getOperatives();
            if (ops != null && !ops.isEmpty()) {
                cl.letelier.letelier.operative.Operative latest = null;
                for (cl.letelier.letelier.operative.Operative o : ops) {
                    if (latest == null) { latest = o; continue; }
                    var lf = latest.getFecha(); var of = o.getFecha();
                    if (lf == null && of != null) { latest = o; }
                    else if (lf != null && of != null && of.isAfter(lf)) { latest = o; }
                }
                if (latest != null) {
                    opLugar = latest.getLugar() != null && !latest.getLugar().isBlank() ? latest.getLugar() : latest.getNombre();
                    if (latest.getDireccion() != null && !latest.getDireccion().isBlank()) opDireccion = latest.getDireccion();
                    if (latest.getComuna() != null && !latest.getComuna().isBlank()) opComuna = latest.getComuna();
                }
            }
        } catch (Exception ignored) {}
        return new PatientDTO(
            p.getId(), p.getNombres(), p.getApellidos(), p.getRut(),
            p.getFechaNac(), p.getTelefono(), p.getEmail(), p.getDireccion(), p.getComuna(), p.isActivo(),
            opLugar, opDireccion, opComuna,
            null
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
        p.setComuna(d.comuna());
        p.setActivo(d.activo());
    }
}
