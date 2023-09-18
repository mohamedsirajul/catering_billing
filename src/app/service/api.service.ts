import { Injectable, Output, EventEmitter, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { tap, startWith, debounceTime, switchMap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as crypto from "crypto-js";
import { JwtHelperService } from '@auth0/angular-jwt';
import {Howl} from 'howler';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatSpinner } from '@angular/material/progress-spinner';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  redirectUrl = "/dashboard"
  public SUCCESS = "Success"
  public FAILURE = "Failure"
  key = "123"
  isLoggedIn = 'false'
  val = {};

  baseUrl: string = "https://api.srimadhuramcatering.in/";
  // baseUrl: string = "https://iconxtechnologies.in/business/app/madhuram_catering/";
  // baseUrl: string = "https://iconxtechnologies.in/business/app/madhuram1/";

  fileUrl: string = "https://shop.iconxtechnologies.in/";

  shopstatusurl = this.baseUrl + 'getshopstatus.php'
  dashboardURL = this.baseUrl + 'dashboard.php'
  allorders = this.baseUrl + 'all_orders.php'
  generalreportURL = this.baseUrl + 'general_report.php'
  feedbackURL = this.baseUrl + 'feedback.php'
  queriesURL = this.baseUrl + 'queries.php'
  ordersrateURL = this.baseUrl + 'orders_rating.php'
  deliveryrateURL = this.baseUrl + 'delivery_rating.php'

  areaURL = this.baseUrl + 'arealist.php'
  distanceURL = this.baseUrl + 'distancelist.php'
  bannerURL = this.baseUrl + 'banner.php'
  catbannerURL = this.baseUrl + 'cat_banner.php'
  couponURL = this.baseUrl + 'coupon.php'
  categoryURL = this.baseUrl + 'category.php'
  deliveryURL = this.baseUrl + 'deliveryboy.php'
  alldeliveryURL = this.baseUrl + 'deliveryboy_all.php'
  allMenuURL = this.baseUrl + 'all_menu.php'
  subcategoryURL = this.baseUrl + 'subcategory.php'
  homesectionURL = this.baseUrl + "home_section.php"
  userURL = this.baseUrl + 'user_list.php'
  ptypeURL = this.baseUrl + 'pay_list.php'
  payhistoryURL = this.baseUrl + 'payment_history.php'
  payhistory1URL = this.baseUrl + 'payment_history1.php'
  notificationURL = this.baseUrl + 'notification.php'

  serverAreaURL = this.baseUrl + 'new_area.php'
  serverDistanceURL = this.baseUrl + 'new_distance.php'
  serverBannerURL = this.baseUrl + 'new_banner.php'
  serverCatBannerURL = this.baseUrl + 'new_cat_banner.php'
  serverCategoryURL = this.baseUrl + 'new_category.php'
  serverCouponURL = this.baseUrl + 'new_coupon.php'
  serverDeliveryURL = this.baseUrl + 'new_delivery.php'

  serverSubcategoryURL = this.baseUrl + 'new_subcategory.php'
  serverHomeURL = this.baseUrl + 'new_home_section.php'
  serveroverviewURL = this.baseUrl + 'overview_update.php'
  serverbankURL = this.baseUrl + 'update_bank_details.php'
  serverNotificationURL = this.baseUrl + 'new_notification.php'

  bookingURL = this.baseUrl + 'all_bookings.php'
  estimateURL = this.baseUrl + 'all_estimates.php'
  invoicesURL = this.baseUrl + 'all_invoices.php'
  customerURL = this.baseUrl + 'all_customers.php'

  usersURL = this.baseUrl + 'all_users.php'

  EstimateProductURL = this.baseUrl + 'estimate_product_details.php'

  getBookingNumberURL = this.baseUrl + 'get_booking_number.php'
  getEstimateNumberURL = this.baseUrl + 'get_estimate_number.php'
  getInvoiceNumberURL = this.baseUrl + 'get_invoice_number.php'

  getBookingDetailsURL = this.baseUrl + 'get_booking_details.php'
  getEstimateDetailsURL = this.baseUrl + 'get_estimate_details.php'
  getInvoiceDetailsURL = this.baseUrl + 'get_invoice_details.php'

  converttoInvoiceURL = this.baseUrl + 'convert_invoice.php'
  markasPaidURL = this.baseUrl + 'mark_as_paid_invoice.php'

  serverinvoicePaymentURL = this.baseUrl + 'invoice_payment_details.php'
  serverestimatePaymentURL = this.baseUrl + 'estimate_payment_details.php'

  customerReportPaymentURL = this.baseUrl + 'customer_report.php'

  EstimateCreateURL = this.baseUrl + 'estimate_create.php'

  serverBookingURL = this.baseUrl + 'new_booking.php'
  serverPaymentAddURL = this.baseUrl + 'new_payment.php'
  serverEstimateURL = this.baseUrl + 'new_estimate.php'
  serverInvoiceURL = this.baseUrl + 'new_invoice.php'
  serverProductURL = this.baseUrl + 'new_product.php'
  serverBulkProductURL = this.baseUrl + 'new_bulk_product.php'
  serverVesselURL = this.baseUrl + 'new_vessel.php'
  serverUserURL = this.baseUrl + 'new_user.php'
  serversettingsURL = this.baseUrl + 'settings_update.php'
  serverpasswordChangeURL = this.baseUrl + 'password_change.php'
  serverProductsURL = this.baseUrl + 'product_details.php'
  serverBulkProductsURL = this.baseUrl + 'bulk_product_details.php'
  serverPaymentURL = this.baseUrl + 'payment_details.php'
  serverVesselsURL = this.baseUrl + 'vessel_details.php'

  // homeURL = "http://localhost:4200/#/";
  // homeURL = "https://madhuram.iconxtechnologies.in/#/";
  homeURL = "https://billing.srimadhuramcatering.in/#/";

  @Output() getLoggedInName: EventEmitter<any> = new EventEmitter();
  userid: any;
  username: any;
  mobile: any;
  static titlevalue: any
  shop_logo: any;
  shop_code: any;
  shop_id: any;
  status: any;
  shop_name: any;
  shop_status: any;

  role: any;
  
  url_city:any;
  url_cat:any;

  private overlayRef: OverlayRef;

  constructor(private httpClient: HttpClient, 
    public router: Router,
    public jwtHelper: JwtHelperService,
    private overlay: Overlay,) {
  }

  openSpinner() {
    // Create an overlay and attach it to the body
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'dark-backdrop',
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
    });
  
    // Create a portal and attach the spinner to it
    const spinnerPortal = new ComponentPortal(MatSpinner);
    const spinnerRef = this.overlayRef.attach(spinnerPortal);
  }

  closeSpinner() {
    this.overlayRef.dispose();
  }

  public BaseLogin(url, username, password) {
    return this.httpClient.post<any>(this.baseUrl + url, { username, password })
      .pipe(map(Users => {
        return Users;
      }));
  }

  public PostToServer(url,value) {
    return this.httpClient.post<any>(this.baseUrl + url, { value })
      .pipe(map(Users => {
        return Users;
      }));
  }

  public PostToServer1(url,value,status) {
    return this.httpClient.post<any>(this.baseUrl + url, { value,status })
      .pipe(map(Users => {
        return Users;
      }));
  }

  public PostToServer2(url,value,admin,status) {
    return this.httpClient.post<any>(this.baseUrl + url, { value,admin,status })
      .pipe(map(Users => {
        return Users;
      }));
  }

  public SessionExpired() {
    // alert("Session Expired")
    localStorage.setItem('User_isLoggedIn', "false");
    localStorage.setItem('User_token', '0');
    this.router.navigate(['/auth/login']);
  }

  userLogout() {
    let url: string = '';
    if (!/^http[s]?:\/\//.test(this.homeURL)) {
      url += 'http://';
    }
    url += this.homeURL;
    window.location.href = url;
    this.deleteToken()
    this.deleteCookie("User_token")
    this.deleteIsLoggedIn()
    setTimeout(
      function(){ 
      location.reload(); 
      }, 1000);
  }

  //set User token in Localstroage
  setToken(token: string) {
    localStorage.setItem('User_token', token);
    this.setCookie("User_token",token)
    //  this.deleteCookie("User_token")
  }

  setIsLoggedIn(isLoggedIn: string) {
    localStorage.setItem('User_isLoggedIn', isLoggedIn);
  }

  // get user token from localstorage
  getToken() {
    if (localStorage.getItem('User_token') != "0") {
      return localStorage.getItem('User_token');
    }
    return "0";
  }
  getIsLoggedIn() {
    return localStorage.getItem('User_isLoggedIn');
  }

  // remove user token from localstorage
  deleteToken() {
    localStorage.setItem('User_token', "0");
  }

  deleteIsLoggedIn() {
    localStorage.setItem('User_isLoggedIn', "false");
  }

  setCookie(name: string, val: string) {
    const date = new Date();
    const value = val;
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
    // this is server cookie storage
    // document.cookie = name + "=" + value + "; domain= .iconxtechnologies.in ; expires=" + date.toUTCString() + ";path=/";
    // this is localhost cookie storage
    document.cookie = name+"="+value+"; expires="+date.toUTCString() + ";path=/";
  }

  getCookie(name: string) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length == 2) {
        return parts.pop().split(";").shift();
    }
  }

  deleteCookie(name: string) {
    document.cookie =  name+"=;" + 'path=/; expires=' + new Date(0).toUTCString();
  }

  public isAuthenticated(): boolean {
    if(this.getToken() != "0" && this.getCookie("User_token") != null)
    {
      var server_token = this.getCookie("User_token")
      var token = server_token.split(".", 3);
      var header = token[0]
      var payload = token[1]
      var signature = token[2]
      var header_payload = header + "." + payload
      var en_sign = crypto.HmacSHA256(header_payload,"madhuram_catering")
      var de_sign = crypto.enc.Base64.stringify(en_sign)
      var new_signature = this.removeillegalcharacters(de_sign)
      // console.log(new_signature)
      // console.log(signature)
      if(new_signature == signature)
      {
        const decodedToken = this.jwtHelper.decodeToken(server_token);
        const isExpired = this.jwtHelper.isTokenExpired(server_token);
        this.userid = decodedToken["user_details"]["id"]
        this.username = decodedToken["user_details"]["name"]
        this.shop_name = decodedToken["user_details"]["shop_name"]
        this.mobile = decodedToken["user_details"]["mobile"]
        this.shop_id = decodedToken["user_details"]["shop_id"]
        this.status = decodedToken["user_details"]["status"]
        this.role = decodedToken["user_details"]["role"]
        this.shop_logo = decodedToken["user_details"]["shop_logo"]
        // console.log(decodedToken)
        if(isExpired)
        { 
          this.userLogout()
          this.deleteToken()
          this.deleteIsLoggedIn()
          // alert("JWT Session Expired")
        }
        // return true
        return !isExpired;
      }
    }
    return false
  }

  removeillegalcharacters(token: string)
  {
  return token.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  }

  changedate(old_date) {
    var date = old_date.split('/');
    return date[1] + '/' + date[0] + '/' + date[2];
  }

  changetime(old_time) {
    var time = old_time.split(':');
    var newtime;
    if (Number(time[0]) >= 12) {
      if (Number(time[0]) == 12) {
        newtime = '12' + ':' + time[1] + ' pm';
      } else {
        time[0] = Number(time[0]) - 12;
        newtime = time[0] + ':' + time[1] + ' pm';
      }
    } else {
      if (time[0] == '00') {
        newtime = '00' + ':' + time[1] + ' am';
      } else {
        newtime = time[0] + ':' + time[1] + ' am';
      }
    }
    return newtime;
  }

  changeDateTime(old_date)
  {
    let new_date,newtime;
    var datee = old_date.split(' ');
    var date = datee[0]
    var time = datee[1]
    date = date.split('-');
    new_date = date[2] + '/' + date[1] + '/' + date[0];
    var time = time.split(':');
    if (Number(time[0]) >= 12) {
      if (Number(time[0]) == 12) {
        newtime = '12' + ':' + time[1] + ' pm';
      } else {
        time[0] = Number(time[0]) - 12;
        newtime = time[0] + ':' + time[1] + ' pm';
      }
    } else {
      if (time[0] == '00') {
        newtime = '00' + ':' + time[1] + ' am';
      } else {
        newtime = time[0] + ':' + time[1] + ' am';
      }
    }
    return new_date +" "+newtime;
  }

}
