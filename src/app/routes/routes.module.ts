import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { RoutesRoutingModule } from './routes-routing.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './sessions/login/login.component';
import { RegisterComponent } from './sessions/register/register.component';

import { ReportmodelComponent } from '@shared/model/reportmodel/reportmodel.component';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { EstimatesComponent } from './estimates/estimates.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { CustomersComponent } from './customers/customers.component';
import { SettingsComponent } from './settings/settings.component';
import { EstimatesNewComponent } from './estimates-new/estimates-new.component';
import { EstimatesEditComponent } from './estimates-edit/estimates-edit.component';
import { InvoicesEditComponent } from './invoices-edit/invoices-edit.component';
import { InvoicesNewComponent } from './invoices-new/invoices-new.component';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';
import { NewDialogBoxComponent } from './new-dialog-box/new-dialog-box.component';
import { UsersComponent } from './users/users.component';
import { UserDialogBoxComponent } from './user-dialog-box/user-dialog-box.component';
import { ProgressSpinnerComponent } from 'app/service/progress-spinner/progress-spinner.component';
import { PayDialogBoxComponent } from './pay-dialog-box/pay-dialog-box.component';
import { InputDialogComponent } from './input-dialog/input-dialog.component';
import { BulkBookingComponent } from './bulk-booking/bulk-booking.component';
import { BulkBookingNewComponent } from './bulk-booking-new/bulk-booking-new.component';
import { BulkDialogBoxComponent } from './bulk-dialog-box/bulk-dialog-box.component';
import { BulkBookingEditComponent } from './bulk-booking-edit/bulk-booking-edit.component';
import { BookingEditComponent } from './booking-edit/booking-edit.component';
import { PendingPaymentComponent } from './pending-payment/pending-payment.component';



const COMPONENTS = [DashboardComponent,EstimatesComponent,EstimatesNewComponent,EstimatesEditComponent, BulkDialogBoxComponent,BulkBookingEditComponent,BookingEditComponent,
  LoginComponent, RegisterComponent, InvoicesComponent,InvoicesEditComponent,InvoicesNewComponent,UsersComponent , BulkBookingComponent,BulkBookingNewComponent,
  ReportmodelComponent,CustomersComponent,SettingsComponent,DialogBoxComponent,NewDialogBoxComponent,UserDialogBoxComponent,PayDialogBoxComponent,InputDialogComponent,
  PendingPaymentComponent ];
const COMPONENTS_DYNAMIC = [];

@NgModule({
  imports: [SharedModule, RoutesRoutingModule,],
  declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC],
  entryComponents: COMPONENTS_DYNAMIC,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class RoutesModule {}
