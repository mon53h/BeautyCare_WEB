// src/app/pages/personal.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

import { Personal } from '../interfaces/personal';            // <-- ajusta la ruta si tu carpeta interfaces está en otro lado
import { PersonalService } from '../services/personal.service'; // <-- ajusta la ruta si tu servicio está en otro lado

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
})
export class PersonalComponent implements OnInit {
  // datos
  lista: Personal[] = [];

  // formulario
  form!: FormGroup;

  // búsqueda
  search = new FormControl<string>('', { nonNullable: true });
  filtro = '';

  // estado UI
  loading = false;
  saving  = false;
  error   = '';
  panelAbierto = false;

  // edición
  editId?: number;
  original?: Personal;

  constructor(
    private fb: FormBuilder,
    private api: PersonalService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: [''],
      rol: [''],
      telefono: [''],     // en la API llega como "tel"
      correo: ['', [Validators.email]],
      // el input es <input type="date">; guardamos como string/ISO
      fechaIngreso: [''],
      activo: [true]
    });

    this.search.valueChanges.pipe(debounceTime(200)).subscribe(v => {
      this.filtro = (v || '').trim().toLowerCase();
    });

    this.cargar();
  }

  /** Lista filtrada para la tabla */
  get listaFiltrada(): Personal[] {
    if (!this.filtro) return this.lista;
    const t = (s: any) => (s ?? '').toString().toLowerCase();
    return this.lista.filter(x =>
      t(x.nombre).includes(this.filtro) ||
      t(x.apellidos).includes(this.filtro) ||
      t(x.rol).includes(this.filtro) ||
      t(x.telefono).includes(this.filtro) ||
      t(x.correo).includes(this.filtro)
    );
  }

  /** Carga inicial / reload */
 cargar(): void {
  this.loading = true;
  this.api.getAll().subscribe({
    next: data => {
      this.lista = data;
      this.loading = false;
      console.table(this.lista); // <-- te mostrará apellidos/telefono/correo ya mapeados
    },
    error: _ => { this.error = 'No se pudo cargar el personal.'; this.loading = false; }
  });
}


  /** Abrir panel "Nuevo" */
  nuevo(): void {
    this.editId = undefined;
    this.original = undefined;
    this.form.reset({ activo: true });
    this.panelAbierto = true;
    this.error = '';
  }

  /** Abrir panel "Editar" con datos */
  editar(row: Personal): void {
    this.editId = row.id;                     // en servicio mapeamos personalID -> id
    this.original = { ...row };

    // Convertir fecha ISO a yyyy-MM-dd para el input type="date"
    let fecha = '';
    if (row.fechaIngreso) {
      try {
        const d = new Date(row.fechaIngreso);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        fecha = `${d.getFullYear()}-${mm}-${dd}`;
      } catch {}
    }

    this.form.patchValue({
      nombre: row.nombre ?? '',
      apellidos: row.apellidos ?? '',
      rol: row.rol ?? '',
      telefono: row.telefono ?? '',
      correo: row.correo ?? '',
      fechaIngreso: fecha,
      activo: row.activo ?? true
    });

    this.panelAbierto = true;
    this.error = '';
  }

  /** Cerrar panel y limpiar */
  cancelar(): void {
    this.panelAbierto = false;
    this.form.reset({ activo: true });
    this.editId = undefined;
    this.original = undefined;
    this.error = '';
  }

  /** Crear/Actualizar */
  guardar(): void {
    if (this.form.invalid || this.saving) return;

    this.saving = true;
    this.error = '';

    // normalizamos fechaIngreso (de yyyy-MM-dd a ISO) si hay valor
    const v = this.form.value;
    let fechaISO: string | undefined;
    if (v.fechaIngreso) {
      // si viene "yyyy-MM-dd", convertimos a ISO
      try {
        fechaISO = new Date(v.fechaIngreso).toISOString();
      } catch {
        fechaISO = v.fechaIngreso; // por si ya venía ISO
      }
    }

    const data: Personal = {
      ...v,
      fechaIngreso: fechaISO
    } as Personal;

    if (this.editId) {
      // mantener lo que sea necesario (opcional)
      this.api.update(this.editId, data).subscribe({
        next: _ => { this.saving = false; this.panelAbierto = false; this.cargar(); },
        error: _ => { this.error = 'No se pudo actualizar el registro.'; this.saving = false; }
      });
      return;
    }

    this.api.create(data).subscribe({
      next: _ => { this.saving = false; this.panelAbierto = false; this.cargar(); },
      error: _ => { this.error = 'No se pudo crear el registro.'; this.saving = false; }
    });
  }

  /** Eliminar */
  eliminar(row: Personal): void {
    const id = row.id;
    if (!id) return;
    if (!confirm(`¿Eliminar a ${row.nombre}?`)) return;

    this.api.delete(id).subscribe({
      next: _ => this.cargar(),
      error: _ => alert('No se pudo eliminar el registro.')
    });
  }
}
