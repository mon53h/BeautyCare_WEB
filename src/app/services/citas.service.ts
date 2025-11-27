// src/app/services/citas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cita {
  id?: number;
  clienteId: number;
  personalId: number;
  fechaHoraInicio: string;  // ISO
  fechaHoraFin: string;     // ISO
  estado?: string;
  descripcion?: string;
  notas?: string;
  // opcionales de vista
  clienteNombre?: string;
  personalNombre?: string;
}

@Injectable({ providedIn: 'root' })
export class CitasService {
  private readonly base = `${environment.apiUrl}/Citas`;
  constructor(private http: HttpClient) {}

  /** Convierte el valor de <input type="datetime-local"> a ISO real */
  private toISO(dt: string | undefined | null): string {
    if (!dt) return '';
    const d = new Date(dt);
    // Si el date es inválido, regresa string vacío para que el back valide
    return isNaN(d.getTime()) ? '' : d.toISOString();
  }

  getAll(): Observable<Cita[]> {
    return this.http.get<any>(this.base).pipe(
      map((res: any) => {
        const arr: any[] = Array.isArray(res) ? res : (res?.data ?? []);
        return arr.map(x => ({
          id: x.citaID ?? x.CitaID ?? x.id,
          clienteId: x.clienteID ?? x.ClienteID ?? x.clienteId,
          personalId: x.personalID ?? x.PersonalID ?? x.personalId,
          fechaHoraInicio: x.fechaHoraInicio ?? x.FechaHoraInicio ?? '',
          fechaHoraFin:    x.fechaHoraFin    ?? x.FechaHoraFin    ?? '',
          // NO asumimos 'Pendiente' desde el GET; mostramos lo que venga
          estado: x.estado ?? x.Estado ?? '',
          descripcion: x.descripcion ?? x.Descripcion ?? '',
          notas: x.notas ?? x.Notas ?? '',
          clienteNombre: x.clienteNombre ?? x.ClienteNombre ?? '',
          personalNombre: x.personalNombre ?? x.PersonalNombre ?? '',
        })) as Cita[];
      })
    );
  }

  /** POST en JSON */
  create(c: Cita): Observable<any> {
    const body = {
      clienteID: c.clienteId,
      personalID: c.personalId,
      fechaHoraInicio: this.toISO(c.fechaHoraInicio),
      fechaHoraFin:    this.toISO(c.fechaHoraFin),
      // Usa un valor permitido por el CHECK de la BD (p.ej. 'Agendada')
      estado: (c.estado?.trim() || 'Agendada'),
      descripcion: c.descripcion ?? '',
      notas: c.notas ?? ''
    };
    return this.http.post(this.base, body);
  }

  /** PUT en JSON */
  update(id: number, c: Cita): Observable<any> {
    const body = {
      clienteID: c.clienteId,
      personalID: c.personalId,
      fechaHoraInicio: this.toISO(c.fechaHoraInicio),
      fechaHoraFin:    this.toISO(c.fechaHoraFin),
      estado: (c.estado?.trim() || 'Agendada'),
      descripcion: c.descripcion ?? '',
      notas: c.notas ?? ''
    };
    return this.http.put(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
