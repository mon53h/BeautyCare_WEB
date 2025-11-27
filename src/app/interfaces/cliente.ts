export interface Cliente {
  id?: number;              // según tu API puede ser ClienteID
  nombre: string;
  apellidos?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  fechaRegistro?: string;   // ISO 'YYYY-MM-DDTHH:mm:ss' (opcional)
  activo?: boolean;
}
