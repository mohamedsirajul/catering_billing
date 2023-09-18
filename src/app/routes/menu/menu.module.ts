import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { BulkProductsComponent } from './bulk-products/bulk-products.component';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';
import { MenuLayoutComponent } from './menu-layout/menu-layout.component';
import { MenuRoutingModule } from './menu-routing.module';
import { ProductsComponent } from './products/products.component';
import { SubProductsComponent } from './sub-products/sub-products.component';
import { VesselDialogBoxComponent } from './vessel-dialog-box/vessel-dialog-box.component';
import { VesselsComponent } from './vessels/vessels.component';


const COMPONENTS = [
  MenuLayoutComponent,
  SubProductsComponent,
  ProductsComponent,
  BulkProductsComponent,
  VesselsComponent,
  DialogBoxComponent,
  VesselDialogBoxComponent
];
const COMPONENTS_DYNAMIC = [];

@NgModule({
  imports: [SharedModule, MenuRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC],
  entryComponents: COMPONENTS_DYNAMIC,
})
export class MenuModule {}
