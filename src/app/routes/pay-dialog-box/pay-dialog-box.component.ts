//dialog-box.component.ts
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface ProductData {
  id: number;
  s_no:number;
  p_name: string;
  sub_name:any;
  rate: number;
  gst:string;
  qty:number;
  total:number;
}

@Component({
  selector: 'app-pay-dialog-box',
  templateUrl: './pay-dialog-box.component.html',
  styleUrls: ['./pay-dialog-box.component.scss']
})
export class PayDialogBoxComponent implements OnInit {

  action:string;
  local_data:any;

  paymodes = ['Cash', 'Card', 'UPI'];

  cus_name = ""
  invoice_no = ""
  billAmount = 0
  paidAmount = 0
  givenAmount = 0
  balanceAmount = 0

  new_given = 0;

  payment_data: any = [];
  sub_products_data: any = [];

  addOnBlur: boolean = false;
  separatorKeysCodes = [ENTER, COMMA];
  
  productControl: FormControl = new FormControl();

  product_options: string[] = [];

  removable: boolean = true;

  filteredValues: Observable<any[]>;
  filteredOptions: Observable<any[]>;
  subProductCtrl = new FormControl();
  field_values: any[] = [];
  product_name: any;
  parameters: any;
  product_id: any;
  isproductAdd: boolean;
  form_status: boolean;
  sub_pros: any;

  gst_list = [
    {value:"0",view_value:"0 %"},
    {value:"5",view_value:"5 %"},
    {value:"12",view_value:"12 %"},
    {value:"18",view_value:"18 %"}
  ]


  constructor(
    public dialogRef: MatDialogRef<PayDialogBoxComponent>,
    public httpClient: HttpClient,
    private apiservice: ApiService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ProductData) {
    // console.log(data);
    this.local_data = {...data};
    this.action = this.local_data.action;
  }

  myForm = new FormGroup({
    bill_amount: new FormControl('', [Validators.required]),
    paid_amount: new FormControl('', [Validators.required]),
    given_amount: new FormControl('', [Validators.required]),
    pay_mode: new FormControl('', [Validators.required]),
    reference: new FormControl('', [Validators.required]),
    balance_amount: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
     if(this.action == "Add")
     {
      this.myForm.get('bill_amount').disable();
      this.myForm.get('paid_amount').disable();
      this.myForm.get('balance_amount').disable();
      this.loadPaymentData(this.apiservice.shop_id,this.local_data.order_id)
     }
   
  }

  loadPaymentData(shop_id,order_id) {
    this.form_status = true
    var serverPaymentURL = this.apiservice.serverPaymentURL+"?sid="+shop_id+"&order_id="+order_id
    this.httpClient.get(serverPaymentURL).subscribe(data => {
      // console.log(data)
      if(data['payment'] != null)
      {
        this.payment_data = data['payment'];
        if(this.payment_data != null)
        {
          this.cus_name = this.payment_data.cus_name
          this.invoice_no = this.payment_data.invoice_no

          this.myForm.get('bill_amount').setValue(this.payment_data.total_amount);
          this.billAmount = Number(this.payment_data.total_amount)

          this.myForm.get('paid_amount').setValue(this.payment_data.given_amount);
          this.paidAmount = Number(this.payment_data.given_amount)

          this.myForm.get('balance_amount').setValue(this.payment_data.pending_amount);
          this.balanceAmount = Number(this.payment_data.pending_amount)

        }
      }
      else{
        this.toastr.error("No Data Found");
      }
      this.form_status = false
      },
      error => {
        this.toastr.error("Check Intenet");
      });
  }

  onGivenChange(given)
  {
    let balance = 0
    balance = Number(this.billAmount) - (Number(this.paidAmount) + Number(given))
    if(balance >= 0)
    {
      this.new_given = given
      this.myForm.get('balance_amount').setValue(balance);
    }
    else{
      this.toastr.error("High Given Amount")
      this.myForm.get('given_amount').setValue(this.new_given);
    }
  }

  doAction(){
    // console.log(this.myForm.get('balance_amount').value)
    if(this.action == "Add")
    {
        if(this.myForm.get('given_amount').value == '' || Number(this.myForm.get('given_amount').value) < 1)
        {
          this.toastr.error("Enter Given Amount")
        }
        else{
          if(this.myForm.get('pay_mode').value == '')
          {
            this.toastr.error("Choose Payment Mode")
          }
          else{
            this.parameters = {
              order_id:this.local_data.order_id,
              shop_id:this.apiservice.shop_id,
              invoice_no:this.invoice_no,
              user_id:this.apiservice.userid,
              total_amount:this.myForm.get('bill_amount').value,
              pending_amount:this.balanceAmount,
              paid_amount:this.myForm.get('paid_amount').value,
              given_amount:this.myForm.get('given_amount').value,
              pay_mode:this.myForm.get('pay_mode').value,
              reference:this.myForm.get('reference').value,
              balance_amount:this.myForm.get('balance_amount').value,
          }
          this.dialogRef.close({event:this.action,data:this.parameters});
          }
         }
    }
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

}
