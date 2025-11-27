// src/app/shared/layout/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(private auth: AuthService, private router: Router) {}

  get userName() {
    return this.auth.currentUserName || 'Usuario';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
