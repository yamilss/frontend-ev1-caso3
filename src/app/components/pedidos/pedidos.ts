import { Component } from '@angular/core';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  template: `
    <h2>Gestión de Pedidos (MS Pedidos)</h2>
    <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th>ID</th>
          <th>Cliente</th>
          <th>Estado</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>#1001</td><td>Patricio Silva</td><td>Completado</td><td>$45.000</td></tr>
        <tr><td>#1002</td><td>Cliente Test</td><td>En Proceso</td><td>$12.500</td></tr>
      </tbody>
    </table>
  `
})
export class PedidosComponent {}