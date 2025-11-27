import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export abstract class BaseCrudService<T> {
  protected constructor(protected http: HttpClient, protected ctrl: string) {}
  protected get base() { return `${environment.apiUrl}/${this.ctrl}`; }

  getAll(): Observable<T[]> { return this.http.get<T[]>(this.base); }
  getById(id: number): Observable<T> { return this.http.get<T>(`${this.base}/${id}`); }
  create(data: T): Observable<any> { return this.http.post(this.base, data); }
  update(id: number, data: Partial<T>): Observable<any> { return this.http.put(`${this.base}/${id}`, data); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.base}/${id}`); }
}
