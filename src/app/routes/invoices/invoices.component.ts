import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Component, ElementRef, Inject, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { first } from 'rxjs/operators';
import { ApiService } from 'app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { DialogBoxComponent } from '../menu/dialog-box/dialog-box.component';
import { GenInvoice } from 'app/service/invoice_gen';
import { DatePipe } from '@angular/common';
import { PayDialogBoxComponent } from '../pay-dialog-box/pay-dialog-box.component';
@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
  providers: [DatePipe],
})
export class InvoicesComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  formGroup: FormGroup;
  toppingsControl = new FormControl([]);
  filterForm = new FormGroup({});
  dataSource = new MatTableDataSource([]);

  displayedColumns: string[] = ['s_no','invoice_no','cus_name','total','paid_status','created_by','delivery_date','action'];
  parameters: {};
  actualdata = {};
  data: any = {};
  notification_id: any;
  selectedColumns = [];
  filterValues = {};

  imageSrc: string;

  edit_status = false;
  report_status = true;
  submit_status = true;
  update_status = false;
  form_status = false;
  paid_status = false

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    public httpClient: HttpClient,
    public dialog: MatDialog,
    private apiservice: ApiService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private geninvoice: GenInvoice,
    public datepipe: DatePipe
  ) {
    this.formGroup = this.formBuilder.group({
      title: ['', Validators.required],
      message: ['', Validators.required],
      file: ['',Validators.required],
      fileSource: ['',Validators.required],
      image: ['', Validators.required]
    });
  }

  myForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required]),
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
  });

  get c() {
    return this.myForm.controls;
  }

  ngOnInit() {
    // let output_values = []
    // for (let i = 0; i <= 500; i++) {
    //   const individual_numbers = i.toString().split("");
    //   const sum_of_individual_numbers = individual_numbers.reduce((old_val, new_val) => old_val + parseInt(new_val), 0);
    //   const duplicate_numbers = individual_numbers.some(
    //     (value, index) => individual_numbers.indexOf(value) !== index
    //   );
    //   if (duplicate_numbers && sum_of_individual_numbers <= 5) {
    //     output_values.push(i)
    //   }
    // }
    // console.log(output_values)

    // // output is => [11, 22, 100, 101, 110, 111, 112, 113, 121, 122, 131, 200, 202, 211, 212, 220, 221, 300, 311, 400, 500]
    
    this.loadInvoicesData(this.apiservice.shop_id);
  }

  loadInvoicesData(shop_id) {
    this.apiservice.openSpinner()
    this.form_status = true;
    var invoicesURL = this.apiservice.invoicesURL+"?sid="+shop_id
    this.httpClient.get(invoicesURL).subscribe(data => {
      if(data != null)
      {
        // console.log(data)
        this.actualdata = data['invoices'];
        this.data = this.actualdata;
        this.form_status = false;
        this.dataSource.data = this.data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        if(this.data.length == 0)
        {
          this.toastr.error("No Data Found");
        }
        else{
          for (let i = 0; i < this.data.length; i++) {
            if(this.data[i]['is_paid'] == 0)
            {
              this.data[i]['paid_status'] =  "Unpaid";
              this.data[i]['paidstatus'] = true
              this.data[i]['color'] =  "chip1";
            }
            else if(this.data[i]['is_paid'] == 1)
            {
              this.data[i]['paid_status'] =  "Partial Paid";
              this.data[i]['paidstatus'] = true
              this.data[i]['color'] =  "chip1";
            }
            else if(this.data[i]['is_paid'] == 2)
            {
              this.data[i]['paid_status'] =  "Paid";
              this.data[i]['paidstatus'] = false
              this.data[i]['color'] =  "chip1";
            }
          }
        }
     }
    else{
      this.form_status = false;
      this.toastr.error("No Data Found");
    }
    this.apiservice.closeSpinner()
    });
  }
  
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    this.dataSource.filter = filterValue;
    // console.log(filterValue)
  }

  newnotiEntry() {
    this.router.navigateByUrl('/invoices-new');
  }

  viewInvoice(event,title)
  {
    this.form_status = true
    var getInvoiceDetailsURL = this.apiservice.getInvoiceDetailsURL+"?order_id="+event.order_id+"&shop_id="+this.apiservice.shop_id
    this.httpClient.get(getInvoiceDetailsURL).subscribe(data => {
      // console.log(data)
      if(data['details'] != null)
      {
        this.form_status = false
        // console.log(data)
        this.actualdata = data['details'];
        this.data = this.actualdata;
        if(data['shop_details'] != null)
        this.geninvoice.genInvoicePDF(this.data,data['shop_details'],title)
    }
    else{
      this.form_status = false;
      this.toastr.error("No Data Found");
      this.router.navigateByUrl('/invoices');
    }
    });
  }

  paidInvoice(action,obj)
  {
    obj.action = action;
    const dialogRef = this.dialog.open(PayDialogBoxComponent, {
      disableClose:true,
      width: '670px',
      height: 'auto',
      data:obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.event == 'Add'){
        // console.log(result)
        this.addRowData(result.data);
      }
    });
    // this.markasPaidInvoice(event.order_id,status)
  }

  addRowData(parameters){
    // console.log(parameters)
    this.form_status = true
    this.apiservice.openSpinner()
      this.httpClient.post(this.apiservice.serverPaymentAddURL, parameters)
        .subscribe(res => {
          this.apiservice.closeSpinner()
          // console.log(res);
          this.form_status = false
            if(res['status'])
            {
              this.toastr.success(res['message']);
              this.ngOnInit()
            }
            else{
              this.toastr.error(res['message']);
            }
        })
  }

  markasPaidInvoice(orderid,status) {
    this.form_status = true
    let currentDate =this.datepipe.transform((new Date), 'dd/MM/yyyy');
    let currentTime =this.datepipe.transform((new Date), 'h:mm:ss');
    // console.log(currentTime)
    var markasPaidURL = this.apiservice.markasPaidURL+"?order_id="+orderid+"&status="+status+"&cdate="+currentDate+"&ctime="+currentTime
    this.httpClient.get(markasPaidURL).subscribe(data => {
      if(data != null)
      {
        this.form_status = false
        if(data['status'])
        {
          this.toastr.success(data['message']);
          this.ngOnInit()
        }
        else{
          this.toastr.error(data['message']);
        }
    }
    else{
      this.form_status = false;
      this.toastr.error("No Data Found");
    }

    });
  }

  editInvoice(event)
  {
    // this.geninvoice.generatePDF()
    this.router.navigate(['//invoices-edit', { params : event.order_id }]);
  }

  deleteInvoice(event)
  {
    let parameters;
    parameters = { 
      mode:"delete",
      shop_id:this.apiservice.shop_id,
      order_id:event.order_id
    }
    // console.log(parameters)
    this.form_status = true
      this.httpClient.post(this.apiservice.serverEstimateURL, parameters)
        .subscribe(res => {
          // console.log(res);
          this.form_status = false
            if(res['status'])
            {
              this.toastr.success(res['message']);
              this.ngOnInit()
            }
            else{
              this.toastr.error(res['message']);
            }
        })
  }

  invoiceClicked(order_id,bulk)
  {
    if(bulk == 1)
    {
      this.form_status = true
      this.apiservice.openSpinner()
      var getEstimateDetailsURL = this.apiservice.getInvoiceDetailsURL+"?order_id="+order_id+"&shop_id="+this.apiservice.shop_id
      this.httpClient.get(getEstimateDetailsURL).subscribe(data => {
        this.apiservice.closeSpinner()
        // console.log(data)
        if(data['details'] != null)
        {
          this.form_status = false
          // console.log(data)
          this.actualdata = data['details'];
          this.data = this.actualdata;
          if(data['shop_details'] != null)
          this.geninvoice.genEstimateProductsPDF(this.data,data['shop_details'])
      }
      else{
        this.form_status = false;
        this.toastr.error("No Data Found");
        this.router.navigateByUrl('/invoices');
      }
  
      });
    }
  }

}
