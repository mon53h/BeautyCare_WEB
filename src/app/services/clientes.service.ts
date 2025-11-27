// src/app/services/clientes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cliente } from '../interfaces/cliente';

type RawCliente = any;

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly base = `${environment.apiUrl}/Clientes`;

  constructor(private http: HttpClient) {}

  // ========== MAP IN (API -> FRONT) ==========
  private mapIn(x: RawCliente): Cliente {
    return {
      id:            x.ClienteID ?? x.clienteID ?? x.id,
      nombre:        x.Nombre ?? x.nombre ?? '',
      apellidos:     x.Apellidos ?? x.apellidos ?? x.Apellido ?? '',
      telefono:      x.Telefono ?? x.telefono ?? '',
      correo:        x.CorreoElectronico ?? x.correoElectronico ?? x.Correo ?? x.correo ?? '',
      fechaRegistro: x.FechaRegistro ?? x.fechaRegistro,
      activo:        x.Activo ?? x.activo ?? true
    };
  }

  // ========== LISTAR ==========
  getAll(): Observable<Cliente[]> {
    return this.http.get<any>(this.base).pipe(
      tap(raw => console.log('[CLIENTES][RAW]', raw)),
      map(res => {
        const arr: RawCliente[] = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = arr.map(r => this.mapIn(r));
        console.log('[CLIENTES][MAPPED]', mapped);
        return mapped;
      })
    );
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<RawCliente>(`${this.base}/${id}`).pipe(
      map(r => this.mapIn(r))
    );
  }

  // ========== CREAR ==========
  create(c: Cliente): Observable<any> {
    let params = new HttpParams()
      .set('nombre', c.nombre ?? '')
      .set('apellidos', c.apellidos ?? '')
      .set('telefono', c.telefono ?? '')
      .set('correoElectronico', c.correo ?? '');

    console.log('[CLIENTES][CREATE][PARAMS]', params.toString());
    return this.http.post(this.base, null, { params });
  }

  // ========== ACTUALIZAR ==========
  update(id: number, c: Cliente): Observable<any> {
    let params = new HttpParams()
      .set('nombre', c.nombre ?? '')
      .set('apellidos', c.apellidos ?? '')
      .set('telefono', c.telefono ?? '')
      .set('correoElectronico', c.correo ?? '');

    console.log('[CLIENTES][UPDATE][ID]', id, '[PARAMS]', params.toString());
    return this.http.put(`${this.base}/${id}`, null, { params });
  }

  // ========== ELIMINAR ==========
  delete(id: number): Observable<any> {
    console.log('[CLIENTES][DELETE][ID]', id);
    return this.http.delete(`${this.base}/${id}`);
  }
}
