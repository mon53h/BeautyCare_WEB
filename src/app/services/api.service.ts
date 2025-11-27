import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Convierte un objeto en HttpParams */
  private toParams(params?: Record<string, any>): HttpParams {
    let hp = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) hp = hp.set(k, String(v));
      });
    }
    return hp;
  }

  /** Peticiones GET */
  get<T>(path: string, params?: Record<string, any>): Observable<T> {
    return this.http
      .get<T>(`${this.base}/${path}`, { params: this.toParams(params) })
      .pipe(catchError(this.handleError));
  }

  /** Peticiones POST */
  post<T>(path: string, body: any): Observable<T> {
    return this.http
      .post<T>(`${this.base}/${path}`, body)
      .pipe(catchError(this.handleError));
  }

  /** Peticiones PUT */
  put<T>(path: string, body: any): Observable<T> {
    return this.http
      .put<T>(`${this.base}/${path}`, body)
      .pipe(catchError(this.handleError));
  }

  /** Peticiones DELETE */
  delete<T>(path: string, params?: Record<string, any>): Observable<T> {
    return this.http
      .delete<T>(`${this.base}/${path}`, { params: this.toParams(params) })
      .pipe(catchError(this.handleError));
  }

  /** Manejo centralizado de errores */
  private handleError(error: HttpErrorResponse) {
    const msg =
      error.error?.message ||
      error.error?.title ||
      error.statusText ||
      'Error de comunicación con el servidor.';
    console.error('[ApiService error]:', msg);
    return throwError(() => new Error(msg));
  }
}
