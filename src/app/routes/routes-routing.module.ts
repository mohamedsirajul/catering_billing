import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment } from '@env/environment';
import { AuthguardGuard } from 'app/service/authguard.guard';

import { AdminLayoutComponent } from '../theme/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from '../theme/auth-layout/auth-layout.component';
import { BookingEditComponent } from './booking-edit/booking-edit.component';
import { BulkBookingEditComponent } from './bulk-booking-edit/bulk-booking-edit.component';
import { BulkBookingNewComponent } from './bulk-booking-new/bulk-booking-new.component';
import { BulkBookingComponent } from './bulk-booking/bulk-booking.component';
import { CustomersComponent } from './customers/customers.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EstimatesEditComponent } from './estimates-edit/estimates-edit.component';
import { EstimatesNewComponent } from './estimates-new/estimates-new.component';
import { EstimatesComponent } from './estimates/estimates.component';
import { InvoicesEditComponent } from './invoices-edit/invoices-edit.component';
import { InvoicesNewComponent } from './invoices-new/invoices-new.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { PendingPaymentComponent } from './pending-payment/pending-payment.component';
import { LoginComponent } from './sessions/login/login.component';
import { RegisterComponent } from './sessions/register/register.component';
import { SettingsComponent } from './settings/settings.component';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' , canActivate: [AuthguardGuard]},
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard', titleI18n: 'dashboard' },
        canActivate: [AuthguardGuard]
      },
      {
        path: 'estimates',
        component: EstimatesComponent,
        data: { title: 'Estimates', titleI18n: 'estimates' },
        canActivate: [AuthguardGuard]
      },
      {
        path: 'estimates-new',
        component: EstimatesNewComponent,
        data: { title: 'New Estimates', titleI18n: 'estimates-new' },
        canActivate: [AuthguardGuard]
      },
      {
        path: 'estimates-edit',
        component: EstimatesEditComponent,
        data: { title: 'Edit Estimates', titleI18n: 'estimates-edit' },
        canActivate: [AuthguardGuard]
      },
      // {
      //   path: 'invoices',
      //   component: InvoicesComponent,
      //   data: { title: 'Invoices', titleI18n: 'invoices' },
      //   canActivate: [AuthguardGuard]
      // },
      // {
      //   path: 'invoices-new',
      //   component: InvoicesNewComponent,
      //   data: { title: 'New Invoices', titleI18n: 'invoices-new' },
      //   canActivate: [AuthguardGuard]
      // },
      // {
      //   path: 'invoices-edit',
      //   component: InvoicesEditComponent,
      //   data: { title: 'Edit Invoices', titleI18n: 'invoices-edit' },
      //   canActivate: [AuthguardGuard]
      // },
      {
        path: 'bulk-booking',
        component: BulkBookingComponent,
        data: { title: 'Bulk Booking', titleI18n: 'bulk-booking' },
        canActivate: [AuthguardGuard]
      },
      {
        path: 'bulk-booking-new',
        component: BulkBookingNewComponent,
        data: { title: 'New Bulk Booking ', titleI18n: 'bulk-booking-new' },
        canActivate: [AuthguardGuard]
      },
      {
        path: 'bulk-booking-edit',
        component: BulkBookingEditComponent,
        data: { title: 'Edit Bulk Booking ', titleI18n: 'bulk-booking-edit' },
        canActivate: [AuthguardGuard]
      },
      {
        path: 'booking-edit',
        component: BookingEditComponent,
        data: { title: 'Bulk Booking Edit ', titleI18n: 'booking-edit' },
        canActivate: [AuthguardGuard]
      },
      {
        path: 'pending-payment',
        component: PendingPaymentComponent,
        data: { title: 'Pending Payment', titleI18n: 'pending-payment' },
        canActivate: [AuthguardGuard]
      },
      {
        path: 'customers',
        component: CustomersComponent,
        data: { title: 'Customers', titleI18n: 'customers' },
        canActivate: [AuthguardGuard]
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { title: 'Settings', titleI18n: 'settings' },
        canActivate: [AuthguardGuard]
      },
      // {
      //   path: 'users',
      //   component: UsersComponent,
      //   data: { title: 'Users', titleI18n: 'users' },
      //   canActivate: [AuthguardGuard]
      // },
      {
        path: 'menu',
        loadChildren: () => import('./menu/menu.module').then(m => m.MenuModule),
        data: { title: 'Menu', titleI18n: 'menu'},
        canActivate: [AuthguardGuard] 
      },
      {
        path: 'insights',
        loadChildren: () => import('./insights/insights.module').then(m => m.InsightsModule),
        data: { title: 'Report', titleI18n: 'report'},
        // canActivate: [AuthguardGuard] 
      },
      {
        path: 'sessions',
        loadChildren: () => import('./sessions/sessions.module').then(m => m.SessionsModule),
        data: { title: 'Sessions', titleI18n: 'sessions' },
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent, data: { title: 'Login', titleI18n: 'login' } },
      {
        path: 'register',
        component: RegisterComponent,
        data: { title: 'Register', titleI18n: 'register' },
      },
    ],
  },
  // { path: '**', redirectTo: 'orders' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
    }),
  ],
  exports: [RouterModule],
})
export class RoutesRoutingModule {}
