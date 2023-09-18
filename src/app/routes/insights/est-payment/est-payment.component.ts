import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { OnInit, AfterViewInit, ViewChild, Component } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import * as moment from 'moment';
import { catchError, first, map, startWith, tap } from 'rxjs/operators';
import { Observable } from 'rxjs'
import { ApiService } from 'app/service/api.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TableUtil } from 'app/service/table_utils';


interface Sales {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-est-payment',
    templateUrl: './est-payment.component.html',
    styleUrls: ['./est-payment.component.scss'],
    providers: [DatePipe]
  })

export class EstimatePaymentComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  actualdata = {};
  data = [];
  dataSource: any;
  parameters: {};

  form_status = false;
  custom_status = false;
  start_date: any;
  end_date: any;

  w_f_date: any;
  w_l_date: any;

  m_f_day: any;
  m_l_day: any;

  payment_data: any = [];
  estimate_data: any = [];
  EstimateNos : Observable<any[]>;
  estimate_no: FormControl = new FormControl();
  Estimate_options: string[] = [];

  today_date: any;
  displayedColumns: string[] = ['s_no','received_by', 'received_date','total','previous_bal','given_amount','current_bal','notes'];
  head = [['S.No', 'Received by','Received Date', 'Total', 'Previous', 'Given','Current','Notes']];
  ex_head = ['S.No','Estimate Date', 'Estimate No', 'Name', 'Mobile', 'Total','Billed by'];
  stats = [
    { 
      title: 'Total (₹)',
      amount: '0',
      color: 'bg-purple-500',
    },
    {
      title: 'Advance (₹)',
      amount: '0',
      color: 'bg-purple-500',
    },
    {
      title: 'Given (₹)',
      amount: '0',
      color: 'bg-purple-500',
    },
    {
      title: 'Balance (₹)',
      amount: '0',
      color: 'bg-purple-500',
    }
  ];

  constructor(public httpClient: HttpClient, private router:Router,
    private apiservice: ApiService,private datePipe: DatePipe,private toastr: ToastrService,
    ) {
  
    }

  tablename = "Payment Report";

  exportcsv() {
    if(this.dataSource.data.length != 0)
    TableUtil.generateReportExcel(this.dataSource.data,this.ex_head,this.displayedColumns, this.tablename,this.apiservice.shop_name);
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
      'Payment Details'
    );
    else alert("No Data")
  }

  ngOnInit(){
    if(navigator.onLine){
      this.autocomplete()
      this.getEstimatedata(this.apiservice.shop_id)
    }
    else {
        this.router.navigate(['/no-internet']);
    }
  }

  autocomplete() {
    this.EstimateNos = this.estimate_no.valueChanges.pipe(
      startWith(''),
      map(val => this.filter1(val))
    );
  }

  private filter1(val: any): any[] {
    return this.Estimate_options.filter(option => option.toLowerCase().includes(val.toLowerCase()));
  }

  onTextChange(value) {
    // console.log(value)
  }

  getEstimatedata(shop_id){
    this.form_status = true
    this.apiservice.openSpinner()
    var getEstimate = this.apiservice.estimateURL+"?sid="+shop_id
    this.httpClient.get(getEstimate).subscribe(data => {
      // console.log(data)
      this.estimate_data = data['estimates'];
      if(this.estimate_data != null)
      {
        this.form_status = false
        for (let i = 0; i < this.estimate_data.length; i++) {
          this.Estimate_options.push(this.estimate_data[i]['estimate_no']);
        }
      }
      this.Estimate_options = Array.from(new Set(this.Estimate_options));
      this.apiservice.closeSpinner()
    });
  }

  onSelectionChanged(value) {
    this.dataSource = new MatTableDataSource();
    // console.log(value)
    let parameters = { 
      shop_id:this.apiservice.shop_id,
      estimate_no:value
    }
    this.form_status = true
    this.apiservice.openSpinner()
      this.httpClient.post(this.apiservice.serverestimatePaymentURL, parameters)
        .subscribe(res => {
          // console.log(res);
          this.form_status = false
          this.payment_data = res['payment']
          this.stats[0].amount = this.payment_data.total_amount
          this.stats[1].amount = this.payment_data.advance
          this.stats[2].amount = this.payment_data.given
          this.stats[3].amount = this.payment_data.balance
          this.data = this.payment_data.transactions;
          // console.log(this.data)
          if(this.data.length != 0)
          {
            for(let i = 0;i<this.data.length;i++)
            {
              this.data[i].received_date = this.apiservice.changeDateTime(this.data[i].received_date)
            }
            this.dataSource.data = this.data;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }
          else{
            this.toastr.error("No Transactions")
          }
          this.apiservice.closeSpinner()
            // if(res['status'])
            // {
            //   this.toastr.success(res['message']);
            //   this.router.navigateByUrl('/estimates');
            // }
            // else{
            //   this.toastr.error(res['message']);
            // }
        })
  }

}

