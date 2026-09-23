import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ServicioCatalog } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <div style="padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>📦 Catálogo de Servicios de Envío</h2>
        <button (click)="cargarCatalogo()" style="padding: 6px 12px; cursor: pointer;">🔄 Actualizar</button>
      </div>

      <!-- Formulario visible únicamente para el Admin -->
      @if (authService.hasRole('Admin') || authService.hasRole('ADMIN')) {
        <div style="border: 1px solid #3b82f6; background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="margin-top: 0;">⚙️ Crear Nuevo Tipo de Servicio</h3>
          <form (submit)="crearServicio($event)" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <input type="text" [(ngModel)]="nuevoNombre" name="nombre" placeholder="Nombre (ej: Express 24h)" required style="padding: 8px; flex: 2;" />
            <input type="number" [(ngModel)]="nuevaTarifa" name="tarifa" placeholder="Tarifa ($)" required style="padding: 8px; flex: 1;" />
            <input type="number" [(ngModel)]="nuevaCapacidad" name="capacidad" placeholder="Capacidad inicial" required style="padding: 8px; flex: 1;" />
            <button type="submit" style="padding: 8px 16px; background: #1d4ed8; color: white; border: none; border-radius: 4px; cursor: pointer;">Guardar Servicio</button>
          </form>
        </div>
      }

      @if (cargando()) {
        <p>Cargando servicios del catálogo...</p>
      } @else if (error()) {
        <p style="color: #dc2626;">{{ error() }}</p>
      } @else {
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
          @for (servicio of servicios(); track servicio.id) {
            <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <h3 style="margin-top: 0; color: #1f2937;">{{ servicio.nombre }}</h3>
              <p style="margin: 5px 0;"><strong>Tarifa:</strong> {{ servicio.tarifa | currency:'CLP':'symbol':'1.0-0' }}</p>
              <p style="margin: 5px 0;">
                <strong>Capacidad Disponible:</strong> 
                <span [style.color]="servicio.capacidadDisponible <= 3 ? '#dc2626' : '#16a34a'" style="font-weight: bold;">
                  {{ servicio.capacidadDisponible }} cupos
                </span>
              </p>
            </div>
          } @empty {
            <p>No hay servicios registrados en el catálogo.</p>
          }
        </div>
      }
    </div>
  `
})
export class CatalogoComponent implements OnInit {
  private apiService = inject(ApiService);
  public authService = inject(AuthService);

  servicios = signal<ServicioCatalog[]>([]);
  cargando = signal<boolean>(false);
  error = signal<string>('');

  nuevoNombre = '';
  nuevaTarifa: number | null = null;
  nuevaCapacidad: number | null = null;

  ngOnInit(): void {
    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    this.cargando.set(true);
    this.error.set('');
    this.apiService.getCatalogo().subscribe({
      next: (data) => {
        this.servicios.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error al cargar el catálogo desde el BFF.');
        this.cargando.set(false);
      }
    });
  }

  crearServicio(e: Event): void {
    e.preventDefault();
    if (!this.nuevoNombre || !this.nuevaTarifa || !this.nuevaCapacidad) return;

    this.apiService.crearServicioCatalog({
      nombre: this.nuevoNombre,
      tarifa: this.nuevaTarifa,
      capacidadDisponible: this.nuevaCapacidad
    }).subscribe({
      next: () => {
        this.nuevoNombre = '';
        this.nuevaTarifa = null;
        this.nuevaCapacidad = null;
        this.cargarCatalogo();
      },
      error: () => alert('Error al crear el servicio en el catálogo.')
    });
  }
}