import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { BookingComponent } from './booking/booking.component';
import { CustomerComponent } from './customer/customer.component';
import { EstimatePaymentComponent } from './est-payment/est-payment.component';
import { InsightsLayoutComponent } from './insights-layout/insights-layout.component';
import { InsightsRoutingModule } from './insights-routing.module';
import { LogComponent } from './log/log.component';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { PaymentLayoutComponent } from './payment-layout/payment-layout.component';
import { PaymentComponent } from './payment/payment.component';
import { ProductBillComponent } from './product-bill/product-bill.component';
import { ProductComponent } from './product/product.component';
import { SalesComponent } from './sales/sales.component';
import { TaxComponent } from './tax/tax.component';


const COMPONENTS = [
  InsightsLayoutComponent,
  SalesComponent,
  BookingComponent,
  CustomerComponent,
  PaymentComponent,
  EstimatePaymentComponent,
  PaymentLayoutComponent,
  TaxComponent,
  LogComponent,
  ProductComponent,
  ProductBillComponent,
  PaymentDialogComponent
];
const COMPONENTS_DYNAMIC = [];

@NgModule({
  imports: [SharedModule, InsightsRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC],
  entryComponents: COMPONENTS_DYNAMIC,
})
export class InsightsModule {}
