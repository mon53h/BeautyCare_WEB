import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombreUsuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = '';

    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/clientes']),
      error: () => {
        this.error = 'Credenciales inválidas o API no disponible.';
        this.loading = false;
      }
    });
  }

  // 🔸 Guarda las coordenadas del cursor
  onButtonMouseMove(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--x', `${e.clientX - rect.left}px`);
    target.style.setProperty('--y', `${e.clientY - rect.top}px`);
  }

  // 🔸 Activa el ripple (se usa solo para reiniciar animación)
  onButtonClick(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('ripple-active');
    void target.offsetWidth; // fuerza el reflow
    target.classList.add('ripple-active');
  }
}
