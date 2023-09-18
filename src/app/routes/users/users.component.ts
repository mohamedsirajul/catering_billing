import {
  ComponentRef,
  ComponentFactoryResolver,
  ElementRef,
  OnInit,
  ViewContainerRef,
  ViewChild,
  Component,
  ViewRef,
  AfterViewInit,
  ChangeDetectorRef,
  Inject,
} from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { HttpClient } from '@angular/common/http';
import { MatSort } from '@angular/material/sort';

import { MatTable, MatTableDataSource } from '@angular/material/table';

import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { Observable } from 'rxjs';
import { first, map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { ApiService } from 'app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { UserDialogBoxComponent } from '../user-dialog-box/user-dialog-box.component';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit{
  @ViewChild('fieldInput') fieldInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  formGroup: FormGroup;
  dataSource = new MatTableDataSource([]);
  filteredColumns: string[] = [
    's_no',
    'name',
    'mobile',
    'role'
  ];
  displayedColumns: string[] = [
    's_no',
    'name',
    'mobile',
    'role',
    'action',
  ];
 
  parameters: {};

  urls = [];
  userRoles = ['Admin', 'Manager', 'User'];  
  isDisabled = false;

  filteredValues: Observable<any[]>;

  edit_status = false;
  form_status = true;
  report_status = true;
  submit_status = true;
  update_status = false;
  
  actualdata = {};
  data: any = [];
  category_data: any = [];
  sub_category_data: any = [];
  select_value: any;
  user_id: any;

  constructor(
    private formBuilder: FormBuilder,
    public httpClient: HttpClient,
    private apiservice: ApiService,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.formGroup = this.formBuilder.group({
      sub_category_name: ['', Validators.required],
    });
  }

  myForm = new FormGroup({
    user_name: new FormControl('', [Validators.required]),
    user_mobile: new FormControl('', [Validators.required]),
    user_role: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    this.form_status = false;
    this.loadUsersData(this.apiservice.shop_id);
  }

  loadUsersData(shop_id) {
    this.apiservice.openSpinner()
    var usersURL = this.apiservice.usersURL+"?sid="+shop_id
    this.httpClient.get(usersURL).subscribe(data => {
      if(data != null)
      {
        // console.log(data)
        this.actualdata = data['users'];
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
          // for (let i = 0; i < this.data.length; i++) {
          //   if(this.data[i]['is_paid'] == 0)
          //   {
          //     this.data[i]['paid_status'] =  "Unpaid";
          //     this.data[i]['paidstatus'] = true
          //   }
          //   else if(this.data[i]['is_paid'] == 1)
          //   {
          //     this.data[i]['paid_status'] =  "Partial Paid";
          //     this.data[i]['paidstatus'] = true
          //   }
          //   else if(this.data[i]['is_paid'] == 2)
          //   {
          //     this.data[i]['paid_status'] =  "Paid";
          //     this.data[i]['paidstatus'] = false
          //   }
          // }
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
    filterValue = filterValue.trim(); // Remove whitespace
    // filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  loadHomeData(shop_id,token) {
    var homesectionURL = this.apiservice.homesectionURL+"?sid="+shop_id+"&token="+token
    this.httpClient.get(homesectionURL).subscribe(data => {
      if(data != null)
      {
        this.actualdata = data;
        this.data = this.actualdata;
        this.form_status = false;
        this.dataSource.data = this.data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        for (let i = 0; i < this.data.length; i++) {
          if(this.data[i]['status'] == 0)
          {
            this.data[i]['activate'] = false
          }
          else if(this.data[i]['status'] == 1){
            this.data[i]['activate'] = true
          }
          if(this.data[i]['cattime'] != "")
          {
            this.data[i]['discattime'] = this.data[i]['cattime']+" ( "+this.data[i]['catstarttime']+" - "+this.data[i]['catstoptime']+" )"
          }
          this.data[i]['s_no'] =  i+1;
        }
      }
      else{
        this.form_status = false;
        this.toastr.error("No Data Found");
      }
    });
  }

  roleSelection(event)
  {
    this.select_value = event
    // console.log(event)
  }

  updateHomeStatus(element) {
    this.form_status = true
    // console.log(element)
    var homeStatusURL ="changehomestatus.php?sid="+this.apiservice.shop_id+"&token="+this.apiservice.shop_code
    this.apiservice.PostToServer(homeStatusURL,element.id)
    .pipe(first())
    .subscribe(
        data => {
          // console.log(data['status'])
          if(data['status']){
            this.toastr.success(data['message']);
            // alert(data['message'])
          }
          else{
          }
          this.ngOnInit()
          this.form_status = false
        },
        error => {
          this.toastr.error("Check Internet");
          // alert("Check Internet")
        })
  }

  editHome(user) {
    this.report_status = false;
    this.edit_status = true;
    this.update_status = true;
    this.submit_status = false;
    this.user_id = user.id
    this.myForm.get('user_name').setValue(user.name);
    this.myForm.get('user_mobile').setValue(user.mobile);
    this.myForm.get('user_role').setValue(user.role);
  }

  newUserEntry() {
    this.isDisabled = false
    this.report_status = false;
    this.edit_status = true;
    this.update_status = false;
    this.submit_status = true;
    this.myForm.get('user_name').setValue('');
    this.myForm.get('user_mobile').setValue('');
    this.myForm.get('user_role').setValue('');
  }

  displayReport() {
    this.report_status = true;
    this.edit_status = false;
    this.form_status = true
    this.ngOnInit();
  }

  openDialog(action,obj) {
    obj.action = action;
    const dialogRef = this.dialog.open(UserDialogBoxComponent, {
      disableClose:true,
      width: 'auto',
      height: 'auto',
      data:obj
    });

    dialogRef.afterClosed().subscribe(result => {
     if(result.event == 'Delete'){
        this.deleteRowData(result.data);
      }
    });
  }

  deleteRowData(row_obj){
    // console.log(row_obj)
    let parameters = {
      user_id:row_obj.id,
      shop_id:this.apiservice.shop_id,
      mode:'delete'
    };
    // console.log(parameters)
    this.sendtoServerDelete(parameters)
  }

  sendtoServerDelete(parameters) {
      // console.log(parameters);
      this.apiservice.openSpinner()
      this.form_status = true
        this.httpClient.post(this.apiservice.serverUserURL, parameters)
          .subscribe(res => {
            // console.log(res);
            this.form_status = false
            if(res['status'])
            {
              // alert(res['message'])
              this.toastr.success(res['message']);
                this.dataSource.data = this.dataSource.data.filter((value, key) => {
                  return value.id != parameters.user_id;
                });
            }
            else{
              this.toastr.error(res['message']);
              // alert(res['message'])
            }
            this.apiservice.closeSpinner()
          })
  }

  sendtoServer(mode_val) {
    if (
      this.myForm.get('user_name').value != '' && this.myForm.get('user_mobile').value != '' && this.myForm.get('user_role').value != ''
    ) {
      this.parameters = { 
        form_value: this.myForm.value, 
        mode: mode_val , 
        shop_id:this.apiservice.shop_id,
        shop_name:this.apiservice.shop_name,
        shop_logo:this.apiservice.shop_logo,
        user_id: this.user_id
      };
      // console.log(this.parameters);
      this.form_status = true
        this.httpClient.post(this.apiservice.serverUserURL, this.parameters)
          .subscribe(res => {
            // console.log(res);
            this.form_status = false
            if(res['status'])
            {
              // alert(res['message'])
              this.toastr.success(res['message']);
              this.displayReport();
            }
            else{
              this.toastr.error(res['message']);
              // alert(res['message'])
            }
          })
  }
  else{
    this.toastr.error("Complete All Details")
  }
  }

}
