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

@Component({
  selector: 'app-menu-sub-products',
  templateUrl: './sub-products.component.html',
  styleUrls: ['./sub-products.component.scss'],
})
export class SubProductsComponent {
  @ViewChild('fieldInput') fieldInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;
  visible: boolean = true;
  selectable: boolean = true;
  removable: boolean = true;
  removable1: boolean = true;
  addOnBlur: boolean = false;
  separatorKeysCodes = [ENTER, COMMA];
  formGroup: FormGroup;
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = [
    's_no',
    'action',
    'product_name',
    'discattime',
    'toggle',
    'product_image',
    'price',
    'product_price',
    'discount',
    'catname',
    'subcatname',
    'stock'
  ];
  filteredColumns: string[] = [
    'id',
    'catname',
    'subcatname',
    'product_name',
  ];
  selectedColumns = [];
  Dates = ['dob', 'esidate'];
  toppingsControl = new FormControl([]);
  dateform = new FormControl([]);
  filterValues = {};
  serializedDate: any;
  filterForm = new FormGroup({});
  Filtercolumn: any;
  FilterValues: any;
  FilterDate: any;
  FilterDateValue: any;
  daterange: any;
  i: any;

  catTiming = ['Default', 'Customise'];  
  isDisabled = false;

  DateBool: any;
  SelectBool: any;
  fileToUpload: any;
  category_options: string[] = [];
  sub_category_options: string[] = [];
  image1: any;
  filteredOptions: Observable<any[]>;
  subfilteredOptions: Observable<any[]>;
  myControl: FormControl = new FormControl();
  myControl1: FormControl = new FormControl();
  category_name: any[];
  sub_category_name: any[];
  parameters: {};
  data_source: any;
  urls = [];
  form_status = false;
  stock = ['Yes', 'No'];
  productType = ['Veg', 'Non-veg', 'None'];
  product_popular = ['Yes', 'No'];
  fieldCtrl = new FormControl();
  productCtrl = new FormControl();
  
  filteredValues: Observable<any[]>;
  price_values: any[] = [];
  field_values: any[] = [];
  edit_status = false;
  report_status = true;
  submit_status = true;
  update_status = false;

  actualdata = {};
  data: any = [];
  category_data: any = [];
  sub_category_data: any = [];

  product_quantity: any = [];
  product_price: any = [];
  product_id: any;

  constructor(
    private formBuilder: FormBuilder,
    public httpClient: HttpClient,
    public dialog: MatDialog,
    private apiservice: ApiService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.formGroup = this.formBuilder.group({
      sub_category_name: ['', Validators.required],
      sub_category_image: ['', Validators.required],
      cattiming:['', Validators.required],
      catstarttime:['', Validators.required],
      catstoptime:['', Validators.required],
      fileSource: ['', Validators.required],
      file: ['', Validators.required],
    });

    this.filteredValues = this.productCtrl.valueChanges.pipe(
      startWith(),
      map((val: string | null) => (val ? this.filter(val) : this.field_values.slice()))
    );
  }

