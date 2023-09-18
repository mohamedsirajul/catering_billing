//dialog-box.component.ts
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
  time: string;
}

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.scss']
})
export class DialogBoxComponent implements OnInit {

  action:string;
  bulk_no:string;
  local_data:any;

  products_data: any = [];
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
  new_product_name: any;

  constructor(
    public dialogRef: MatDialogRef<DialogBoxComponent>,
    public httpClient: HttpClient,
    private apiservice: ApiService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ProductData) {
    // console.log(data);
    this.local_data = {...data};
    this.action = this.local_data.action;
    this.bulk_no =  this.local_data.bulk_no;
    this.filteredValues = this.subProductCtrl.valueChanges.pipe(
      startWith(),
      map((val: string | null) => (val ? this.filter(val) : this.field_values.slice()))
    );
  }

  myForm = new FormGroup({
    product_price: new FormControl('', [Validators.required]),
    product_quantity: new FormControl('', [Validators.required]),
    product_gst: new FormControl('', [Validators.required]),
    product_time: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    if(this.action == "Update")
     {
      // console.log(this.data)
      this.product_id = this.data.id
      this.product_name = this.data.p_name;
      this.field_values = this.data.sub_name.toString().split(',')
      this.productControl.setValue(this.data.p_name)
      this.myForm.get('product_quantity').setValue(this.data.qty);
      this.myForm.get('product_price').setValue(this.data.rate);
      this.myForm.get('product_gst').setValue(this.data.gst);
      this.myForm.get('product_time').setValue(this.data.time);
      this.autocomplete()
      this.loadProductData(this.apiservice.shop_id)
      this.isproductAdd  = true;
     }
     else if(this.action == "Delete")
     {
      this.product_id = this.data.id
     }
     else if(this.action == "Add")
     {
      this.autocomplete()
      this.loadProductData(this.apiservice.shop_id)
     }
   
  }

  loadProductData(shop_id) {
    this.form_status = true
    if(this.bulk_no != '')
    var allMenuURL = this.apiservice.serverBulkProductsURL+"?sid="+shop_id
    else var allMenuURL = this.apiservice.serverProductsURL+"?sid="+shop_id
    this.httpClient.get(allMenuURL).subscribe(data => {
      console.log(data['products'])
      if(data['products'] != null)
      {
        this.products_data = data['products'];
        if(this.products_data != null)
        {
          for (let i = 0; i < this.products_data.length; i++) {
            this.product_options.push(this.products_data[i]['p_name']);
          }
        }
        this.product_options = Array.from(new Set(this.product_options));
        // console.log(this.product_options)
      }
      else{
        this.toastr.error("No Data Found");
      }
      this.form_status = false
      },
      error => {
        this.toastr.error("Check Intenet");
        // alert("Check Internet")
      });
  }


  autocomplete() {
    this.filteredOptions = this.productControl.valueChanges.pipe(
      startWith(''),
      map(val => this.filter1(val))
    );
  }

  private filter1(val: any): any[] {
    return this.product_options.filter(option => option.toLowerCase().includes(val.toLowerCase()));
  }

  onSelectionChanged(value) {
    this.isproductAdd  = true;
    console.log(value)
    this.product_name = value;
    this.productControl.setValue(value)
    for (let i = 0; i < this.products_data.length; i++) {
      if(this.products_data[i]['p_name'] == value)
      {
        this.product_id = this.products_data[i]['id']
        this.myForm.get('product_price').setValue(this.products_data[i]['rate']);
        this.myForm.get('product_gst').setValue(this.products_data[i]['gst']);
        this.myForm.get('product_time').setValue(this.products_data[i]['time']);
        this.field_values = []
        if(this.products_data[i]['sub_name'].length != 0)
        {
          for(let j = 0; j < this.products_data[i]['sub_name'].length; j++)
          {
            this.field_values.push(this.products_data[i]['sub_name'][j]['name'])
          }
        }
      }
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.field_values, event.previousIndex, event.currentIndex);
  }

  filter(name: string) {
    return this.field_values.filter(field => field.toLowerCase().includes(name.toLowerCase()));
  }

  onTextChange(event) {
    this.isproductAdd  = false;
    this.product_name = event;
    // this.productControl.setValue(event);
  }

  remove(i: any): void {
    const index = this.field_values.indexOf(i);
    if (index >= 0) {
      this.field_values.splice(index, 1);
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
    this.subProductCtrl.setValue(null);
  }

  doAction(){
    var mode = ''
    if(this.action == "Add") mode = "add"
    else if(this.action == "Update") mode = "edit"
    // console.log(this.myForm.value)
    if(this.action == "Add" || this.action == "Update")
    {
      if(this.isproductAdd)
      {
        // console.log(this.myForm.value.product_price)
        if(this.myForm.value.product_price == null)
        {
          this.toastr.error("Enter Product Price")
        }
        else{
          if(this.myForm.value.product_quantity == '')
          {
            this.toastr.error("Enter Product Quantity")
          }
          else{
            this.parameters = {old_id:this.data.id,id:this.product_id,product:this.product_name,sub_products:this.field_values,details:this.myForm.value}
            this.dialogRef.close({event:this.action,data:this.parameters});
          }
        }
      }
      else{
        if(this.myForm.value.product_price == null)
        {
          this.toastr.error("Enter Product Price")
        }
        else{
          if(this.myForm.value.product_quantity == '')
          {
            this.toastr.error("Enter Product Quantity")
          }
          else{
            if(this.bulk_no != '')
            {
              this.toastr.error("Product Not Available")
            }
            else
            {
              let subproducts = this.field_values.join("$;")
              let parameters = {
                product_id:this.product_id,
                product_name: this.product_name,
                product_price: this.myForm.get('product_price').value,
                product_gst: this.myForm.get('product_gst').value,
                subproducts: subproducts,
                shop_id:this.apiservice.shop_id,
                mode:mode
              };
              // console.log(parameters)
              this.form_status = true
              this.httpClient.post(this.apiservice.serverProductURL,parameters)
                .subscribe(res => {
                  // console.log(res);
                  this.form_status = false
                  if(res['status'])
                  {
                    this.product_id = res['pro_id']
                    if(mode == 'add')
                    this.toastr.success("New Product Added")
                    this.parameters = {id:this.product_id,product:this.product_name,sub_products:this.field_values,details:this.myForm.value}
                    this.dialogRef.close({event:this.action,data:this.parameters});
                  }
                  else{
                    this.toastr.error(res['message']);
                  }
                })
            }
            // this.toastr.error("Choose Our Product")
          }
        }
      }
    }
    else{
      this.parameters = {id:this.product_id}
      this.dialogRef.close({event:this.action,data:this.parameters});
    }
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

}
