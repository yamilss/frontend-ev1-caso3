import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ServicioCatalog {
  id: number;
  nombre: string;
  tarifa: number;
  capacidadDisponible: number;
}

export interface Envio {
  id: number;
  codigoSeguimiento: string;
  clienteEmail: string;
  servicioId: number;
  direccionOrigen: string;
  direccionDestino: string;
  estado: 'CREADO' | 'ACEPTADO' | 'EN_BODEGA' | 'EN_RUTA' | 'ENTREGADO' | 'CANCELADO';
  fechaCreacion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private withAuth<T>(fn: (headers: HttpHeaders) => Observable<T>): Observable<T> {
    return from(this.authService.obtenerAccessToken()).pipe(
      switchMap((token) => {
        if (!token) {
          throw new Error('No se pudo obtener un Access Token válido de Microsoft Entra ID.');
        }
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
        return fn(headers);
      })
    );
  }

  probarConexionBff(): Observable<HttpResponse<any>> {
    return this.withAuth((headers) =>
      this.http.get<any>(`${environment.azure.api.url}/catalog/services`, {
        headers,
        observe: 'response',
      })
    );
  }

  getCatalogo(): Observable<ServicioCatalog[]> {
    return this.withAuth((headers) =>
      this.http.get<ServicioCatalog[]>(`${environment.azure.api.url}/catalog/services`, { headers })
    );
  }

  crearServicioCatalog(servicio: Partial<ServicioCatalog>): Observable<ServicioCatalog> {
    return this.withAuth((headers) =>
      this.http.post<ServicioCatalog>(`${environment.azure.api.url}/catalog/services`, servicio, { headers })
    );
  }

  obtenerShipments(email?: string): Observable<Envio[]> {
    const url = email
      ? `${environment.azure.api.url}/shipments?email=${encodeURIComponent(email)}`
      : `${environment.azure.api.url}/shipments`;

    return this.withAuth((headers) =>
      this.http.get<Envio[]>(url, { headers })
    );
  }
  // Eliminar pedido por ID (solo Admin)
  eliminarShipment(id: number): Observable<any> {
    return this.withAuth((headers) =>
      this.http.delete(`${environment.azure.api.url}/shipments/${id}`, { headers })
    );
  }

  /**
   * ✅ CORREGIDO: Envía el objeto envio en el BODY de la petición POST
   */
  crearShipment(envio: Partial<Envio>): Observable<Envio> {
    return this.withAuth((headers) =>
      this.http.post<Envio>(`${environment.azure.api.url}/shipments`, envio, { headers })
    );
  }

  cambiarEstadoEnvio(id: number, estado: string): Observable<Envio> {
    return this.withAuth((headers) =>
      this.http.patch<Envio>(
        `${environment.azure.api.url}/shipments/${id}/status?status=${estado}`,
        {},
        { headers }
      )
    );
  }
}