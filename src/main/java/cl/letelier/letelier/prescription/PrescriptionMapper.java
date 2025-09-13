package cl.letelier.letelier.prescription;

public class PrescriptionMapper{
    public static PrescriptionDTO toDTO(Prescription p){
        return new PrescriptionDTO(p.getId(),p.getPacienteId(),
            p.getOdEsfera(),p.getOdCilindro(),p.getOdEje(),
            p.getOiEsfera(),p.getOiCilindro(),p.getOiEje(),
            p.getAddPower(),p.getObservaciones(),p.getFecha(),p.isActivo());
    }
    public static void updateEntity(Prescription e, PrescriptionDTO d){
        e.setPacienteId(d.pacienteId());
        e.setOdEsfera(d.odEsfera()); e.setOdCilindro(d.odCilindro()); e.setOdEje(d.odEje());
        e.setOiEsfera(d.oiEsfera()); e.setOiCilindro(d.oiCilindro()); e.setOiEje(d.oiEje());
        e.setAddPower(d.addPower()); e.setObservaciones(d.observaciones());
        e.setFecha(d.fecha()); e.setActivo(d.activo());
    }
}
