import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private msalService = inject(MsalService);
  private router = inject(Router);
  public authService = inject(AuthService);

  async ngOnInit(): Promise<void> {
    try {
      await this.msalService.instance.initialize();
    } catch (e) {
      // Ignorar si ya estaba inicializado
    }

    this.msalService.handleRedirectObservable().subscribe({
      next: (result) => {
        // Limpiamos los parámetros de la URL (?state=...) dejados por MSAL
        if (window.location.search.includes('state=')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (result?.account) {
          this.msalService.instance.setActiveAccount(result.account);
          this.authService.sincronizarCuentaYRoles();
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        // Limpieza visual de la URL en caso de retorno de logout o error
        if (window.location.search.includes('state=')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        sessionStorage.clear();
        localStorage.clear();
        this.authService.currentAccount.set(null);
        this.authService.userRoles.set([]);
      },
    });

    if (this.authService.isLoggedIn()) {
      this.authService.sincronizarCuentaYRoles();
    }
  }
}