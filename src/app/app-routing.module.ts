// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { LayoutComponent } from './shared/layout/layout/layout.component';

//PAGINAS
import { ClientesComponent } from './pages/clientes.component';
import { PersonalComponent } from './pages/personal.component';
import { ServiciosComponent } from './pages/servicios.component';
import { CitasComponent } from './pages/citas.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    children: [
      { path: 'inicio', component: DashboardComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'personal', component: PersonalComponent },
      { path: 'servicios', component: ServiciosComponent },
      { path: 'citas', component: CitasComponent },
      { path: '', redirectTo: 'clientes', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
