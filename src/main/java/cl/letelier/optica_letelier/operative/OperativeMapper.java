package cl.letelier.optica_letelier.operative;

public class OperativeMapper {
    public static OperativeDTO toDTO(Operative o) {
        return new OperativeDTO(o.getId(), o.getNombre(), o.getLugar(), o.getDireccion(),
                o.getFecha(), o.getObservaciones(), o.isActivo());
    }
    public static void updateEntity(Operative o, OperativeDTO dto) {
        o.setNombre(dto.nombre());
        o.setLugar(dto.lugar());
        o.setDireccion(dto.direccion());
        o.setFecha(dto.fecha());
        o.setObservaciones(dto.observaciones());
        o.setActivo(dto.activo());
    }
}