  filter(name: string) {
    return this.field_values.filter(field => field.toLowerCase().includes(name.toLowerCase()));
  }
  imageSrc: string;
  myForm = new FormGroup({
    product_name: new FormControl('', [Validators.required]),
    cattiming: new FormControl('', [Validators.required]),
    catstarttime: new FormControl('', [Validators.required]),
    catstoptime: new FormControl('', [Validators.required]),
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required]),
    out_of_stock: new FormControl('', [Validators.required]),
    product_popular: new FormControl('', [Validators.required]),
    product_description: new FormControl(''),
    product_discount: new FormControl('', [Validators.required]),
    product_type: new FormControl('', [Validators.required]),
   
  });

  ngOnInit() {
    this.fillfiltervalues();
    this.fillfilterform();
    this.formSubscribe();
    this.loadToppingfromlink();
    // this.getFormsValue();
    this.autocomplete();
    this.subautocomplete();
    // this.loadProductData(this.apiservice.shop_id,this.apiservice.shop_code);
    // this.loadProducts(this.apiservice.shop_id,this.apiservice.shop_code);
  }

  loadProductData(shop_id,token) {
    var allMenuURL = this.apiservice.allMenuURL+"?sid="+shop_id+"&token="+token
    this.httpClient.get(allMenuURL).subscribe(data => {
      // console.log(data)
      this.actualdata = data['productlist']
      this.data = this.actualdata;
      if(this.data != null)
      {
        // console.log(data)
        this.form_status = false;
        this.dataSource.data = this.data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        for (let i = 0; i < this.data.length; i++) {
          let temp_qty = "";
          let temp_price = "";
          if(this.data[i] != null)
          {
            for(let j = 0;j<this.data[i]['price'].length;j++)
            {
              if(j==0)
              {
                temp_qty += this.data[i]['price'][j]['product_type']
                temp_price += this.data[i]['price'][j]['product_price']
              }
              else{
                temp_qty = temp_qty +","+ this.data[i]['price'][j]['product_type']
                temp_price = temp_price +","+ this.data[i]['price'][j]['product_price']
              }
            }
            this.data[i]['qty'] = temp_qty
            this.data[i]['price'] = temp_price
          }
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
          this.data[i]['s_no'] = i + 1;
          // if(this.data[i]['popular'] == 0)
          // {
          //   this.data[i]['popular'] = false
          // }
          // else if(this.data[i]['popular'] == 1){
          //   this.data[i]['popular'] = true
          // }

          if(this.data[i]['stock'] == 0)
          {
            this.data[i]['sactivate'] = false
          }
          else if(this.data[i]['stock'] == 1){
            this.data[i]['sactivate'] = true
          }

          if(this.data[i]['product_image'] != null && this.data[i]['product_image'] != "" && this.data[i]['product_image'].length != 0)
          this.data[i]['product_image'] = this.data[i]['product_image'];
          else this.data[i]['product_image'] = "./assets/images/no_img.jpg";
        }
      }
      else{
        this.form_status = false;
        this.toastr.error("No Data Found");
      }
      },
      error => {
        this.toastr.error("Check Intenet");
        // alert("Check Internet")
      });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    // filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }


  loadProducts(shop_id,token) {
    var allMenuURL = this.apiservice.allMenuURL+"?sid="+shop_id+"&token="+token
    this.httpClient.get(allMenuURL).subscribe(data => {
      if(data['categorylist'] != null)
      {
        this.category_data = data['categorylist'];
        this.sub_category_data = data['subcategorylist'];
        if(this.category_data != null)
        {
          for (let i = 0; i < this.category_data.length; i++) {
            this.category_options.push(this.category_data[i]['catname']);
          }
        }
        this.category_options = Array.from(new Set(this.category_options));
      }
      else{
        this.form_status = false;
        this.toastr.error("No Data Found");
      }
      },
      error => {
        this.toastr.error("Check Intenet");
        // alert("Check Internet")
      });
  }

  onSelectionChanged(value) {
    this.sub_category_options = [];
    this.category_name = value;
    this.myControl.setValue(value)
    for (let i = 0; i < this.sub_category_data.length; i++) {
      if (this.category_name == this.sub_category_data[i]['catname']) {
        this.sub_category_options.push(this.sub_category_data[i]['subcatname']);
      }
    }
    this.sub_category_options = Array.from(new Set(this.sub_category_options));
  }

  onsubSelectionChanged(value) {
    this.sub_category_name = value;
    this.myControl1.setValue(value)
  }

  onTextChange(event) {
    this.sub_category_options = [];
    this.parameters = {};
    this.myControl1.setValue('');
  }
  
  onTextChange1(event) {
    this.parameters = {};
  }

  autocomplete() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(val => this.filter1(val))
    );
  }

  subautocomplete() {
    this.subfilteredOptions = this.myControl1.valueChanges.pipe(
      startWith(''),
      map(val => this.subfilter1(val))
    );
  }

  private filter1(val: any): any[] {
    return this.category_options.filter(option => option.toLowerCase().includes(val.toLowerCase()));
  }

  private subfilter1(val: any): any[] {
    return this.sub_category_options.filter(option =>
      option.toLowerCase().includes(val.toLowerCase())
    );
  }

  get c() {
    return this.myForm.controls;
  }

  onFileChange(event) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imageSrc = reader.result as string;
        this.myForm.patchValue({
          fileSource: reader.result,
        });
      };
    }
  }

  updateProductStatus(element) {
    this.form_status = true
    //  console.log(element)
    var productStatusURL ="changeproductstatus.php?sid="+this.apiservice.shop_id+"&token="+this.apiservice.shop_code
     this.apiservice.PostToServer(productStatusURL,element.id)
     .pipe(first())
     .subscribe(
         data => {
          //  console.log(data['status'])
           if(data['status']){
            this.toastr.success(data['message']);
            // alert(data['message'])
           }
           else{
           }
           this.loadProductData(this.apiservice.shop_id,this.apiservice.shop_code)
           this.form_status = false
         })
  }

  updateStockStatus(element){
     this.form_status = true
    //  console.log(element)
    var productStockURL ="changepstockstatus.php?sid="+this.apiservice.shop_id+"&token="+this.apiservice.shop_code
     this.apiservice.PostToServer(productStockURL,element.id)
     .pipe(first())
     .subscribe(
         data => {
          //  console.log(data['status'])
           if(data['status']){
            this.toastr.success(data['message']);
            // alert(data['message'])
           }
           else{
           }
           this.loadProductData(this.apiservice.shop_id,this.apiservice.shop_code)
           this.form_status = false
         })
  }

  openDialog(action, obj) {
    obj.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '500px',
      data: obj,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        if (result.event == 'p_Delete') {
          // console.log(result);
          this.product_id = result.data.id;
          this.sendtoServer('delete');
        }
      } else {
      }
    });
  }

  deleteImg(){
    this.myForm.get('file').setValue('');
    this.imageSrc = '';
    // console.log("delete")
  }


  editProduct(product) {
    // console.log(product)
    this.report_status = false;
    this.edit_status = true;
    this.update_status = true;
    this.submit_status = false;
    this.product_id = product.id
    if(product.popular == "1")
    this.myForm.get('product_popular').setValue("Yes");
    else this.myForm.get('product_popular').setValue("No");
    if(product.stock == "1")
    this.myForm.get('out_of_stock').setValue("No");
    else this.myForm.get('out_of_stock').setValue("Yes");
    this.myForm.get('product_name').setValue(product.product_name);
    this.myForm.get('product_discount').setValue(product.discount);
    this.myForm.get('product_type').setValue(product.product_type);
    this.myForm.get('product_description').setValue(product.product_desc)
    this.myForm.get('cattiming').setValue(product.cattime);
    if(product.cattime == "Default")
    {
      this.isDisabled = false
    }
    else{
      this.isDisabled = true
    }
    this.myForm.get('catstarttime').setValue(product.catstarttime);
    this.myForm.get('catstoptime').setValue(product.catstoptime);
    // var str = product.product_image; 
    // var splitted = str.split("product/", 2); 
    // console.log(splitted)
    // this.myForm.get('file').setValue(splitted[1]);
    this.field_values = product.qty.split(',')
    this.price_values = product.price.split(',')
    this.myControl.setValue(product.catname)
    this.myControl1.setValue(product.subcatname)
    this.imageSrc = product.product_image;
  }

  onTimeSelection(event)
  {
    this.myForm.get('catstarttime').setValue('');
    this.myForm.get('catstoptime').setValue('');
    if(event == "Default")
    {
      this.isDisabled = false
    }
    else{
      this.isDisabled = true
    }
    // console.log(event)
  }

  newProductEntry() {
    this.isDisabled = false
    this.report_status = false;
    this.edit_status = true;
    this.update_status = false;
    this.submit_status = true;
    this.myForm.get('product_name').setValue('');
    this.myForm.get('file').setValue('');
    this.imageSrc = '';
    this.myControl.setValue('');
    this.myControl1.setValue('');
    this.myForm.get('out_of_stock').setValue('');
    this.myForm.get('product_type').setValue('');
    this.myForm.get('product_popular').setValue('');
    this.myForm.get('product_discount').setValue('');
    this.myForm.get('product_description').setValue('');
    this.myForm.get('cattiming').setValue('Default');
    this.price_values = [];
    this.field_values = [];
  }

  displayReport() {
    this.report_status = true;
    this.edit_status = false;
    this.loadProductData(this.apiservice.shop_id,this.apiservice.shop_code);
  }

  sendtoServer(mode_val) {
    // console.log(this.imageSrc)
    // console.log(this.myControl.value)
    // console.log(this.myControl1.value)
    if(this.myControl.value != null || mode_val == 'delete')
    {
      let productvalues = this.field_values.join("$;")
      let productprice = this.price_values.join("$;")
      this.parameters = {
        form_value: this.myForm.value,
        category_name: this.myControl.value,
        sub_category_name: this.myControl1.value,
        mode: mode_val,
        product_values: productvalues,
        product_price: productprice,
        product_id: this.product_id,
        shop_id:this.apiservice.shop_id,
        shop_code:this.apiservice.shop_code,
        type:'product'
      };
      // console.log(this.parameters);
      this.form_status = true
      this.httpClient.post(this.apiservice.serverProductURL, this.parameters)
        .subscribe(res => {
          // console.log(res);
          this.form_status = false
            if(res['status'])
            {
              this.toastr.success(res['message']);
              // alert(res['message'])
              if (mode_val == 'delete') {
                this.dataSource.data = this.dataSource.data.filter((value, key) => {
                  return value.id != this.product_id;
                });
              } else this.displayReport();
            }
            else{
              this.toastr.error(res['message']);
              // alert(res['message'])
            }
        })
    }
    else{
      this.toastr.error("Fill all Fields");
      // alert("Fill All Fields")
    }
    
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    const arrStr = value.toLowerCase().split(' ');
    // Add our field_value
    if ((value || '').trim()) {
      let index = this.field_values.indexOf(value.trim());
      if (index == -1) this.field_values.push(value.trim());
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.productCtrl.setValue(null);
  }

  remove(i: any): void {
    const index = this.field_values.indexOf(i);
    if (index >= 0) {
      this.field_values.splice(index, 1);
    }
  }

  add1(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    const arrStr = value.toLowerCase().split(' ');
    // Add our field_value
    if ((value || '').trim()) {
      let index = this.price_values.indexOf(value.trim());
      if (index == -1) this.price_values.push(value.trim());
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.fieldCtrl.setValue(null);
  }

  remove1(i: any): void {
    const index = this.price_values.indexOf(i);
    if (index >= 0) {
      this.price_values.splice(index, 1);
    }
  }

  loadToppingfromlink() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (!params.Filtercolumn) return;
      this.toppingsControl.setValue(params.Filtercolumn);
      // console.log(this.toppingsControl.value);

      this.filterForm.get('sl_no').setValue(params.FilterValues);
      // console.log(this.filterForm.get('sl_no').value);
    });
  }

  fillfiltervalues() {
    for (let i = 0; i < this.displayedColumns.length; i++) {
      this.filterValues[this.displayedColumns[i]] = [];
    }
  }

  fillfilterform() {
    for (let i = 0; i < this.displayedColumns.length; i++) {
      this.filterForm.controls[this.displayedColumns[i]] = new FormControl();
    }
  }

  f(val: string | number) {
    const templist = this.dataSource.data.map(x => x[val]);
    const uniqueArray = Array.from(new Set(templist));
    return uniqueArray;
  }

  valueChanged(newcontrol: { value: any[] }) {
    let oldselected = this.selectedColumns;
    this.selectedColumns = newcontrol.value;
    let removal = oldselected
      .filter(x => !this.selectedColumns.includes(x))
      .concat(this.selectedColumns.filter(x => !oldselected.includes(x)));
    this.reset(removal);
  }

  onToppingRemoved(topping: any, newcontrol: { value: any; setValue: (arg0: any) => void }) {
    for (let i = 0; i < this.displayedColumns.length; i++) {
      if (topping == this.displayedColumns[i]) {
        this.reset(topping);
      }
    }
    const toppings = newcontrol.value;
    this.removeFirst(toppings, topping);
    newcontrol.setValue(toppings);
  }

  reset(topping: string | any[]) {
    this.filterForm.get(topping).reset([]);
  }

  private removeFirst<T>(array: T[], toRemove: T): void {
    const index = array.indexOf(toRemove);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }

  formSubscribe() {
    for (let i = 0; i < this.displayedColumns.length; i++) {
      this.filterForm.get([this.displayedColumns[i]]).valueChanges.subscribe(x => {
        this.filterValues[this.displayedColumns[i]] = x;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      });
    }
  }

  getFormsValue() {
    this.dataSource.filterPredicate = (data, filter: string): boolean => {
      const bool = [];
      let searchString = JSON.parse(filter);
      for (let i = 0; i < this.displayedColumns.length; i++) {
        bool.push(false);
      }
      for (let key in searchString) {
        for (let i = 0; i < this.displayedColumns.length; i++) {
          if (key == this.displayedColumns[i]) {
            if (searchString[key].length == 0 || searchString[key].includes(data[key])) {
              bool[i] = true;
            }
          }
        }
      }
      let boolvalue = true;
      for (let i = 0; i < bool.length; i++) {
        if (bool[i] == false) boolvalue = false;
      }
      return boolvalue;
    };
  }


}
