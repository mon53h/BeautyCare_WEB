import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface LoginRequest {
  nombreUsuario: string;
  contrasena: string;
}

interface LoginResponse {
  token: string;
  // puedes añadir aquí otros campos si tu API los devuelve (por ejemplo: rol, nombre, correo, etc.)
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Endpoint base del backend para autenticación
  private readonly base = `${environment.apiUrl}/Login`;

  constructor(private http: HttpClient) {}

   /** 🔹 Inicia sesión y guarda el token */
  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, payload).pipe(
      tap(res => {
        if (res?.token) {
          localStorage.setItem('bc_token', res.token); //  aquí tu token real
        }
      })
    );
  }

  /** 🔹 Cierra sesión */
  logout(): void {
    localStorage.removeItem('bc_token'); //  misma clave
  }

  /** 🔹 Obtiene el token actual */
  get token(): string | null {
    return localStorage.getItem('bc_token'); //  misma clave
  }

  /** 🔹 Verifica si el usuario está logueado */
  get isLoggedIn(): boolean {
    return !!this.token;
  }

  /** 🔹 Obtiene el nombre del usuario desde el payload del JWT */
  get currentUserName(): string | null {
    const token = this.token;
    if (!token || token.split('.').length !== 3) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Ajusta el campo al que devuelva tu API
      return (
        payload?.nombreUsuario ||
        payload?.unique_name ||
        payload?.sub ||
        null
      );
    } catch {
      return null;
    }
  }
}