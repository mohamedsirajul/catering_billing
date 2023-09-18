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
import { Observable } from 'rxjs';
import { first, map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { ApiService } from 'app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DialogBoxComponent } from 'app/routes/dialog-box/dialog-box.component';
import { NewDialogBoxComponent } from 'app/routes/new-dialog-box/new-dialog-box.component';

export interface ProductData {
  id: string;
  s_no:string;
  p_name: string;
  sub_name:any;
  rate: string;
  gst: string;
  qty:string;
  total:string;
}

@Component({
  selector: 'app-menu-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ProductsComponent {
 
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

  // PRODUCT_DATA: ProductData[] = [
  //   {id:'1',s_no: '1', p_name: 'Artificial',rate:'20',qty:'5',total:'100',sub_name:[
  //      "Bio",
  //      "Chemistry"
  //     ]},
  //     {id:'1',s_no: '1', p_name: 'Artificial',rate:'20',qty:'5',total:'100',sub_name:[]}
  // ];

  PRODUCT_DATA: ProductData[] = []

  displayedColumns: string[] = ['s_no', 'p_name', 'rate', 'gst', 'action'];
  dataSource = new MatTableDataSource();
  form_status = false
  isTableExpanded = true;
  @ViewChild(MatTable,{static:true}) table: MatTable<any>;

  constructor(public dialog: MatDialog,
    public httpClient: HttpClient,
    private apiservice: ApiService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,) {
  
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    this.dataSource.filter = filterValue;
    // console.log(filterValue)
  }

  ngOnInit() {
    this.loadProductData(this.apiservice.shop_id)
  }

  loadProductData(shop_id) {
    this.form_status = true
    this.apiservice.openSpinner()
    var allMenuURL = this.apiservice.serverProductsURL+"?sid="+shop_id
    this.httpClient.get(allMenuURL).subscribe(data => {
      // console.log(data['products'])
      if(data['products'] != null && data['products'].length != 0)
      {
        this.dataSource.data = data['products'];
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // console.log(this.product_options)
      }
      else{
        this.toastr.error("No Data Found");
      }
      this.form_status = false
      this.apiservice.closeSpinner()
      },
      error => {
        this.toastr.error("Check Intenet");
        // alert("Check Internet")
      });
  }

  toggleTableRows() {
    this.isTableExpanded = !this.isTableExpanded;
    this.dataSource.data.forEach((row: any) => {
      // console.log(row)
      row.isExpanded = this.isTableExpanded;
    })
  }

  openDialog(action,obj) {
    obj.action = action;
    const dialogRef = this.dialog.open(NewDialogBoxComponent, {
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

  addRowData(row_obj){
    //  console.log(row_obj)
    let subproducts = row_obj.sub_products.join("$;")
     let parameters = {
      product_name: row_obj.details.product_name,
      product_price: row_obj.details.product_price,
      product_gst: row_obj.details.product_gst,
      subproducts: subproducts,
      shop_id:this.apiservice.shop_id,
      mode:'add'
    };
    // console.log(parameters)
    this.sendtoServer(parameters)
  }
  updateRowData(row_obj){
    // console.log(row_obj)
    let subproducts = row_obj.sub_products.join("$;")
     let parameters = {
      product_id:row_obj.id,
      product_name: row_obj.details.product_name,
      product_price: row_obj.details.product_price,
      product_gst: row_obj.details.product_gst,
      subproducts: subproducts,
      shop_id:this.apiservice.shop_id,
      mode:'edit'
    };
    // console.log(parameters)
    this.sendtoServer(parameters)
  }
  deleteRowData(row_obj){
    // console.log(row_obj)
    let parameters = {
      product_id:row_obj.id,
      shop_id:this.apiservice.shop_id,
      mode:'delete'
    };
    // console.log(parameters)
    this.sendtoServer(parameters)
  }

  sendtoServer(parameters)
  {
    this.form_status = true
    this.apiservice.openSpinner()
      this.httpClient.post(this.apiservice.serverProductURL,parameters)
        .subscribe(res => {
          // console.log(res);
          this.apiservice.closeSpinner()
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
}

