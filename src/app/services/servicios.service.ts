// src/app/services/servicios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

import { Servicio } from '../interfaces/servicio';

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private readonly base = `${environment.apiUrl}/Servicios`;

  constructor(private http: HttpClient) {}

  /** GET /Servicios */
  getAll(): Observable<Servicio[]> {
    return this.http.get<any>(this.base).pipe(
      map((res: any) => {
        const arr: any[] = Array.isArray(res) ? res : (res?.data ?? []);
        return arr.map(x => ({
          id:          x.servicioID ?? x.ServicioID ?? x.id,
          nombre:      x.nombre ?? x.Nombre ?? '',
          precio:      Number(x.precio ?? x.Precio ?? 0),
          duracionMin: Number(x.duracionMin ?? x.DuracionMin ?? 0),
          descripcion: '',
          activo:      true
        }) as Servicio);
      })
    );
  }

  /** GET /Servicios/{id} (opcional) */
  getById(id: number): Observable<Servicio> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(
      map(x => ({
        id:          x.servicioID ?? x.ServicioID ?? x.id,
        nombre:      x.nombre ?? x.Nombre ?? '',
        precio:      Number(x.precio ?? x.Precio ?? 0),
        duracionMin: Number(x.duracionMin ?? x.DuracionMin ?? 0),
        descripcion: '',
        activo:      true
      }))
    );
  }

  /** POST /Servicios  (en query-string, como tu API de Personal) */
  create(data: Servicio): Observable<any> {
    const params = new HttpParams()
      .set('nombre', data.nombre ?? '')
      .set('precio', String(data.precio ?? 0))
      .set('duracionMin', String(data.duracionMin ?? 0));

    // cuerpo null, params en la URL
    return this.http.post(this.base, null, { params });
  }

  /** PUT /Servicios/{id}  (en query-string, solo lo que venga) */
  update(id: number, data: Servicio): Observable<any> {
    let params = new HttpParams();
    if (data.nombre != null)      params = params.set('nombre', data.nombre);
    if (data.precio != null)      params = params.set('precio', String(data.precio));
    if (data.duracionMin != null) params = params.set('duracionMin', String(data.duracionMin));

    return this.http.put(`${this.base}/${id}`, null, { params });
  }

  /** DELETE /Servicios/{id} */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
