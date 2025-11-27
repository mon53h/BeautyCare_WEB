export interface Cita {
  id?: number;              // API: citaID
  clienteId: number;        // API: clienteID
  personalId: number;       // API: personalID
  fechaHoraInicio: string;  // ISO
  fechaHoraFin: string;     // ISO
  estado?: string;
  descripcion?: string;
  notas?: string;

  // opcionales solo para mostrar en la tabla
  clienteNombre?: string;
  personalNombre?: string;
}
