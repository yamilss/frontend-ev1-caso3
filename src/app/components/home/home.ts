import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  public authService = inject(AuthService);
  private apiService = inject(ApiService);

  mensajeApi = '';
  cargando = signal(false);
  errorApi = '';

  get account() {
    return this.authService.currentAccount();
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }

  probarApi(): void {
    this.cargando.set(true);
    this.mensajeApi = '';
    this.errorApi = '';

    this.apiService.probarConexionBff().subscribe({
      next: (respuesta) => {
        const status = respuesta.status || 200;
        const contenido = respuesta.body || 'Conexión exitosa';
        this.mensajeApi = `HTTP ${status} OK - ${contenido}`;
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Detalle del error en Home:', error);
        this.errorApi = `Error ${error.status || '0'}: ${error.message || error.statusText || 'Error de red / CORS / Token'}`;
        this.cargando.set(false);
      },
    });
  }
}