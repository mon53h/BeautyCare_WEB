import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

import { CitasService } from '../services/citas.service';
import { ClientesService } from '../services/clientes.service';
import { PersonalService } from '../services/personal.service';

import { Cita } from '../interfaces/cita';
import { Cliente } from '../interfaces/cliente';
import { Personal } from '../interfaces/personal';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-citas',
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {

  // Datos
  lista: Cita[] = [];
  clientes: Cliente[] = [];
  personal: Personal[] = [];

  // Formulario
  form!: FormGroup;

  // Búsqueda
  search = new FormControl<string>('', { nonNullable: true });
  filtro = '';

  // Estado UI
  loading = false;
  saving = false;
  error = '';
  panelAbierto = false;

  // Edición
  editId?: number;

  // Detalle de cita
  selectedCita?: Cita;
  detalleVisible = false;

  // Para fecha de generación del PDF
  today: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private api: CitasService,
    private cliApi: ClientesService,
    private perApi: PersonalService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      clienteId: [null, Validators.required],
      personalId: [null, Validators.required],
      inicio: ['', Validators.required],
      fin: ['', Validators.required],
      estado: ['Pendiente'],
      descripcion: [''],
      notas: ['']
    });

    this.search.valueChanges
      .pipe(debounceTime(200))
      .subscribe(v => {
        this.filtro = (v || '').trim().toLowerCase();
      });

    this.cargar();
  }

  // atajo para acceder a los controles
  get f() {
    return this.form.controls;
  }

  // Obtener nombre del cliente por ID
  getClienteNombre(id: number | string): string {
    const numId = Number(id);
    const c = this.clientes.find(x => x.id === numId);
    return c ? `${c.nombre} ${c.apellidos ?? ''}`.trim() : id.toString();
  }

  // Obtener nombre del personal por ID
  getPersonalNombre(id: number | string): string {
    const numId = Number(id);
    const p = this.personal.find(x => x.id === numId);
    return p ? `${p.nombre} ${p.apellidos ?? ''}`.trim() : id.toString();
  }

  get listaFiltrada(): Cita[] {
    if (!this.filtro) return this.lista;
    const t = (s: any) => (s ?? '').toString().toLowerCase();
    return this.lista.filter(x =>
      t(this.getClienteNombre(x.clienteId)).includes(this.filtro) ||
      t(this.getPersonalNombre(x.personalId)).includes(this.filtro) ||
      t(x.estado).includes(this.filtro)
    );
  }

  // Cargar citas + combos
  cargar(): void {
    this.loading = true;

    this.api.getAll().subscribe({
      next: (d: Cita[]) => {
        this.lista = d;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar citas.';
        this.loading = false;
      }
    });

    this.cliApi.getAll().subscribe({
      next: (d: Cliente[]) => this.clientes = d
    });

    this.perApi.getAll().subscribe({
      next: (d: Personal[]) => this.personal = d
    });
  }

  nuevo(): void {
    this.editId = undefined;
    this.form.reset({
      clienteId: null,
      personalId: null,
      inicio: '',
      fin: '',
      estado: 'Pendiente',
      descripcion: '',
      notas: ''
    });
    this.panelAbierto = true;
    this.error = '';
  }

  editar(r: Cita): void {
    this.editId = r.id;

    const toLocal = (iso?: string) => {
      if (!iso) return '';
      const d = new Date(iso);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    };

    this.form.patchValue({
      clienteId: r.clienteId,
      personalId: r.personalId,
      inicio: toLocal(r.fechaHoraInicio),
      fin: toLocal(r.fechaHoraFin),
      estado: r.estado ?? 'Pendiente',
      descripcion: r.descripcion ?? '',
      notas: r.notas ?? ''
    });

    this.panelAbierto = true;
  }

  cancelar(): void {
    this.panelAbierto = false;
    this.form.reset();
    this.editId = undefined;
    this.error = '';
  }

  private toISO(local: string): string {
    try {
      return new Date(local).toISOString();
    } catch {
      return local;
    }
  }

  guardar(): void {
    if (this.saving) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    const v = this.form.value;
    const payload: Cita = {
      clienteId: Number(v.clienteId),
      personalId: Number(v.personalId),
      fechaHoraInicio: this.toISO(v.inicio),
      fechaHoraFin: this.toISO(v.fin),
      estado: v.estado ?? 'Pendiente',
      descripcion: v.descripcion ?? '',
      notas: v.notas ?? ''
    };

    const req = this.editId
      ? this.api.update(this.editId, payload)
      : this.api.create(payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.panelAbierto = false;
        this.cargar();
      },
      error: () => {
        this.error = 'No se pudo guardar la cita.';
        this.saving = false;
      }
    });
  }

  eliminar(r: Cita): void {
    if (!r.id) return;
    if (!confirm('¿Eliminar esta cita?')) return;

    this.api.delete(r.id).subscribe({
      next: () => this.cargar(),
      error: () => alert('No se pudo eliminar.')
    });
  }

  // ====== DETALLE DE CITA ======

  verDetalle(r: Cita): void {
    this.selectedCita = r;
    this.detalleVisible = true;
  }

  cerrarDetalle(): void {
    this.detalleVisible = false;
    this.selectedCita = undefined;
  }

  // ====== EXPORTAR REPORTE A PDF (VERSIÓN PRO) ======

  exportarPDF(): void {
    const data = document.getElementById('citasReporte');
    if (!data) {
      console.error('No se encontró el contenedor citasReporte');
      return;
    }

    html2canvas(data, { scale: 2 }).then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;

      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imgData = canvas.toDataURL('image/png');

      // ============ ENCABEZADO BEAUTYCARE ============
      pdf.setFillColor('#F5E1E0');
      pdf.rect(0, 0, pageWidth, 28, 'F');

      pdf.setFontSize(18);
      pdf.setTextColor('#7F6169');
      pdf.text('BeautyCare WEB', margin, 18);

      pdf.setFontSize(11);
      pdf.setTextColor('#333');
      pdf.text(`Reporte de Citas — ${new Date().toLocaleDateString()}`, margin, 25);

      // Si querés logo:
      // pdf.addImage('assets/logo.png', 'PNG', pageWidth - 45, 5, 35, 18);

      // ============ CONTENIDO ============
      let y = 38;
      pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);

      // Manejo de contenido largo
      let heightLeft = imgHeight - (pageHeight - y - margin);

      while (heightLeft > 0) {
        pdf.addPage();
        y = margin;
        pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }

      // ============ PIE DE PÁGINA ============
      pdf.setFontSize(10);
      pdf.setTextColor('#7F6169');
      pdf.text(
        'BeautyCare — Sistema de Gestión de Citas y Servicios • Práctica Empresarial 2025',
        margin,
        pageHeight - 10
      );

      pdf.save('reporte_citas_beautycare.pdf');
    }).catch(err => {
      console.error('Error generando PDF', err);
    });
  }
}
