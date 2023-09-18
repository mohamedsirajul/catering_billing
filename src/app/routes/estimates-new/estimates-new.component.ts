import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Component, ElementRef, Inject, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { first, map, startWith } from 'rxjs/operators';
import { ApiService } from 'app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

export interface ProductData {
  id: string;
  s_no:string;
  p_name: string;
  sub_name:any;
  rate: string;
  amount: string;
  gst: string;
  gst_value: string;
  qty:string;
  total:string;
}

@Component({
  selector: 'app-estimates-new',
  templateUrl: './estimates-new.component.html',
  styleUrls: ['./estimates-new.component.scss'],
  providers: [DatePipe],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class EstimatesNewComponent implements OnInit {
  start_date: string;
  delivery_date: string;
  estimate_date: string;
  today_date: any;
  id: any;
  state: any;
  bulk_no = ''
  
  @ViewChild(MatSort, { static: false }) set sort(sort: MatSort) {
    if (this.dataSource) {
      this.dataSource.sortingDataAccessor = (item, property) =>
        item[property];
      this.dataSource.sort = sort;
    }
  }

  @ViewChild(MatPaginator, { static: false }) set paginator(
    paginator: MatPaginator
  ) {
    if (this.dataSource) {
      this.dataSource.paginator = paginator;
    }
  }

  PRODUCT_DATA: ProductData[] = []

  displayedColumns: string[] = ['position','s_no', 'p_name', 'rate','qty','gst','total', 'action'];
  dataSource = new MatTableDataSource();
  form_status = false
  isTableExpanded = true;
  @ViewChild(MatTable,{static:true}) table: MatTable<any>;


  // @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;
  // @ViewChild(MatTable) table: MatTable<any>;

  chips = ['a','b']

  formGroup: FormGroup;
  toppingsControl = new FormControl([]);
  filterForm = new FormGroup({});

  order_idd: string;
  parameters: {};
  actualdata = {};
  data: any = {};
  notification_id: any;
  selectedColumns = [];
  filterValues = {};
  branches = []
  halls = []
  deliveryType = ['DD', 'PP'];
  imageSrc: string;

  edit_status = false;
  report_status = true;
  submit_status = true;
  update_status = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    public httpClient: HttpClient,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    private apiservice: ApiService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {

  }
  // delivery_charges = new FormControl();
  delivery_charges= new FormControl('', [Validators.required]);
  labour_charges= new FormControl('', [Validators.required]);
  additional_services= new FormControl();
  advance_amount = new FormControl();
  balance_amount = new FormControl();

  customerForm = new FormGroup({
    customer_name: new FormControl('', [Validators.required]),
    customer_mobile: new FormControl('', [Validators.required]),
    alter_mobile: new FormControl('', [Validators.required]),
    customer_address: new FormControl('', [Validators.required]),
  });

  invoiceForm = new FormGroup({
    pf_number: new FormControl('', [Validators.required]),
    sales_person: new FormControl('', [Validators.required]),
    delivery_type: new FormControl('', [Validators.required]),
    reference: new FormControl('', [Validators.required]),
    shipping_address: new FormControl('', [Validators.required]),
    branch: new FormControl('', [Validators.required]),
    hall: new FormControl('', [Validators.required]),
  });

  estimatedate = new FormControl();
  deliverydate = new FormControl();

  gst5 = false 
  gst0 = false
  gst18 = false
  gst12 = false

  edit_data = [];
  cus_data: any = [];
  customerNos : Observable<any[]>;
  customer_mobile: FormControl = new FormControl();
  cus_options: string[] = [];
  all_gst: any;
  sub_total = 0
  cgst6 = 0
  sgst6 = 0
  cgst9 = 0
  sgst9 = 0
  cgst2_5 = 0
  sgst2_5 = 0
  cgst0 = 0
  sgst0 = 0
  total_gst = 0
  total = 0
  total_items = 0
  total_qty = 0
  deli_charges = 0
  lab_charges = 0
  advance = 0
  round_off = 0
  bill_total = 0

  ngOnInit() {
    this.autocomplete()
    this.order_idd = this.activatedRoute.snapshot.paramMap.get('params')
    if(this.order_idd != null)
    {
      this.getEstimateDetails(this.order_idd)
      // console.log(this.order_idd)
    }
    else{
      this.getPFnumber()
      // console.log("no order id")
    }
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.balance_amount.disable();
  }

  reCallafterpushData()
  {
    this.autocomplete()
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.balance_amount.disable();
  }

  getEstimateDetails(orderid) {
    this.form_status = true
    this.apiservice.openSpinner()
    var getEstimateDetailsURL = this.apiservice.getEstimateDetailsURL+"?order_id="+orderid+"&shop_id="+this.apiservice.shop_id
    this.httpClient.get(getEstimateDetailsURL).subscribe(data => {
      if(data['details'] != null)
      {
        this.form_status = false
        // console.log(data)
        this.actualdata = data['details'];
        this.data = this.actualdata;

        this.invoiceForm.get("pf_number").setValue(data['message'])
        this.invoiceForm.get("pf_number").disable();

        this.today_date = new Date();
        this.today_date = this.datePipe.transform(this.today_date, 'dd/MM/yyyy');
        this.estimatedate.setValue(new Date(this.apiservice.changedate(this.today_date)))
        this.estimate_date = this.today_date

        if(data['branches'] != null)
        {
          for (let i = 0; i < data['branches'].length; i++) {
            this.branches.push(data['branches'][i]['name']);
          }
        }
        if(data['halls'] != null)
        {
          for (let i = 0; i < data['halls'].length; i++) {
            this.halls.push(data['halls'][i]['name']);
          }
        }

        this.cus_data = data['customers'];
        if(this.cus_data != null)
        {
          for (let i = 0; i < this.cus_data.length; i++) {
            this.cus_options.push(this.cus_data[i]['cus_mobile']);
          }
        }
        this.cus_options = Array.from(new Set(this.cus_options));
        this.AssigntoAll(this.data)
        // this.form_status = false;
        // this.dataSource.data = this.data;
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
    }
    else{
      this.form_status = false;
      this.toastr.error("No Data Found");
      this.router.navigateByUrl('/estimates');
    }
    this.apiservice.closeSpinner()
    });
  }

  AssigntoAll(data)
  {
    // console.log(data)
    let given = 0
    var pid,pname,pqty,prate,pamount,pgst,pgstvalue,ptotal,psub,ptime,ptime_ar,pid_ar,pname_ar,pqty_ar,prate_ar,ptotal_ar,psub_ar,pamount_ar,pgst_ar,pgstvalue_ar;
    this.sub_total = data['sub_total']
    this.total_gst = data['total_gst']
    this.all_gst = JSON.parse(data['gst']);
    this.round_off = data['round_off']
    this.bill_total = data['rounded_total']
    this.total = data['total']
    // this.deli_charges = data['delivery_charges']
    // this.delivery_charges.setValue(data['delivery_charges'])
    // this.lab_charges = data['labour_charges']
    // this.labour_charges.setValue(data['labour_charges'])
    // given = data['given']
    // console.log(given)
    // this.advance = Number(data['advance']) + Number(given)
    // this.advance_amount.setValue(this.advance)
    // this.advance_amount.disable();
    this.balance_amount.setValue(data['rounded_total'])

    // console.log(new Date(this.apiservice.changedate(data['estimate_date'])))

    // this.estimatedate.setValue(new Date(this.apiservice.changedate(data['estimate_date'])))
    this.deliverydate.setValue(new Date(this.apiservice.changedate(data['delivery_date'])))
    // this.deliverydate.setValue(this.apiservice.changedate(data['delivery_date']))


    this.additional_services.setValue(data['additional_services'])

    this.delivery_date = data['delivery_date']

    this.customer_mobile.setValue(data['cus_mobile'])
    this.customerForm.get('customer_name').setValue(data['cus_name']);
    this.customerForm.get('customer_mobile').setValue(data['cus_mobile']);
    this.customerForm.get('alter_mobile').setValue(data['alter_mobile']);
    this.customerForm.get('customer_address').setValue(data['cus_address']);

    this.invoiceForm.get('reference').setValue(data['reference']);

    this.invoiceForm.get('branch').setValue(data['branch']);
    this.invoiceForm.get('hall').setValue(data['hall']);
    this.invoiceForm.get('delivery_type').setValue(data['delivery_type']);
    this.invoiceForm.get('sales_person').setValue(data['sales_person']);
    this.invoiceForm.get('shipping_address').setValue(data['shipping_address']);

    this.cgst0 = this.sgst0 = this.all_gst['cgst0']
    this.cgst2_5 = this.sgst2_5 = this.all_gst['cgst2_5']
    this.cgst9 = this.sgst9 = this.all_gst['cgst9']
    this.cgst6 = this.sgst6 = this.all_gst['cgst6']

    if(this.cgst2_5 != 0)
    {
      this.gst5 = true;
    }
    if(this.cgst9 != 0)
    {
      this.gst18 = true;
    }
    if(this.cgst6 != 0)
    {
      this.gst12 = true;
    }

    // console.log(this.all_gst['cgst6'])

    pid = data['product_id'];
    pname = data['product_name'];
    pqty = data['product_qty'];
    prate = data['product_rate'];
    pamount = data['product_amount'];
    pgst = data['product_gst'];
    pgstvalue = data['product_gst_value'];
    ptotal = data['product_total'];
    psub = data['product_sub_products'];
    ptime = data['product_time'];

    pid_ar = pid.split('#?');
    pname_ar = pname.split('#?');
    pqty_ar = pqty.split('#?');
    prate_ar = prate.split('#?');
    pamount_ar = pamount.split('#?');
    pgst_ar = pgst.split('#?');
    pgstvalue_ar = pgstvalue.split('#?');
    ptotal_ar = ptotal.split('#?');
    psub_ar = psub.split('#?');
    ptime_ar = ptime.split('#?');

    for(let i = 0;i< pid_ar.length;i++)
    {
      var psubb = psub_ar[i].split('$;');
      var params = {
        id:pid_ar[i],
        p_name:pname_ar[i],
        qty:pqty_ar[i],
        rate:prate_ar[i],
        amount:pamount_ar[i],
        gst:pgst_ar[i],
        gst_value:pgstvalue_ar[i],
        s_no:i+1,
        total:ptotal_ar[i],
        sub_name:psubb,
        time:ptime_ar[i],
      }
      this.edit_data.push(params)
    }
    this.dataSource.data = this.edit_data
    let qty = 0,sub_total = 0
    for(let i =0;i<this.dataSource.data.length;i++)
    {
      this.total_items = this.dataSource.data.length
      qty = qty + Number(this.dataSource.data[i]['qty'])
      sub_total = sub_total + Number(this.dataSource.data[i]['amount'])
    }
    this.total_qty = qty
    this.sub_total = sub_total
    // console.log(this.edit_data)
  }

  autocomplete() {
    this.customerNos = this.customer_mobile.valueChanges.pipe(
      startWith(''),
      map(val => this.filter1(val))
    );
  }

  private filter1(val: any): any[] {
    return this.cus_options.filter(option => option.toLowerCase().includes(val.toLowerCase()));
  }

  
  onSelectionChanged(value) {
    // console.log(value)
    for (let i = 0; i < this.cus_data.length; i++) {
      if(this.cus_data[i]['cus_mobile'] == value)
      {
        this.customerForm.get('customer_mobile').setValue(value);
        this.customerForm.get('customer_name').setValue(this.cus_data[i]['cus_name']);
        this.customerForm.get('customer_address').setValue(this.cus_data[i]['cus_address']);
        this.customerForm.get('alter_mobile').setValue(this.cus_data[i]['alter_mobile']);
        // console.log(this.cus_data[i]['cus_name'])
      }
    }
  }

  onTextChange(value) {
    // if(value.length == 10)
    // {
      this.customerForm.get('customer_mobile').setValue(value);
    // }
    // console.log(value)
  }


  getPFnumber() {
    this.form_status = true
    this.apiservice.openSpinner()
    var getEstimateDetailsURL = this.apiservice.getEstimateNumberURL+"?sid="+this.apiservice.shop_id
    this.httpClient.get(getEstimateDetailsURL).subscribe(data => {
      this.form_status = false
      // console.log(data)
      if(data['status'])
      {
          this.invoiceForm.get("pf_number").setValue(data['message'])
          this.invoiceForm.get("pf_number").disable();

          this.today_date = new Date();
          this.today_date = this.datePipe.transform(this.today_date, 'dd/MM/yyyy');
          this.estimatedate.setValue(new Date(this.apiservice.changedate(this.today_date)))
          this.estimate_date = this.today_date
          // console.log(this.today_date)
          // console.log(this.estimate_date)
          if(data['branches'] != null)
          {
            for (let i = 0; i < data['branches'].length; i++) {
              this.branches.push(data['branches'][i]['name']);
            }
          }

          if(data['halls'] != null)
          {
            for (let i = 0; i < data['halls'].length; i++) {
              this.halls.push(data['halls'][i]['name']);
            }
          }
          // console.log(this.branches)
          this.cus_data = data['customers'];
          if(this.cus_data != null)
          {
            for (let i = 0; i < this.cus_data.length; i++) {
              this.cus_options.push(this.cus_data[i]['cus_mobile']);
            }
          }
          this.cus_options = Array.from(new Set(this.cus_options));
      }
      else{
        this.toastr.error("No Data Found");
        this.router.navigateByUrl('/estimates');
    }
    this.apiservice.closeSpinner()
    });
  }

  onAdvanceChange(event)
  {
    let bal = 0,round_off = 0
    if(this.total > 0)
    {
      if(Number(event) > this.total)
      {
        this.toastr.error("Advance Amount is High")
        this.advance_amount.setValue(this.advance)
      }
      else{
        this.advance = Number(event)
        let val = String(Number(this.deli_charges) +  Number(this.sub_total) + Number(this.lab_charges) + Number(this.total_gst))
        let val1 = parseFloat(val).toFixed(2)
        this.total = Number(val1)
        round_off = this.total - Math.floor(this.total)
        round_off = Number(parseFloat(String(round_off)).toFixed(2))
        if(round_off >= 0.5)
        {
          round_off = (1.00 - round_off)
          round_off = Number(parseFloat(String(round_off)).toFixed(2))
          this.bill_total = this.total + round_off
        }
        else{
          this.bill_total = this.total - round_off
        }
        this.round_off = round_off
        bal = this.bill_total - Number(event)
        this.balance_amount.setValue(parseFloat(String(bal)).toFixed(2))
      }
    }
    else{
      this.toastr.error("Sub Total is 0")
      this.advance_amount.setValue("")
    }
    // console.log(this.advance)
  }

  onLabourChange(event)
  {
    let bal = 0,round_off = 0
    if(this.sub_total > 0)
    {
      let total = 0;
      if(event != '')
      this.lab_charges = event
      else this.lab_charges = 0
      let val = String(Number(this.lab_charges) +  Number(this.sub_total) +  Number(this.deli_charges) + Number(this.total_gst))
      let val1 = parseFloat(val).toFixed(2)
      this.total = Number(val1)
      round_off = this.total - Math.floor(this.total)
      round_off = Number(parseFloat(String(round_off)).toFixed(2))
      if(round_off >= 0.5)
      {
        round_off = (1.00 - round_off)
        round_off = Number(parseFloat(String(round_off)).toFixed(2))
        this.bill_total = this.total + round_off
      }
      else{
        this.bill_total = this.total - round_off
      }
      this.round_off = round_off
      bal = this.bill_total - Number(this.advance_amount.value)
      this.balance_amount.setValue(parseFloat(String(bal)).toFixed(2))
    }
    else{
      this.toastr.error("Sub Total is 0")
      this.labour_charges.setValue("")
    }
  }

  onDeliveryChange(event)
  {
    let bal = 0,round_off = 0
    if(this.sub_total > 0)
    {
      let total = 0;
      if(event != '')
      this.deli_charges = event
      else this.deli_charges = 0
      let val = String(Number(this.deli_charges) +  Number(this.sub_total) +  Number(this.lab_charges) + Number(this.total_gst))
      let val1 = parseFloat(val).toFixed(2)
      this.total = Number(val1)
      round_off = this.total - Math.floor(this.total)
      round_off = Number(parseFloat(String(round_off)).toFixed(2))
      if(round_off >= 0.5)
      {
        round_off = (1.00 - round_off)
        round_off = Number(parseFloat(String(round_off)).toFixed(2))
        this.bill_total = this.total + round_off
      }
      else{
        this.bill_total = this.total - round_off
      }
      this.round_off = round_off
      bal = this.bill_total - Number(this.advance_amount.value)
      this.balance_amount.setValue(parseFloat(String(bal)).toFixed(2))
    }
    else{
      this.toastr.error("Sub Total is 0")
      this.delivery_charges.setValue("")
    }
  }

  openDialog(action,obj) {
    // console.log(this.delivery_charges.value)
    obj.action = action;
    obj.bulk_no = this.bulk_no
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      disableClose:true,
      width: 'auto',
      height: 'auto',
      data:obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.event == 'Add'){
        this.addRowData(result.data);
      }else if(result.event == 'Update'){
        this.updateRowData(result.data);
      }else if(result.event == 'Delete'){
        this.deleteRowData(result.data);
      }
    });
  }

  addLocalProducts(row_obj)
  {
    var gstval = 0, total = 0,subtotal = 0
    subtotal = row_obj.details.product_price * row_obj.details.product_quantity
    subtotal = Number(parseFloat(String(subtotal)).toFixed(2))
    gstval = subtotal * row_obj.details.product_gst/100
    gstval = Number(parseFloat(String(gstval)).toFixed(2))
    total = subtotal  + gstval
    total = Number(parseFloat(String(total)).toFixed(2))

    this.dataSource.data.push({
      id:row_obj.id,
      s_no:String(this.dataSource.data.length+1),
      p_name:row_obj.product,
      sub_name:row_obj.sub_products,
      rate:row_obj.details.product_price,
      qty:row_obj.details.product_quantity,
      amount:String(subtotal),
      gst:row_obj.details.product_gst,
      gst_value:String(gstval),
      total:String(total),
      time:row_obj.details.product_time,
    })

    this.reCallafterpushData()
    this.calculateInvoiceItems()
  }

  addRowData(row_obj){
    // console.log(this.dataSource.data)
    if(this.dataSource.data.length > 0)
    {
      const index = this.dataSource.data.findIndex((value,key) => value['id'] === row_obj.id);
      if (index === -1) {
        this.addLocalProducts(row_obj)
            return true;
      } else {
        this.toastr.error("Duplicate Product")
      }
    }
    else{
      this.addLocalProducts(row_obj)
    }
    
  }

  updateRowData(row_obj){
    // console.log(row_obj.id)
    var gstval = 0, total = 0,subtotal = 0
    subtotal = row_obj.details['product_price'] * row_obj.details['product_quantity']
    subtotal = Number(parseFloat(String(subtotal)).toFixed(2))
    gstval = subtotal * row_obj.details['product_gst']/100
    gstval = Number(parseFloat(String(gstval)).toFixed(2))
    total = subtotal  + gstval
    total = Number(parseFloat(String(total)).toFixed(2))

    this.dataSource.data = this.dataSource.data.filter((value,key)=>{
      if(value['id'] == row_obj.old_id){
        value['id'] = row_obj.id
        value['p_name'] = row_obj.product
        value['sub_name'] = row_obj.sub_products
        value['rate'] = row_obj.details['product_price']
        value['qty'] = row_obj.details['product_quantity']
        value['amount'] = String(subtotal)
        value['gst'] = row_obj.details['product_gst']
        value['gst_value'] =String(gstval),
        value['total'] = String(total),
        value['time'] = row_obj.details['product_time']
      }
      this.calculateInvoiceItems()
      return true;
    });
  }

  deleteRowData(row_obj){
    // console.log(row_obj)
    this.dataSource.data = this.dataSource.data.filter((value,key)=>{
      return value['id'] != row_obj.id;
    });
    this.calculateInvoiceItems()
  }

  calculateInvoiceItems()
  {
    // console.log(this.dataSource.data)
    let qty = 0,sub_total = 0,round_off = 0
    this.cgst0 = 0
    this.sgst0 = 0
    this.cgst2_5 = 0
    this.sgst2_5 = 0
    this.cgst9 = 0
    this.sgst9 = 0
    this.cgst6 = 0
    this.sgst6 = 0
    for(let i =0;i<this.dataSource.data.length;i++)
    {
      this.total_items = this.dataSource.data.length
      qty = qty + Number(this.dataSource.data[i]['qty'])
      sub_total = sub_total + Number(this.dataSource.data[i]['amount'])
      if(this.dataSource.data[i]['gst'] == 0)
      {
        this.cgst0 = 0
        this.sgst0 = 0
        this.gst0 = true;
      }
      else if(this.dataSource.data[i]['gst'] == 5)
      {
        this.cgst2_5 = this.cgst2_5 + Number(this.dataSource.data[i]['gst_value']) / 2
        this.sgst2_5 = this.sgst2_5 + Number(this.dataSource.data[i]['gst_value']) / 2
        this.gst5 = true;
      }
      else if(this.dataSource.data[i]['gst'] == 18)
      {
        this.cgst9 = this.cgst9 + Number(this.dataSource.data[i]['gst_value']) / 2
        this.sgst9 = this.sgst9 + Number(this.dataSource.data[i]['gst_value']) / 2
        this.gst18 = true;
      }
      else if(this.dataSource.data[i]['gst'] == 12)
      {
        this.cgst6 = this.cgst6 + Number(this.dataSource.data[i]['gst_value']) / 2
        this.sgst6 = this.sgst6 + Number(this.dataSource.data[i]['gst_value']) / 2
        this.gst12 = true;
      }

      if(this.cgst2_5 == 0)
      {
        this.gst5 = false;
      }
      if(this.cgst9 == 0)
      {
        this.gst18 = false;
      }
      if(this.cgst6 == 0)
      {
        this.gst12 = false;
      }
    }

    this.cgst2_5 = Number(parseFloat(String(this.cgst2_5)).toFixed(2))
    this.sgst2_5 = Number(parseFloat(String(this.sgst2_5)).toFixed(2))
    this.cgst6 = Number(parseFloat(String(this.cgst6)).toFixed(2))
    this.sgst6 = Number(parseFloat(String(this.sgst6)).toFixed(2))
    this.cgst9 = Number(parseFloat(String(this.cgst9)).toFixed(2))
    this.sgst9 = Number(parseFloat(String(this.sgst9)).toFixed(2))

    this.total_gst = this.cgst2_5 + this.sgst2_5 + this.cgst9 + this.sgst9 + this.cgst6 + this.sgst6
    this.total_gst = Number(parseFloat(String(this.total_gst)).toFixed(2))
    this.total_qty = qty
    this.sub_total = sub_total


    let val = String(Number(this.deli_charges) +  Number(this.sub_total) +  Number(this.total_gst) +  Number(this.lab_charges))
    let val1 = parseFloat(val).toFixed(2)
    this.total = Number(val1)

    round_off = this.total - Math.floor(this.total)
    round_off = Number(parseFloat(String(round_off)).toFixed(2))
    if(round_off >= 0.5)
    {
      round_off = (1.00 - round_off)
      round_off = Number(parseFloat(String(round_off)).toFixed(2))
      this.bill_total = this.total + round_off
    }
    else{
      this.bill_total = this.total - round_off
    }
    this.round_off = round_off
    var bal = this.bill_total - Number(this.advance_amount.value)
    this.balance_amount.setValue(parseFloat(String(bal)).toFixed(2))
    // this.advance = 0
    // this.advance_amount.setValue('')
    // this.balance_amount.setValue(parseFloat(String(this.total)).toFixed(2))
  }

  EstimateDateEvent(dateval)
  {
    this.estimate_date = this.datePipe.transform(dateval.value, 'dd/MM/yyyy');
  }

  DeliveryDateEvent(dateval)
  {
    this.delivery_date = this.datePipe.transform(dateval.value, 'dd/MM/yyyy');
  }


  onChange(event)
  {
    // console.log(this.customerForm.value)
    if(event.checked)
    {
      this.invoiceForm.get('shipping_address').setValue(this.customerForm.value.customer_address);
    }
    else
    {
      this.invoiceForm.get('shipping_address').setValue("");
    }
  }

  save_estimate()
  {
    if(this.customerForm.get('customer_mobile').value == "")
    {
      this.toastr.error("Enter Customer Mobile");
      return
    }
    if(this.customerForm.get('customer_mobile').value.length <= 9)
    {
      this.toastr.error("Invaild Mobile");
      return
    }
    if(this.customerForm.get('customer_name').value == "")
    {
      this.toastr.error("Enter Customer Name");
      return
    }
    if(this.customerForm.get('customer_mobile').value.length != 10)
    {
      this.toastr.error("Invaild Mobile");
      return
    }
    if(this.customerForm.get('customer_address').value == "")
    {
      this.toastr.error("Enter Customer Address");
      return
    }
    if(this.estimate_date == null)
    {
      this.toastr.error("Choose Estimate Date");
      return
    }
    if(this.invoiceForm.get('delivery_type').value == "")
    {
      this.toastr.error("Choose Delivery Type");
      return
    }
    if(this.delivery_date == null)
    {
      this.toastr.error("Choose Delivery Date");
      return
    }
    if(this.dataSource.data.length == 0)
    {
      this.toastr.error("Add Products to Estimate");
      return
    }
    
    for(let i=0;i<this.dataSource.data.length;i++)
    {
      var val = this.dataSource.data[i]['sub_name']
      // console.log(val.toString())
      val = val.join("$;")
      this.dataSource.data[i]['sub_names'] = val
    }
    let parameters,others,gst_de;
    gst_de = {
      cgst0: this.cgst0,
      sgst0: this.sgst0, 
      cgst2_5: this.cgst2_5,
      sgst2_5: this.sgst2_5,
      cgst9: this.cgst9,
      sgst9: this.sgst9,
      cgst6: this.cgst6,
      sgst6: this.sgst6 
    }
    others = {
        estimate_date:this.estimate_date,
        delivery_date:this.delivery_date,
        sub_total:this.sub_total,
        gst:gst_de,
        deliverycharges:this.deli_charges,
        labourcharges:this.lab_charges,
        total_gst:this.total_gst,
        total:this.total,
        round_off:this.round_off,
        rounded_total:this.bill_total,
        advance:this.advance,
        balance:this.balance_amount.value,
        additional_services:this.additional_services.value,
        pf_number:this.invoiceForm.get("pf_number").value

    }
    parameters = { 
      customer_details:this.customerForm.value,
      invoice_details:this.invoiceForm.value,
      product_details:this.dataSource.data,
      other_details:others,
      mode:"add",
      shop_id:this.apiservice.shop_id,
      user_id:this.apiservice.userid
    }
    // console.log(parameters)
    this.apiservice.openSpinner()
    this.form_status = true
      this.httpClient.post(this.apiservice.serverEstimateURL, parameters)
        .subscribe(res => {
          // console.log(res);
          this.form_status = false
            if(res['status'])
            {
              this.toastr.success(res['message']);
              this.router.navigateByUrl('/estimates');
            }
            else{
              this.toastr.error(res['message']);
            }
            this.apiservice.closeSpinner()
        })
  }

  newnotiEntry() {
    this.router.navigateByUrl('/estimates');
  }

  dropTable(event: CdkDragDrop<[]>) {
    const prevIndex = this.dataSource.data.findIndex((d) => d === event.item.data);
    moveItemInArray(this.dataSource.data, prevIndex, event.currentIndex);
    this.table.renderRows();
    // console.log(this.dataSource.data)
  }

}
