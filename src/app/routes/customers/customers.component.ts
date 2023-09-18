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

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  formGroup: FormGroup;
  toppingsControl = new FormControl([]);
  filterForm = new FormGroup({});
  dataSource = new MatTableDataSource([]);

  displayedColumns: string[] = ['s_no','cus_name','cus_mobile','cus_address'];
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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    public httpClient: HttpClient,
    public dialog: MatDialog,
    private apiservice: ApiService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
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

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    this.dataSource.filter = filterValue;
  }

  ngOnInit() {
    this.loadCustomerData(this.apiservice.shop_id);
  }

  loadCustomerData(shop_id) {
    this.form_status = true;
    this.apiservice.openSpinner()
    var customerURL = this.apiservice.customerURL+"?sid="+shop_id
    this.httpClient.get(customerURL).subscribe(data => {
      if(data != null)
      {
        // console.log(data)
        this.actualdata = data['customers'];
        this.data = this.actualdata;
        this.form_status = false;
        this.dataSource.data = this.data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        if(this.data.length == 0)
        {
          this.toastr.error("No Data Found");
        }
    }
    else{
      this.form_status = false;
      this.toastr.error("No Data Found");
    }
    this.apiservice.closeSpinner()
    });

  }

}
