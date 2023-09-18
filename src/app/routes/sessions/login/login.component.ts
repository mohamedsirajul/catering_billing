import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  redirectUrl = '/dashboard';
  reactiveForm: FormGroup;
  form_status = true;

  year = new Date().getFullYear(); 
  
  constructor(private fb: FormBuilder, private router: Router, private apiservice: ApiService, private toastr: ToastrService) {
    this.reactiveForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.form_status = false;
    if (this.apiservice.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.apiservice.SessionExpired();
    }
  }

  postdata(formdata) {
    this.form_status = true;
    // console.log(this.reactiveForm)
    this.apiservice
      .BaseLogin('mainlogin.php', formdata.value.username, formdata.value.password)
      .pipe(first())
      .subscribe(data => {
        // console.log(data);
        this.form_status = false;
        if (data['status'] === this.apiservice.SUCCESS) {
          this.toastr.success(data['message']);
          // alert(data['message']);
          this.apiservice.setToken(data['token']);
          this.apiservice.setIsLoggedIn('true');
          // console.log(redirect);
          const redirect = this.redirectUrl ? this.redirectUrl : '/dashboard';
          this.router.navigateByUrl(redirect);
        }
        if (data['status'] === this.apiservice.FAILURE) {
          this.toastr.error(data['message']);
          // alert(data['message']);
        }
      });
    // this.router.navigateByUrl('/');
  }

  // login() {
  //   this.apiservice.BaseLogin('/mainlogin.php',"test@gmail.com", "1234")
  //   .pipe(first())
  //   .subscribe(
  //       data => {
  //         console.log(data)
  //           if (data["status"] === this.apiservice.SUCCESS) {
  //               alert(data["message"])
  //               this.apiservice.setToken(data["token"]);
  //               this.apiservice.setIsLoggedIn("true")
  //                 const redirect = this.redirectUrl ? this.redirectUrl : '/dashboard';
  //                 console.log(redirect)
  //                 this.router.navigateByUrl(redirect);
  //           }
  //           if (data["status"] === this.apiservice.FAILURE) {
  //               alert(data["message"])
  //           }
  //       })
  //   this.router.navigateByUrl('/');
  // }
}
