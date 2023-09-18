import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { ApiService } from 'app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  form_status = true;
  bank_status = false;
  shopstatus: string;
  shop_status = false
  val = 0;

  // Details Layout
  form1 = new FormGroup({});
  model1: any = {};
  shop_details: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'row',
      fieldGroup: [
        {
          className: 'col-sm-4',
          type: 'input',
          key: 'shop_name',
          templateOptions: {
            label: 'Shop Name',
          }
        },
        {
          className: 'col-sm-4',
          type: 'input',
          key: 'gst_no',
          templateOptions: {
            label: 'GST No',
          }
        },{
          className: 'col-sm-4',
          type: 'input',
          key: 'fssai_no',
          templateOptions: {
            label: 'FSSAI No',
          }
        }
      ],
    },
    {
      fieldGroupClassName: 'row',
      fieldGroup: [
        {
          className: 'col-sm-3',
          type: 'input',
          key: 'address1',
          templateOptions: {
            type: 'text',
            label: 'Address 1',
          }
        },
        {
          className: 'col-sm-3',
          type: 'input',
          key: 'address2',
          templateOptions: {
            label: 'Address 2',
            type: 'text',
          }
        },
        {
          className: 'col-sm-3',
          type: 'input',
          key: 'city',
          templateOptions: {
            type: 'text',
            label: 'City',
          }
        },
        {
          className: 'col-sm-3',
          type: 'input',
          key: 'pin_code',
          templateOptions: {
            type: 'text',
            label: 'Pin Code',
          }
        },
       
      ],
    },
    {
      fieldGroupClassName: 'row',
      fieldGroup: [
        {
          className: 'col-sm-6',
          type: 'textarea',
          key: 'contact',
          templateOptions: {
            label: 'Contact No'
          },
        },
        {
          className: 'col-sm-6',
          type: 'textarea',
          key: 'message_note',
          templateOptions: {
            label: 'Message Note'
          },
        },
      ],
    }
  ];

  // Password Layout
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'row',
      fieldGroup: [
        {
          className: 'col-sm-4',
          key: 'oldpassword',
          type: 'input',
          templateOptions: {
            type: 'password',
            label: 'Current Paassword',
            required: true,
          },
        },
        {
          className: 'col-sm-4',
          key: 'newpassword',
          type: 'input',
          templateOptions: {
            type: 'password',
            label: 'New Password',
            required: true,
          },
        },
        {
          className: 'col-sm-4',
          key: 'confirmpassword',
          type: 'input',
          templateOptions: {
            type: 'password',
            label: 'Confirm New Password',
            required: true,
          },
        },
      ],
    },
  ];

  // Bank Layout
  form2 = new FormGroup({});
  model2: any = {};
  fields2: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'row',
      fieldGroup: [
        {
          className: 'col-sm-4',
          type: 'input',
          key: 'account_holder_name',
          templateOptions: {
            label: 'Account Holder Name',
          },
          expressionProperties: {
            'templateOptions.disabled': 'this.bank_status',
          },
        },
        {
          className: 'col-sm-4',
          type: 'input',
          key: 'account_no',
          templateOptions: {
            type: 'number',
            label: 'Bank Account No',
          },
          expressionProperties: {
            'templateOptions.disabled': 'this.bank_status',
          },
        },
        {
          className: 'col-sm-4',
          type: 'input',
          key: 'ifsc_code',
          templateOptions: {
            label: 'IFSC Code',
          },
          expressionProperties: {
            'templateOptions.disabled': 'this.bank_status',
          },
        },
      ],
    },
    {
      fieldGroupClassName: 'row',
      fieldGroup: [
        {
          className: 'col-sm-6',
          type: 'input',
          key: 'bank_name',
          templateOptions: {
            type: 'text',
            label: 'Bank Name'
          },
          expressionProperties: {
            'templateOptions.disabled': 'this.bank_status',
          },
        },
        {
          className: 'col-sm-6',
          type: 'input',
          key: 'branch_name',
          templateOptions: {
            type: 'text',
            label: 'Branch Name'
          },
          expressionProperties: {
            'templateOptions.disabled': 'this.bank_status',
          },
        },
      ],
    }
  ];

  options: FormlyFormOptions = {};

  parameters: {};
  constructor(
    private apiservice: ApiService,
    private httpClient: HttpClient,
    public router: Router,
    private toastr: ToastrService
  ) {}

  datt: any;

  ngOnInit() {
    this.getalldata(this.apiservice.shop_id);
  }


  getalldata(shop_id) {
    this.form_status = true;
    this.apiservice.openSpinner()
    var appOverviewUrl = "app_overview.php?sid="+shop_id
    this.apiservice
      .PostToServer(appOverviewUrl, '2')
      .pipe(first())
      .subscribe(data => {
        // console.log(data);
        this.form_status = false;
        this.AssignData(data);
        this.apiservice.closeSpinner()
      });
  }

  AssignData(data) {

    this.form1.get('shop_name').setValue(data['shop_details']['shop_name']);
    this.form1.get('gst_no').setValue(data['shop_details']['gst_no']);
    this.form1.get('fssai_no').setValue(data['shop_details']['fssai_no']);
    this.form1.get('address1').setValue(data['shop_details']['address1']);
    this.form1.get('address2').setValue(data['shop_details']['address2']);
    this.form1.get('city').setValue(data['shop_details']['city']);
    this.form1.get('pin_code').setValue(data['shop_details']['pin_code']);
    this.form1.get('message_note').setValue(data['shop_details']['message_note']);
    this.form1.get('contact').setValue(data['shop_details']['contact']);

    this.form2.get('account_holder_name').setValue(data['shop_details']['account_holder_name']);
    this.form2.get('account_no').setValue(data['shop_details']['account_no']);
    this.form2.get('ifsc_code').setValue(data['shop_details']['ifsc_code']);
    this.form2.get('bank_name').setValue(data['shop_details']['bank_name']);
    this.form2.get('branch_name').setValue(data['shop_details']['branch_name']);

  }

  update_notes()
  {
    if (
      this.model1['shop_name'] != null && this.model1['gst_no'] != null && this.model1['fssai_no'] != null && this.model1['address1'] != null
      && this.model1['address2'] != null && this.model1['city'] != null && this.model1['pin_code'] != null && this.model1['message_note'] != null && this.model1['contact'] != null
    ) {
      if (
        this.model1['shop_name'].length != 0 && this.model1['gst_no'].length != 0 && this.model1['fssai_no'].length != 0 && this.model1['address1'].length != 0
        && this.model1['address2'].length != 0 && this.model1['city'].length != 0 && this.model1['pin_code'].length != 0 && this.model1['message_note'].length != 0 && this.model1['contact'].length != 0
      ) {
        this.parameters = { 
          form_value: this.model1,
          shop_id:this.apiservice.shop_id,
          mode:"0"
        };
        // console.log(this.parameters);
        this.apiservice.openSpinner()
        this.form_status = true;
        this.httpClient.post(this.apiservice.serversettingsURL, this.parameters).subscribe(
          res => {
            this.form_status = false;
            if (res['status']) {
              this.toastr.success(res['message']);
              setTimeout(
                function(){ 
                location.reload(); 
                }, 2000);
            } else {
              this.toastr.error(res['message']);
            }
            this.apiservice.closeSpinner()
          },
          error => {
            this.toastr.error('Check Internet');
            this.apiservice.closeSpinner()
          }
        );
      } else {
        this.toastr.error('Complete All Details');
      }
    } else {
      this.toastr.error('Complete All Details');
    }
  }

  update_bank()
  {
    if (
      this.model2['account_holder_name'] != null && this.model2['account_no'] != null && this.model2['ifsc_code'] != null && this.model2['bank_name'] != null
      && this.model2['branch_name'] != null
    ) {
      if (
        this.model2['account_holder_name'].length != 0 && this.model2['account_no'].length != 0 && this.model2['ifsc_code'].length != 0 && this.model2['bank_name'].length != 0
        && this.model2['branch_name'].length != 0
      ) {
        this.parameters = { form_value: this.model2,
          shop_id:this.apiservice.shop_id,
          mode:"1"
        };
        // console.log(this.parameters);
        this.form_status = true;
        this.apiservice.openSpinner()
        this.httpClient.post(this.apiservice.serversettingsURL, this.parameters).subscribe(
          res => {
            this.form_status = false;
            if (res['status']) {
              this.toastr.success(res['message']);
              setTimeout(
                function(){ 
                location.reload(); 
                }, 2000);
            } else {
              this.toastr.error(res['message']);
            }
            this.apiservice.closeSpinner()
          },
          error => {
            this.toastr.error('Check Internet');
            this.apiservice.closeSpinner()
          }
        );
      } else {
        this.toastr.error('Complete All Details');
      }
    } else {
      this.toastr.error('Complete All Details');
    }
  }

  changePassword() {
    if (
      this.model['newpassword'] != null &&
      this.model['confirmpassword'] != null &&
      this.model['oldpassword'] != null
    ) {
      if (
        this.model['newpassword'].length != 0 &&
        this.model['confirmpassword'].length != 0 &&
        this.model['oldpassword'].length != 0
      ) {
        if (this.model['newpassword'] == this.model['confirmpassword']) {
          this.parameters = { form_value: this.model ,
             shop_id:this.apiservice.shop_id,
              mobile:this.apiservice.mobile };
          // console.log(this.parameters);
          this.form_status = true
          this.apiservice.openSpinner()
            this.httpClient.post(this.apiservice.serverpasswordChangeURL, this.parameters)
              .subscribe(res => {
                this.form_status = false
                if(res['status'])
                {
                  this.toastr.success(res['message']);
                  this.form.get('newpassword').setValue('')
                  this.form.get('confirmpassword').setValue('')
                  this.form.get('oldpassword').setValue('')
                }
                else{
                  this.toastr.error(res['message']);
                }
                this.apiservice.closeSpinner()
              },
              error => {
                this.toastr.error("Check Internet");
                this.apiservice.closeSpinner()
              })
        } else {
          this.toastr.error('Password Mismatch');
        }
      } else {
        this.toastr.error('Complete all Details');
      }
    } else {
      this.toastr.error('Complete all Details');
    }
  }

  showToast(obj: any) {
    this.toastr.success(JSON.stringify(obj));
  }
}
