// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Componentes
import { LoginComponent } from './auth/login/login.component';

import { ClientesComponent } from './pages/clientes.component';
import { PersonalComponent } from './pages/personal.component';
import { ServiciosComponent } from './pages/servicios.component';
import { CitasComponent } from './pages/citas.component';


//TRANSICION ENTRE MODULOS
import { SplashComponent } from './shared/splash/splash.component';

// Interceptor (token)
import { AuthInterceptor } from './auth/auth.interceptor';

//ESTETICA PAGINA
import { LayoutComponent } from './shared/layout/layout/layout.component';
import { NavbarComponent } from './shared/layout/navbar/navbar.component';
import { SidebarComponent } from './shared/layout/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FooterComponent } from './shared/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ClientesComponent,
    PersonalComponent,
    ServiciosComponent,
    CitasComponent,
    SplashComponent,
    LayoutComponent,
    NavbarComponent,
    SidebarComponent,
    DashboardComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
