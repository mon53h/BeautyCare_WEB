// src/app/services/personal.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Personal } from '../interfaces/personal';

@Injectable({ providedIn: 'root' })
export class PersonalService {
  private readonly base = `${environment.apiUrl}/Personal`;

  constructor(private http: HttpClient) {}

  /** Escoge la primera clave existente y no vacía de un objeto */
  private pick(obj: any, ...keys: string[]) {
    for (const k of keys) {
      if (obj && obj[k] != null && obj[k] !== '') return obj[k];
    }
    return '';
  }

  /** GET: lista de personal (mapeando posibles claves de la API) */
  getAll(): Observable<Personal[]> {
    return this.http.get<any>(this.base).pipe(
      tap(raw => console.log('[PERSONAL][RAW]', raw)),
      map((raw: any) => {
        const arr = Array.isArray(raw) ? raw : (raw?.data ?? []);
        const mapped = arr.map((x: any) => {
          const fecha = this.pick(x, 'fechaIngreso', 'FechaIngreso');
          return {
            id:           this.pick(x, 'id', 'personalID', 'PersonalID'),
            nombre:       this.pick(x, 'nombre', 'Nombre'),
            apellidos:    this.pick(x, 'apellidos', 'Apellidos', 'apellido', 'Apellido'),
            rol:          this.pick(x, 'rol', 'Rol'),
            telefono:     this.pick(x, 'telefono', 'Telefono', 'tel', 'Tel'),
            correo:       this.pick(x, 'correo', 'Correo', 'correoElectronico', 'CorreoElectronico'),
            fechaIngreso: fecha || null,
            activo:       this.pick(x, 'activo', 'Activo') !== '' ? !!this.pick(x, 'activo', 'Activo') : true
          } as Personal;
        });
        console.log('[PERSONAL][MAPPED]', mapped);
        return mapped;
      })
    );
  }

  /** POST: crear (tu API usa [FromQuery], por eso enviamos todo en params) */
  create(data: Personal): Observable<any> {
    let params = new HttpParams()
      .set('nombre', data.nombre ?? '')
      .set('rol', data.rol ?? '')
      .set('apellido', data.apellidos ?? '')
      .set('tel', data.telefono ?? '')
      .set('correo', data.correo ?? '')
      // fechaIngreso debe venir en ISO si es fecha; si no hay, enviar vacío
      .set('fechaIngreso', data.fechaIngreso ?? '')
      .set('activo', String(data.activo ?? true));

    // body null; todo via querystring por [FromQuery]
    return this.http.post(this.base, null, { params });
  }

  /** PUT: actualizar (sólo mandamos los campos presentes) */
  update(id: number, data: Personal): Observable<any> {
    let params = new HttpParams();
    const setIf = (key: string, val: any) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    };

    setIf('nombre', data.nombre);
    setIf('apellido', data.apellidos);
    setIf('rol', data.rol);
    setIf('tel', data.telefono);
    setIf('correo', data.correo);
    setIf('fechaIngreso', data.fechaIngreso); // idealmente ISO
    if (data.activo !== undefined && data.activo !== null) {
      params = params.set('activo', String(!!data.activo));
    }

    return this.http.put(`${this.base}/${id}`, null, { params });
  }

  /** DELETE */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
