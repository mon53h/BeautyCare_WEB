import { Component, OnInit } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';
import { PersonalService } from '../../services/personal.service';
import { ServiciosService } from '../../services/servicios.service';
import { CitasService } from '../../services/citas.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  resumen = {
    clientes: 0,
    personal: 0,
    servicios: 0,
    citasHoy: 0
  };

  proximasCitas: any[] = [];

  constructor(
    private clientesApi: ClientesService,
    private personalApi: PersonalService,
    private serviciosApi: ServiciosService,
    private citasApi: CitasService
  ) {}

  ngOnInit(): void {
    this.cargarResumen();
    this.cargarProximasCitas();
  }

  cargarResumen(): void {
    // Total clientes
    this.clientesApi.getAll().subscribe(c => {
      this.resumen.clientes = c.length;
    });

    // Total personal
    this.personalApi.getAll().subscribe(p => {
      this.resumen.personal = p.length;
    });

    // Total servicios
    this.serviciosApi.getAll().subscribe(s => {
      this.resumen.servicios = s.length;
    });

    // Citas del día
    this.citasApi.getAll().subscribe(citas => {
      const hoy = new Date().toDateString();

      this.resumen.citasHoy = citas.filter(c =>
        new Date(c.fechaHoraInicio).toDateString() === hoy
      ).length;
    });
  }

 cargarProximasCitas(): void {
  this.citasApi.getAll().subscribe(citas => {
    const ahora = new Date();

    this.proximasCitas = citas
      .filter(c => new Date(c.fechaHoraInicio) > ahora)
      .sort((a, b) => new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime())
      .slice(0, 5) // solo las siguientes 5 citas
      .map(c => ({
        // Mostramos el ID del cliente mientras tanto
        cliente: `Cliente #${c.clienteId}`,
        // Usamos la descripción de la cita como "servicio" visible
        servicio: c.descripcion || 'Servicio',
        // Hora formateada
        hora: new Date(c.fechaHoraInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        // Mostramos el ID del personal
        profesional: `Personal #${c.personalId}`
      }));
  });
}
}
