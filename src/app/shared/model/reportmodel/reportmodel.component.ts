import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  OnInit,
  AfterViewInit,
  ViewChild,
  Component,
  Input,
  OnChanges,
  DoCheck,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import * as moment from 'moment';

@Component({
  selector: 'app-reportmodel',
  templateUrl: './reportmodel.component.html',
  styleUrls: ['./reportmodel.component.scss'],
})
export class ReportmodelComponent implements OnInit, OnChanges {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // AllTableData: Labourreport[] = [];


  selectedColumns = [];
  date = '';
  displayName;
  serverName = [];
  DateBool: any;
  SelectBool: any;

  @Input() AllColumns: any;
  @Input() Dates: any;
  @Input() data = [];

  user_display_id = '0';
  // form_status = true;
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
  sColumns = [];
  i: any;
  userid = '1'
  dataSource = new MatTableDataSource();

  constructor(
    public httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.user_display_id = this.userid;
    this.fillfiltervalues();
    this.fillfilterform();
    this.formSubscribe();
    // this.getFormsValue();

  }

  ngOnChanges(changes: SimpleChanges) {
    this.dataSource.data = changes.data.currentValue;
    this.addSerialNo();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loadToppingfromlink();
    this.serverName = this.AllColumns.map((c) => c.name);

  }

  checkdata() {
    // console.log(this.data)
    if (this.data.length != null && this.data.length != 0) {
      return false
    }
    else {
      return true
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    // filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  loadToppingfromlink() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (!params.Filtercolumn) {
        return;
      }
      this.toppingsControl.setValue(params.Filtercolumn);
      this.filterForm.get('id').setValue(params.FilterValues);
      // console.log(this.filterForm.get('id').value);
    });
  }

  checkdate(x: string) {
    if (this.Dates.includes(x)) {
      return true;
    }
  }

  exporttoExcelTable() {
    // TableUtil.exportTableToExcel('ExampleTable');
  }

  addSerialNo() {
    if(this.data != null)
    {
      for (let i = 0; i < this.data.length; i++) {
        this.data[i].sl_no = i + 1;
        for (let j = 0; j < this.Dates.length; j++) {
          this.data[i][this.Dates[j]] = this.changeDateFormat(
            this.data[i][this.Dates[j]]
          );
        }
      }
    }
  }

  fillfiltervalues() {
    if (this.AllColumns.length !== 0) {
      for (let i = 0; i < this.AllColumns.length; i++) {
        this.filterValues[this.AllColumns[i].name] = [];
      }
    }
  }

  fillfilterform() {
    for (let i = 0; i < this.AllColumns.length; i++) {
      this.filterForm.controls[this.AllColumns[i].name] = new FormControl();
    }
  }

  getUniqueValues(val: string | number) {
    const templist = this.dataSource.data.map((x) => x[val]);
    const uniqueArray = Array.from(new Set(templist));
    return uniqueArray;
  }

  valueChanged(newcontrol: { value: any[] }) {
    const oldselected = this.selectedColumns;
    this.selectedColumns = newcontrol.value;
    const removal = oldselected
      .filter((x) => !this.selectedColumns.includes(x))
      .concat(this.selectedColumns.filter((x) => !oldselected.includes(x)));
    this.reset(removal);
    this.removesColumns(newcontrol);
  }

  onParentToppingRemoved(
    topping: any,
    newcontrol: { value: any; setValue: (arg0: any) => void }
  ) {
    for (let i = 0; i < this.AllColumns.length; i++) {
      if (topping === this.AllColumns[i].name) {
        this.reset(topping);
      }
    }

    const toppings = newcontrol.value;
    this.removeFirst(toppings, topping);
    newcontrol.setValue(toppings);
    this.removesColumns(newcontrol);
  }

  onChildToppingRemoved(
    topping: any,
    newcontrol: { value: any; setValue: (arg0: any) => void }
  ) {
    for (let i = 0; i < this.AllColumns.length; i++) {
      if (topping === this.AllColumns[i].name) {
        this.reset(topping);
      }
    }
    const toppings = newcontrol.value;
    this.removeFirst(toppings, topping);
    newcontrol.setValue(toppings);
  }

  removesColumns(newcontrol) {
    let dName;
    this.sColumns = [];
    for (let i = 0; i < newcontrol.value.length; i++) {
      for (let j = 0; j < this.AllColumns.length; j++) {
        if (this.AllColumns[j].name === newcontrol.value[i]) {
          dName = this.AllColumns[j].displayname;
        }
      }
      this.sColumns.push({ Name: newcontrol.value[i], displayName: dName });
    }
  }

  consoleloghtml(x: any) {
    // console.log(x);
  }

  reset(topping) {
    this.filterForm.get(topping).reset([]);
  }

  private removeFirst<T>(array, toRemove): void {
    const index = array.indexOf(toRemove);
    // console.log(index)
    if (index !== -1) {
      array.splice(index, 1);
    }
  }

  formSubscribe() {
    // console.log("hi")
    for (let i = 0; i < this.serverName.length; i++) {
      this.filterForm.get([this.serverName[i]]).valueChanges.subscribe((x) => {
        this.filterValues[this.serverName[i]] = x;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        // console.log(JSON.stringify(this.filterValues))
      });

    }
  }

  getFormsValue() {
    this.dataSource.filterPredicate = (data, filter: string): boolean => {
      const bool = [];
      const searchString = JSON.parse(filter);
      for (let i = 0; i < this.serverName.length; i++) {
        bool.push(false);
      }
      for (const key in searchString) {
        for (let i = 0; i < this.serverName.length; i++) {
          if (key == this.serverName[i]) {
            // Checking if Field is a Date
            if (this.Dates.includes(key)) {
              let starttime: string | number | Date,
                time: string | number | Date,
                endtime: string | number | Date;
              if (searchString[key].length != 0) {
                const offset = new Date().getTimezoneOffset();
                starttime = moment(searchString[key].begin)
                  .add(offset, 'm')
                  .add(-1, 's')
                  .toDate();
                time = moment(data[key], 'DD/MM/YYYY').toDate();
                endtime = moment(searchString[key].end)
                  .add(offset, 'm')
                  .add(1, 's')
                  .toDate();
                // console.log(time);
                // console.log(data[key]);
              }

              if (
                searchString[key].length == 0 ||
                (searchString[key].length != 0 &&
                  starttime <= time &&
                  time <= endtime)
              ) {
                bool[i] = true;
              }
            } else if (
              searchString[key].length == 0 ||
              searchString[key].includes(data[key])
            ) {
              bool[i] = true;
            }
          }
        }
      }
      let boolvalue = true;
      for (let i = 0; i < bool.length; i++) {
        if (bool[i] == false) {
          boolvalue = false;
        }
      }
      return boolvalue;
    };
  }

  changeDateFormat(date: string | number | Date) {
    if (date === '0000-00-00 00:00:00') {
      return '';
    }
    const offset = new Date().getTimezoneOffset();
    const dt = new Date(date);
    dt.setMinutes(dt.getMinutes() - offset);
    // console.log(dt)
    const datee = moment(dt).format('DD/MM/YYYY');
    return datee;
  }
}
