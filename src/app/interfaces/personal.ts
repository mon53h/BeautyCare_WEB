export interface Personal {
  id?: number;            // personalID
  nombre: string;
  apellidos?: string;     // API = "apellido"
  rol?: string;
  telefono?: string;      // API = "tel"
  correo?: string;
  fechaIngreso?: string;
  activo?: boolean;
}
