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
  gst: number;
  qty:number;
  total:number;
}

@Component({
  selector: 'app-new-dialog-box',
  templateUrl: './new-dialog-box.component.html',
  styleUrls: ['./new-dialog-box.component.scss']
})
export class NewDialogBoxComponent implements OnInit {

  action:string;
  local_data:any;

  products_data: any = [];
  sub_products_data: any = [];

  addOnBlur: boolean = false;
  separatorKeysCodes = [ENTER, COMMA];
  
  productControl: FormControl = new FormControl();

  product_options: string[] = [];

  removable: boolean = true;

  sub_pros = []
  filteredValues: Observable<any[]>;
  filteredOptions: Observable<any[]>;
  subProductCtrl = new FormControl();
  field_values: any[] = [];
  product_name: any;
  parameters: any;
  product_id: any;
  isproductAdd: boolean;
  form_status: boolean;

  gst_list = [
    {value:"0",view_value:"0 %"},
    {value:"5",view_value:"5 %"},
    {value:"12",view_value:"12 %"},
    {value:"18",view_value:"18 %"},
  ]

  constructor(
    public dialogRef: MatDialogRef<NewDialogBoxComponent>,
    public httpClient: HttpClient,
    private apiservice: ApiService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ProductData) {
      // console.log(data)
      this.local_data = {...data};
      this.action = this.local_data.action;
  }

  myForm = new FormGroup({
    product_name: new FormControl('', [Validators.required]),
    product_price: new FormControl('', [Validators.required]),
    product_gst: new FormControl('', [Validators.required]),
  });

  
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.field_values, event.previousIndex, event.currentIndex);
  }

  ngOnInit(): void {
     if(this.action == "Update")
     {
      this.product_id = this.data.id
      for(let i=0;i<this.data.sub_name.length;i++)
      {
        this.sub_pros.push(this.data.sub_name[i]['name'])
      }
      // console.log(this.sub_pros.toString())
      this.field_values = this.sub_pros.toString().split(',')
      this.myForm.get('product_name').setValue(this.data.p_name);
      this.myForm.get('product_price').setValue(this.data.rate);
      this.myForm.get('product_gst').setValue(this.data.gst);
     }
     else if(this.action == "Delete")
     {
      this.product_id = this.data.id
     }
  }

  loadProductData(shop_id) {
    this.form_status = true
    var allMenuURL = this.apiservice.serverProductsURL+"?sid="+shop_id
    this.httpClient.get(allMenuURL).subscribe(data => {
      // console.log(data['products'])
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
    // console.log(this.field_values)
    if(this.action == "Add" || this.action == "Update")
    {
      if(this.myForm.value.product_name == '')
      {
        this.toastr.error("Enter Product Name")
      }
      else{
        if(this.myForm.value.product_price == '')
        {
          this.toastr.error("Enter Product Price")
        }
        else
        {
          if(this.myForm.value.product_gst == '')
          {
            this.toastr.error("Choose Product GST")
          }
          else
          { 
            // if(this.field_values.length > 0)
            // {
              this.parameters = {id:this.product_id,sub_products:this.field_values,details:this.myForm.value}
              this.dialogRef.close({event:this.action,data:this.parameters});
            // }
            // else{
            //   this.toastr.error("Add Some Sub Products")
            // }
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
