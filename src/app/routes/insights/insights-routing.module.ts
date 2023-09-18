import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { CustomerComponent } from './customer/customer.component';
import { EstimatePaymentComponent } from './est-payment/est-payment.component';
import { InsightsLayoutComponent } from './insights-layout/insights-layout.component';
import { LogComponent } from './log/log.component';
import { PaymentComponent } from './payment/payment.component';
import { ProductBillComponent } from './product-bill/product-bill.component';
import { ProductComponent } from './product/product.component';
import { SalesComponent } from './sales/sales.component';
import { TaxComponent } from './tax/tax.component';

const routes: Routes = [
  {
    path: '',
    component: InsightsLayoutComponent,
    children: [
      { path: '', redirectTo: 'booking', pathMatch: 'full' },
      {
        path: 'sales',
        component: SalesComponent,
        data: { title: 'Sales' },
      },
      {
        path: 'booking',
        component: BookingComponent,
        data: { title: 'Booking' },
      },
      {
        path: 'product',
        component: ProductComponent,
        data: { title: 'Product' },
      },
      {
        path: 'product-bill',
        component: ProductBillComponent,
        data: { title: 'Product-Bill' },
      },
      {
        path: 'customer',
        component: CustomerComponent,
        data: { title: 'Customer' },
      },
      {
        path: 'payment',
        component: PaymentComponent,
        data: { title: 'Payment' },
      },
      {
        path: 'est-payment',
        component: EstimatePaymentComponent,
        data: { title: 'Estimate Payment' },
      },
      {
        path: 'tax',
        component: TaxComponent,
        data: { title: 'Tax' },
      },
      {
        path: 'log',
        component: LogComponent,
        data: { title: 'Log' },
      },

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsightsRoutingModule {}
