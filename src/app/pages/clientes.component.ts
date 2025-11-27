// src/app/pages/clientes.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

import { Cliente } from '../interfaces/cliente';
import { ClientesService } from '../services/clientes.service';

// Panel "Ver detalle"
import { Cita } from '../interfaces/cita';
import { CitasService } from '../services/citas.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  // Datos
  lista: Cliente[] = [];

  // Formulario
  form!: FormGroup;

  // Búsqueda
  search = new FormControl<string>('', { nonNullable: true });
  filtro = '';

  // Estado UI
  loading = false;
  saving  = false;
  error   = '';
  panelAbierto = false;

  // Edición
  editId?: number;
  original?: Cliente;

  // Confirmación de eliminación
  confirmVisible = false;
  selectedId?: number;
  selectedName = '';

  // Ver Detalle de cliente
  selectedCliente?: Cliente;
  detalleVisible = false;
  detalleLoading = false;
  citasCliente: Cita[] = [];

  constructor(
    private fb: FormBuilder,
    private api: ClientesService,
    private citasApi: CitasService    // Para "Ver detalle"
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: [''],
      // validación: solo 8 dígitos numéricos
      telefono: ['', [Validators.pattern(/^[0-9]{8}$/)]],
      // validación: formato de correo
      correo: ['', [Validators.email]]
    });

    this.search.valueChanges
      .pipe(debounceTime(200))
      .subscribe(v => {
        this.filtro = (v || '').trim().toLowerCase();
      });

    this.cargar();
  }

  // Getter para usar f['campo'] en el HTML
  get f() {
    return this.form.controls;
  }

  // ===== VER DETALLE DE CLIENTE =====
  verDetalle(row: Cliente): void {
    if (!row.id) return;

    this.selectedCliente = row;
    this.detalleVisible = true;
    this.detalleLoading = true;
    this.citasCliente = [];

    // Usamos getAll() de citas y filtramos en el front por idCliente
    this.citasApi.getAll().subscribe({
      next: (data: Cita[]) => {
        // Ajusta 'idCliente' si en tu interfaz se llama distinto
       this.citasCliente = data.filter(c => c.clienteId === row.id);
        this.detalleLoading = false;
      },
      error: (err: any) => {
        console.error('[CITAS][ERROR]', err);
        this.detalleLoading = false;
        // opcional: podrías mostrar un mensaje de error en pantalla
        // this.error = 'No se pudieron cargar las citas del cliente.';
      }
    });
  }

  cerrarDetalle(): void {
    this.detalleVisible = false;
    this.selectedCliente = undefined;
    this.citasCliente = [];
  }

  // Lista filtrada según búsqueda
  get listaFiltrada(): Cliente[] {
    if (!this.filtro) return this.lista;
    const t = (s: any) => (s ?? '').toString().toLowerCase();
    return this.lista.filter(c =>
      t(c.nombre).includes(this.filtro) ||
      t(c.apellidos).includes(this.filtro) ||
      t(c.telefono).includes(this.filtro) ||
      t(c.correo).includes(this.filtro)
    );
  }

  // Cargar clientes
  cargar(): void {
    this.loading = true;
    this.api.getAll().subscribe({
      next: (data: Cliente[]) => {
        this.lista = data;
        this.loading = false;
      },
      error: (_: any) => {
        this.error = 'No se pudo cargar clientes.';
        this.loading = false;
      }
    });
  }

  // Nuevo cliente
  nuevo(): void {
    this.editId = undefined;
    this.original = undefined;
    this.error = '';
    this.form.reset();
    this.panelAbierto = true;
  }

  // Editar cliente
  editar(row: Cliente): void {
    this.editId = row.id;
    this.original = { ...row };
    this.error = '';

    this.form.patchValue({
      nombre: row.nombre ?? '',
      apellidos: row.apellidos ?? '',
      telefono: row.telefono ?? '',
      correo: row.correo ?? ''
    });

    this.panelAbierto = true;
  }

  // Cerrar panel
  cancelar(): void {
    this.panelAbierto = false;
    this.form.reset();
    this.editId = undefined;
    this.original = undefined;
    this.error = '';
  }

  // Guardar (crear / actualizar)
  guardar(): void {
    // si ya está guardando, no repetir
    if (this.saving) return;

    // si el form es inválido, marcar todo y no seguir
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    const data: Cliente = {
      ...this.form.value
    };

    // Actualizar
    if (this.editId) {
      this.api.update(this.editId, data).subscribe({
        next: (_: any) => {
          this.saving = false;
          this.panelAbierto = false;
          this.cargar();
        },
        error: (_: any) => {
          this.error = 'No se pudo actualizar el cliente.';
          this.saving = false;
        }
      });
      return;
    }

    // Crear
    this.api.create(data).subscribe({
      next: (_: any) => {
        this.saving = false;
        this.panelAbierto = false;
        this.cargar();
      },
      error: (_: any) => {
        this.error = 'No se pudo crear el cliente.';
        this.saving = false;
      }
    });
  }

  // Abrir modal de confirmación
  eliminar(row: Cliente): void {
    if (!row.id) return;
    this.selectedId = row.id;
    this.selectedName = row.nombre;
    this.confirmVisible = true;
  }

  // Cancelar eliminación
  cancelarEliminacion(): void {
    this.confirmVisible = false;
    this.selectedId = undefined;
    this.selectedName = '';
  }

  // Confirmar eliminación
  confirmarEliminacion(): void {
    if (!this.selectedId) return;

    this.api.delete(this.selectedId).subscribe({
      next: (_: any) => {
        this.confirmVisible = false;
        this.selectedId = undefined;
        this.selectedName = '';
        this.cargar();
      },
      error: (_: any) => {
        this.confirmVisible = false;
        this.selectedId = undefined;
        this.selectedName = '';
        alert('No se pudo eliminar el cliente.');
      }
    });
  }
}
