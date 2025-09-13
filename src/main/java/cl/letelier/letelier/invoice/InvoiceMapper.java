package cl.letelier.letelier.invoice;

public class InvoiceMapper{
    public static InvoiceDTO toDTO(Invoice e){
        return new InvoiceDTO(e.getId(),e.getPacienteId(),e.getPrescriptionId(),e.getFecha(),e.getTotal(),e.getDetalle(),e.isAnulado());
    }
    public static void updateEntity(Invoice e, InvoiceDTO d){
        e.setPacienteId(d.pacienteId()); e.setPrescriptionId(d.prescriptionId()); e.setFecha(d.fecha());
        e.setTotal(d.total()); e.setDetalle(d.detalle()); e.setAnulado(d.anulado());
    }
}
