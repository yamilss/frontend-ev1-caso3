import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService, Envio, ServicioCatalog } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="padding: 20px;">
      <!-- Cabecera -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
        <div>
          <h2 style="margin: 0;">Dashboard General</h2>
          <p style="margin: 4px 0 0 0; color: #4b5563;">
            Bienvenido al sistema RutaExpress
            @if (authService.currentAccount(); as account) {
              , <strong>{{ account.name || account.username }}</strong>
            }
          </p>
        </div>

        <button 
          type="button" 
          (click)="logout()" 
          style="padding: 8px 16px; background-color: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
          Cerrar sesión
        </button>
      </div>

      @if (cargando()) {
        <p>Cargando información del sistema...</p>
      } @else {

        <!-- ================= VISTA CLIENTE ================= -->
        @if (esCliente()) {
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0;">Mis Pedidos ({{ misEnvios().length }}/3)</h3>
            
            @if (misEnvios().length < 3) {
              <button 
                (click)="mostrarFormulario.set(!mostrarFormulario())" 
                style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                {{ mostrarFormulario() ? '❌ Cancelar' : '➕ Crear Nuevo Pedido' }}
              </button>
            } @else {
              <span style="color: #dc2626; font-size: 0.9rem; font-weight: bold;">⚠️ Has alcanzado el límite máximo de 3 pedidos.</span>
            }
          </div>

          <!-- Formulario de Creación para Cliente -->
          @if (mostrarFormulario() && misEnvios().length < 3) {
            <div style="border: 1px solid #2563eb; background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h4 style="margin-top: 0;">📦 Registrar Solicitud de Envío</h4>
              <form (submit)="crearPedido($event)" style="display: flex; flex-direction: column; gap: 12px;">
                <div>
                  <label style="display: block; font-weight: bold; margin-bottom: 4px;">Tipo de Servicio:</label>
                  <select [(ngModel)]="servicioIdSeleccionado" name="servicioId" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                    <option [ngValue]="null" disabled>-- Selecciona un servicio --</option>
                    @for (servicio of catalogo(); track servicio.id) {
                      <option [value]="servicio.id">{{ servicio.nombre }} - Tarifa: \${{ servicio.tarifa }} (Cupos: {{ servicio.capacidadDisponible }})</option>
                    }
                  </select>
                </div>

                <div style="display: flex; gap: 10px;">
                  <div style="flex: 1;">
                    <label style="display: block; font-weight: bold; margin-bottom: 4px;">Dirección de Origen:</label>
                    <input type="text" [(ngModel)]="direccionOrigen" name="origen" placeholder="Ej: Av. Providencia 1234" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;" />
                  </div>
                  <div style="flex: 1;">
                    <label style="display: block; font-weight: bold; margin-bottom: 4px;">Dirección de Destino:</label>
                    <input type="text" [(ngModel)]="direccionDestino" name="destino" placeholder="Ej: Av. Las Condes 5678" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  [disabled]="creandoPedido()"
                  style="align-self: flex-start; padding: 8px 20px; background: #16a34a; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                  {{ creandoPedido() ? 'Guardando...' : 'Confirmar Pedido' }}
                </button>
              </form>
            </div>
          }

          <!-- Tarjetas KPI Cliente -->
          <div style="display: flex; gap: 20px; margin-bottom: 25px;">
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; flex: 1; background: #f9fafb;">
              <h3 style="margin-top: 0; font-size: 1rem; color: #374151;">Mis Pedidos Totales</h3>
              <p style="font-size: 2rem; font-weight: bold; color: #2563eb; margin: 0;">{{ misEnvios().length }}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; flex: 1; background: #f9fafb;">
              <h3 style="margin-top: 0; font-size: 1rem; color: #374151;">Pedidos Activos</h3>
              <p style="font-size: 2rem; font-weight: bold; color: #d97706; margin: 0;">{{ enviosActivosCliente() }}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; flex: 1; background: #f9fafb;">
              <h3 style="margin-top: 0; font-size: 1rem; color: #374151;">Entregados</h3>
              <p style="font-size: 2rem; font-weight: bold; color: #16a34a; margin: 0;">{{ enviosEntregadosCliente() }}</p>
            </div>
          </div>

          <!-- Tabla de Envíos Cliente -->
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background: white;">
            <h3>📋 Lista de mis Pedidos</h3>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid #e5e7eb;">
                  <th style="padding: 8px;">Código Seguimiento</th>
                  <th style="padding: 8px;">Origen ➔ Destino</th>
                  <th style="padding: 8px;">Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (envio of misEnvios(); track envio.id) {
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 8px;"><strong>{{ envio.codigoSeguimiento || ('ENV-' + envio.id) }}</strong></td>
                    <td style="padding: 8px;">{{ envio.direccionOrigen }} ➔ {{ envio.direccionDestino }}</td>
                    <td style="padding: 8px;">
                      <span style="padding: 3px 8px; border-radius: 4px; background: #e0f2fe; color: #0369a1; font-weight: bold;">
                        {{ envio.estado }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" style="padding: 12px; text-align: center;">No tienes pedidos creados actualmente.</td></tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- ================= VISTA ADMIN / DESPACHADOR ================= -->
        @if (esAdmin() || esDespachador()) {
          <div style="display: flex; gap: 20px; margin-bottom: 25px;">
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; flex: 1; background: #f9fafb;">
              <h3 style="margin-top: 0; font-size: 1rem; color: #374151;">Total Pedidos</h3>
              <p style="font-size: 2rem; font-weight: bold; color: #2563eb; margin: 0;">{{ todosEnvios().length }}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; flex: 1; background: #f9fafb;">
              <h3 style="margin-top: 0; font-size: 1rem; color: #374151;">Pendientes (CREADO)</h3>
              <p style="font-size: 2rem; font-weight: bold; color: #d97706; margin: 0;">{{ pendientesDespachador() }}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; flex: 1; background: #f9fafb;">
              <h3 style="margin-top: 0; font-size: 1rem; color: #374151;">En Ruta</h3>
              <p style="font-size: 2rem; font-weight: bold; color: #0284c7; margin: 0;">{{ enRutaDespachador() }}</p>
            </div>
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; flex: 1; background: #f9fafb;">
              <h3 style="margin-top: 0; font-size: 1rem; color: #374151;">Entregados</h3>
              <p style="font-size: 2rem; font-weight: bold; color: #16a34a; margin: 0;">{{ entregadosDespachador() }}</p>
            </div>
          </div>

          <!-- Tabla General de Pedidos con Control de Estados y Eliminación -->
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background: white;">
            <h3>🌐 Gestión Operativa de Pedidos</h3>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid #e5e7eb;">
                  <th style="padding: 8px;">Código</th>
                  <th style="padding: 8px;">Cliente</th>
                  <th style="padding: 8px;">Ruta</th>
                  <th style="padding: 8px;">Estado Actual</th>
                  <th style="padding: 8px; text-align: center;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (envio of todosEnvios(); track envio.id) {
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 8px;"><strong>{{ envio.codigoSeguimiento || ('ENV-' + envio.id) }}</strong></td>
                    <td style="padding: 8px;">{{ envio.clienteEmail }}</td>
                    <td style="padding: 8px;">{{ envio.direccionOrigen }} ➔ {{ envio.direccionDestino }}</td>
                    <td style="padding: 8px;">
                      <span style="padding: 3px 8px; border-radius: 4px; background: #fef3c7; color: #92400e; font-weight: bold;">
                        {{ envio.estado }}
                      </span>
                    </td>
                    <td style="padding: 8px; text-align: center; display: flex; gap: 8px; justify-content: center; align-items: center;">
                      <!-- Selector de Estado -->
                      <select 
                        [ngModel]="envio.estado" 
                        (ngModelChange)="cambiarEstado(envio.id, $event)"
                        style="padding: 6px; border-radius: 4px; border: 1px solid #0284c7; font-weight: 500; cursor: pointer;">
                        <option value="CREADO">CREADO</option>
                        <option value="ACEPTADO">ACEPTADO</option>
                        <option value="EN_BODEGA">EN_BODEGA</option>
                        <option value="EN_RUTA">EN_RUTA</option>
                        <option value="ENTREGADO">ENTREGADO</option>
                        <option value="CANCELADO">CANCELADO</option>
                      </select>

                      <!-- Botón de Eliminación -->
                      <button 
                        type="button"
                        (click)="eliminarPedido(envio.id)" 
                        title="Eliminar Pedido"
                        style="padding: 6px 10px; background-color: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        🗑️
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" style="padding: 12px; text-align: center;">No hay pedidos registrados en el sistema.</td></tr>
                }
              </tbody>
            </table>
          </div>
        }

      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private apiService = inject(ApiService);

  cargando = signal(true);
  mostrarFormulario = signal(false);
  creandoPedido = signal(false);

  misEnvios = signal<Envio[]>([]);
  todosEnvios = signal<Envio[]>([]);
  catalogo = signal<ServicioCatalog[]>([]);

  servicioIdSeleccionado: number | null = null;
  direccionOrigen = '';
  direccionDestino = '';

  ngOnInit(): void {
    this.cargarDatosSegunRol();
  }

  logout(): void {
    this.authService.logout();
  }

  esAdmin(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('ADMIN');
  }

  esDespachador(): boolean {
    return this.authService.hasRole('Despachador') || this.authService.hasRole('DESPACHADOR');
  }

  esCliente(): boolean {
    return !this.esAdmin() && !this.esDespachador();
  }

  cargarDatosSegunRol(): void {
    this.cargando.set(true);
    const account = this.authService.currentAccount();
    const email = account?.username || '';

    if (this.esCliente()) {
      this.apiService.getCatalogo().subscribe({
        next: (cat) => this.catalogo.set(cat)
      });

      this.apiService.obtenerShipments(email).subscribe({
        next: (res) => { this.misEnvios.set(res); this.cargando.set(false); },
        error: () => this.cargando.set(false)
      });
    } else {
      // Admin y Despachador cargan la vista global
      this.apiService.getCatalogo().subscribe({
        next: (res) => this.catalogo.set(res)
      });

      this.apiService.obtenerShipments().subscribe({
        next: (res) => { this.todosEnvios.set(res); this.cargando.set(false); },
        error: () => this.cargando.set(false)
      });
    }
  }

  crearPedido(e: Event): void {
    e.preventDefault();
    if (this.misEnvios().length >= 3) {
      alert('Límite de 3 pedidos alcanzado.');
      return;
    }

    if (!this.servicioIdSeleccionado || !this.direccionOrigen || !this.direccionDestino) return;

    const account = this.authService.currentAccount();
    const nuevoEnvio: Partial<Envio> = {
      clienteEmail: account?.username || '',
      servicioId: Number(this.servicioIdSeleccionado),
      direccionOrigen: this.direccionOrigen,
      direccionDestino: this.direccionDestino,
      estado: 'CREADO'
    };

    this.creandoPedido.set(true);
    this.apiService.crearShipment(nuevoEnvio).subscribe({
      next: () => {
        this.creandoPedido.set(false);
        this.mostrarFormulario.set(false);
        this.direccionOrigen = '';
        this.direccionDestino = '';
        this.servicioIdSeleccionado = null;
        this.cargarDatosSegunRol();
      },
      error: (err) => {
        console.error('Error al crear pedido:', err);
        alert('Ocurrió un error al registrar el pedido.');
        this.creandoPedido.set(false);
      }
    });
  }

  cambiarEstado(id: number, nuevoEstado: string): void {
    this.apiService.cambiarEstadoEnvio(id, nuevoEstado).subscribe({
      next: () => {
        this.cargarDatosSegunRol();
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        alert('No se pudo actualizar el estado del envío.');
      }
    });
  }

  eliminarPedido(id: number): void {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el pedido #${id}?`)) {
      this.apiService.eliminarShipment(id).subscribe({
        next: () => {
          alert('Pedido eliminado correctamente.');
          this.cargarDatosSegunRol();
        },
        error: (err) => {
          console.error('Error al eliminar pedido:', err);
          alert('No se pudo eliminar el pedido.');
        }
      });
    }
  }

  // Métricas
  enviosActivosCliente() {
    return this.misEnvios().filter(e => ['CREADO', 'ACEPTADO', 'EN_BODEGA', 'EN_RUTA'].includes(e.estado)).length;
  }

  enviosEntregadosCliente() {
    return this.misEnvios().filter(e => e.estado === 'ENTREGADO').length;
  }

  serviciosCriticosAdmin() {
    return this.catalogo().filter(s => s.capacidadDisponible <= 3).length;
  }

  pendientesDespachador() {
    return this.todosEnvios().filter(e => e.estado === 'CREADO').length;
  }

  enRutaDespachador() {
    return this.todosEnvios().filter(e => e.estado === 'EN_RUTA').length;
  }

  entregadosDespachador() {
    return this.todosEnvios().filter(e => e.estado === 'ENTREGADO').length;
  }
}