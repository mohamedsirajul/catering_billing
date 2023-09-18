//dialog-box.component.ts
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

export interface VesselData {
  id: number;
  name: string;
}

@Component({
  selector: 'app-vessel-dialog-box',
  templateUrl: './vessel-dialog-box.component.html',

})
export class VesselDialogBoxComponent {
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
  vessel_name: any;
  parameters: any;
  vessel_id: any;
  isproductAdd: boolean;
  form_status: boolean;

  constructor(
    public dialogRef: MatDialogRef<VesselDialogBoxComponent>,
    public httpClient: HttpClient,
    private apiservice: ApiService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: VesselData) {
      // console.log(data)
      this.local_data = {...data};
      this.action = this.local_data.action;
  }

  myForm = new FormGroup({
    vessel_name: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
     if(this.action == "Update")
     {
      this.vessel_id = this.data.id
      this.myForm.get('vessel_name').setValue(this.data.name);
     }
     else if(this.action == "Delete")
     {
      this.vessel_id = this.data.id
     }
  }

  doAction(){
    // console.log(this.myForm.value)
    if(this.action == "Add" || this.action == "Update")
    {
      if(this.myForm.value.vessel_name == '')
      {
        this.toastr.error("Enter Vessel Name")
      }
      else{
          this.parameters = {id:this.vessel_id,details:this.myForm.value}
          this.dialogRef.close({event:this.action,data:this.parameters});
      }
    }
    else{
      this.parameters = {id:this.vessel_id}
      this.dialogRef.close({event:this.action,data:this.parameters});
    }
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

}
