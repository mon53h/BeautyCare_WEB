import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError
} from '@angular/router';
import { SplashService } from './shared/splash/splash.service';
import { Observable, Subject, filter, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  // 1) Solo declaramos el tipo aquí
  visible$!: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor(private router: Router, private splashService: SplashService) {
    // 2) Y asignamos aquí (después de que Angular inyecta el servicio)
    this.visible$ = this.splashService.visible$;
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(
          e =>
            e instanceof NavigationStart ||
            e instanceof NavigationEnd ||
            e instanceof NavigationCancel ||
            e instanceof NavigationError
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(evt => {
        if (evt instanceof NavigationStart) {
          this.splashService.show();
        } else {
          // pequeño retraso para que se note elegante
          setTimeout(() => this.splashService.hide(), 500);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
