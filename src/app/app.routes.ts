import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { HomeComponent } from './components/home/home';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent, // Importación directa: elimina fallos de chunks al volver de Azure
  },
  {
    path: 'dashboard',
    canActivate: [MsalGuard],
    loadComponent: () =>
      import('./components/dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'pedidos',
    canActivate: [MsalGuard],
    loadComponent: () =>
      import('./components/pedidos/pedidos').then((m) => m.PedidosComponent),
  },
  {
    path: 'catalogo',
    canActivate: [MsalGuard],
    loadComponent: () =>
      import('./components/catalogo/catalogo').then((m) => m.CatalogoComponent),
  },
  {
    path: 'stock',
    canActivate: [MsalGuard, roleGuard('Admin')],
    loadComponent: () =>
      import('./components/stock/stock').then((m) => m.StockComponent),
  },
  { path: '**', redirectTo: '' },
];