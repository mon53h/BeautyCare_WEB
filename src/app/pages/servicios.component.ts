import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Servicio } from '../interfaces/servicio';
import { ServiciosService } from '../services/servicios.service';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css']
})
export class ServiciosComponent implements OnInit {
  lista: Servicio[] = [];
  form!: FormGroup;

  search = new FormControl<string>('', { nonNullable: true });
  filtro = '';

  loading = false;
  saving = false;
  error = '';
  panelAbierto = false;

  editId?: number;
  original?: Servicio;

  constructor(private fb: FormBuilder, private api: ServiciosService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      duracionMin: [0, [Validators.required, Validators.min(0)]]
    });

    this.search.valueChanges.pipe(debounceTime(200)).subscribe(v => {
      this.filtro = (v || '').trim().toLowerCase();
    });

    this.cargar();
  }

  /** Lista filtrada */
  get listaFiltrada(): Servicio[] {
    if (!this.filtro) return this.lista;
    const t = (s: any) => (s ?? '').toString().toLowerCase();
    return this.lista.filter(x =>
      t(x.nombre).includes(this.filtro)
    );
  }

  /** Cargar servicios */
  cargar(): void {
    this.loading = true;
    this.api.getAll().subscribe({
      next: data => { this.lista = data; this.loading = false; },
      error: _ => { this.error = 'No se pudieron cargar los servicios.'; this.loading = false; }
    });
  }

  /** Nuevo */
  nuevo(): void {
    this.editId = undefined;
    this.original = undefined;
    this.form.reset({ precio: 0, duracionMin: 0 });
    this.panelAbierto = true;
    this.error = '';
  }

  /** Editar */
  editar(row: Servicio): void {
    this.editId = row.id;
    this.original = { ...row };
    this.form.patchValue(row);
    this.panelAbierto = true;
    this.error = '';
  }

  /** Cancelar */
  cancelar(): void {
    this.panelAbierto = false;
    this.form.reset({ precio: 0, duracionMin: 0 });
    this.editId = undefined;
    this.original = undefined;
    this.error = '';
  }

  /** Guardar */
  guardar(): void {
    if (this.form.invalid || this.saving) return;

    this.saving = true;
    this.error = '';

    const data: Servicio = this.form.value;

    if (this.editId) {
      this.api.update(this.editId, data).subscribe({
        next: _ => { this.saving = false; this.panelAbierto = false; this.cargar(); },
        error: _ => { this.error = 'No se pudo actualizar el servicio.'; this.saving = false; }
      });
      return;
    }

    this.api.create(data).subscribe({
      next: _ => { this.saving = false; this.panelAbierto = false; this.cargar(); },
      error: _ => { this.error = 'No se pudo crear el servicio.'; this.saving = false; }
    });
  }

  /** Eliminar */
  eliminar(row: Servicio): void {
    const id = row.id;
    if (!id) return;
    if (!confirm(`¿Eliminar el servicio "${row.nombre}"?`)) return;

    this.api.delete(id).subscribe({
      next: _ => this.cargar(),
      error: _ => alert('No se pudo eliminar el servicio.')
    });
  }
}
