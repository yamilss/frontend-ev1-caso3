import { Component } from '@angular/core';

@Component({
  selector: 'app-stock',
  standalone: true,
  template: `
    <h2>Control de Inventario y Stock (MS Stock)</h2>
    <p style="color: #2563eb; font-weight: bold;">[Vista de Administrador]</p>
    <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th>SKU</th>
          <th>Producto</th>
          <th>Bodega</th>
          <th>Cantidad</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>SKU-001</td><td>Producto A</td><td>Central</td><td>150</td><td><button>Ajustar</button></td></tr>
        <tr><td>SKU-002</td><td>Producto B</td><td>Norte</td><td>5</td><td><button>Ajustar</button></td></tr>
      </tbody>
    </table>
  `
})
export class StockComponent {}