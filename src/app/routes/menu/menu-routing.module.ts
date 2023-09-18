import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BulkProductsComponent } from './bulk-products/bulk-products.component';

import { MenuLayoutComponent } from './menu-layout/menu-layout.component';
import { ProductsComponent } from './products/products.component';
import { SubProductsComponent } from './sub-products/sub-products.component';
import { VesselsComponent } from './vessels/vessels.component';


const routes: Routes = [
  {
    path: '',
    component: MenuLayoutComponent,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'vessels',
        component: VesselsComponent,
        data: { title: 'Sub-Category' },
      },
      {
        path: 'products',
        component: ProductsComponent,
        data: { title: 'Product' },
      },
      {
        path: 'bulk-products',
        component: BulkProductsComponent,
        data: { title: 'Bulk Product' },
      },
    ],


  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuRoutingModule {}
