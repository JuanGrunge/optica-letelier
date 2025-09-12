package cl.letelier.optica_letelier.operative;

public class OperativeMapper{
    public static OperativeDTO toDTO(Operative o){
        return new OperativeDTO(o.getId(),o.getNombre(),o.getLugar(),o.getDireccion(),o.getFecha(),o.getObservaciones(),o.isActivo());
    }
    public static void updateEntity(Operative o, OperativeDTO d){
        o.setNombre(d.nombre()); o.setLugar(d.lugar()); o.setDireccion(d.direccion());
        o.setFecha(d.fecha()); o.setObservaciones(d.observaciones()); o.setActivo(d.activo());
    }
}
