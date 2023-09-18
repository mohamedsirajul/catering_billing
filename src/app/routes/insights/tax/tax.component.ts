import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { OnInit, AfterViewInit, ViewChild, Component } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import * as moment from 'moment';
import { catchError, first, tap } from 'rxjs/operators';
import { Observable } from 'rxjs'
import { ApiService } from 'app/service/api.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TableUtil } from 'app/service/table_utils';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { GenInvoice } from 'app/service/invoice_gen';

interface Sales {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-tax',
    templateUrl: './tax.component.html',
    styleUrls: ['./tax.component.scss'],
    providers: [DatePipe]
  })

export class TaxComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  actualdata = [];
  data = [];
  dataSource: any;
  parameters: {};
  cus_no: string[] = [];

  form_status = true;
  custom_status = false;
  start_date: any;
  end_date: any;

  w_f_date: any;
  w_l_date: any;

  m_f_day: any;
  m_l_day: any;

  report: Sales[] = [
    {value: 'daily', viewValue: 'Daily Sales'},
    {value: 'weekly', viewValue: 'Weekly Sales'},
    {value: 'monthly', viewValue: 'Monthly Sales'},
    {value: 'custom', viewValue: 'Custom Sales'}
  ];

  selectedValue = this.report[0].value;
  today_date: any;
  displayedColumns: string[] = ['s_no','invoice_no', 'delivery_date','cus_name','sub_total','gst_total'];
  head = [['S.No','Invoice No', 'Delivery Date', 'Name', 'Sub Total','Tax Amount']];
  ex_head = ['S.No','Invoice No', 'Delivery Date', 'Name', 'Sub Total','Tax Amount'];
  stats = [
    {
      title: 'Invoices',
      amount: '0',
      color: 'bg-green-500',
    },
    {
      title: 'Sales (₹)',
      amount: '0',
      color: 'bg-green-500',
    },
    {
      title: 'Taxes (₹)',
      amount: '0',
      color: 'bg-green-500',
    },
    {
      title: 'Customers',
      amount: '0',
      color: 'bg-green-500',
    }
  ];

  constructor(public httpClient: HttpClient, private router:Router,
    private apiservice: ApiService,private datePipe: DatePipe,private toastr: ToastrService,
    private dialog: MatDialog, private geninvoice: GenInvoice,
    ) {
  }

  tablename= "Tax Report";

  exportcsv() {
    if(this.data.length != 0)
    TableUtil.generateReportExcel(this.dataSource.data, this.ex_head,
      this.displayedColumns,
      this.tablename,this.apiservice.shop_name);
    else alert("No Data")
  }

  exportpdf() {
    if(this.data.length != 0)
    TableUtil.exportPDF(
      this.dataSource.data,
      this.head,
      this.displayedColumns,
      this.apiservice.shop_name,
      this.tablename,
      'Tax Report'
    );
    else alert("No Data")
  }

  ngOnInit(){
    if(navigator.onLine){
      this.form_status = false;
      this.today_date = new Date();
      this.today_date = this.datePipe.transform(this.today_date, 'dd/MM/yyyy');
      // this.getdatafromServer()
    }
    else {
        this.router.navigate(['/no-internet']);
    }
  }

  StartDateEvent(dateval)
  {
    this.start_date = this.datePipe.transform(dateval.value, 'dd/MM/yyyy');
  }

  EndDateEvent(dateval)
  {
    this.end_date = this.datePipe.transform(dateval.value, 'dd/MM/yyyy');
  }

  getResults()
  {
    var start_unix = moment(this.start_date, 'DD/MM/YYYY').unix();
    var end_unix = moment(this.end_date, 'DD/MM/YYYY').unix();
    if(this.start_date != null && this.end_date != null)
    {
      if(start_unix > end_unix)
      {
        this.toastr.error("Start Date is Greater than End Date");
      }
      else{
        this.loadDatafromServer()
      }
    }
    else{
      alert("Date Missing")
    }
  }

  orderidClicked(order_id)
  {
    this.apiservice.openSpinner()
      this.form_status = true
      var getInvoiceDetailsURL = this.apiservice.getInvoiceDetailsURL+"?order_id="+order_id+"&shop_id="+this.apiservice.shop_id
      this.httpClient.get(getInvoiceDetailsURL).subscribe(data => {
        // console.log(data)
        if(data['details'] != null)
        {
          this.form_status = false
          // console.log(data)
          this.actualdata = data['details'];
          this.data = this.actualdata;
          if(data['shop_details'] != null)
          this.geninvoice.genInvoicePDF(this.data,data['shop_details'],'view')
      }
      else{
        this.form_status = false;
        this.toastr.error("No Data Found");
        // this.router.navigateByUrl('/invoices');
      }
      this.apiservice.closeSpinner()
      });
      // console.log(value)
  }

  loadDatafromServer() {
    this.cus_no = []
    this.form_status = true;
    this.apiservice.openSpinner()
    this.dataSource = new MatTableDataSource();
      this.parameters = { 
        start_date:this.start_date , 
        end_date:this.end_date ,
        shop_id:this.apiservice.shop_id,
        };
        // console.log(this.parameters)
      this.apiservice
      .PostToServer('payment_report.php', this.parameters)
      .pipe(first())
      .subscribe(data => {
        // console.log(data)
        if(data['data'] != null)
        {
          this.data = data['data'];
          // console.log(this.data)
          this.dataSource.data = this.data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          let tax = 0,item_total = 0,total = 0
          for(let i=0;i<this.dataSource.data.length;i++)
          {
            tax = tax + parseFloat(this.dataSource.data[i]['gst_total'])
            item_total = item_total + (parseFloat(this.dataSource.data[i]['sub_total']))
            this.cus_no.push(this.dataSource.data[i]['cus_mobile']);
            // this.dataSource.data[i]['it_total'] = parseFloat(this.dataSource.data[i]['item_total']) - parseFloat(this.dataSource.data[i]['discount_amount']) - parseFloat(this.dataSource.data[i]['coins_use'])
            // this.dataSource.data[i]['total'] =  parseFloat(this.dataSource.data[i]['tax_amount']) + (parseFloat(this.dataSource.data[i]['item_total']) - parseFloat(this.dataSource.data[i]['discount_amount']) - parseFloat(this.dataSource.data[i]['coins_use']))
          }
          this.cus_no = Array.from(new Set(this.cus_no));
          // console.log(this.cus_no)
          total = tax + item_total
          this.stats[0].amount = this.dataSource.data.length
          this.stats[1].amount = parseFloat(item_total.toString()).toFixed(2)
          this.stats[2].amount = parseFloat(tax.toString()).toFixed(2)
          this.stats[3].amount = String(this.cus_no.length)
       }
       else{
        this.stats[0].amount = '0'
        this.stats[1].amount = '0'
        this.stats[2].amount = '0'
        this.stats[3].amount = '0'
        this.toastr.error("No Data Found");
       }
      this.form_status = false;
      this.apiservice.closeSpinner()
      });
    }

}

