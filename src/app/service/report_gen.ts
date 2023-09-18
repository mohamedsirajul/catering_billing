import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { ApiService } from './api.service';
import { log } from 'console';


pdfMake.vfs = pdfFonts.pdfMake.vfs;
const getFileName = (name: string) => {
  let timeSpan = new Date().toISOString();
  let sheetName = name || "ExportResult";
  let fileName = `${sheetName}-${timeSpan}`;
  return {
    sheetName,
    fileName
  };
};
@Injectable({
  providedIn: 'root'
})
export class GenReport {

  constructor(private http: HttpClient,private apiservice: ApiService,) { }

bookingReportPDF(data,title,row_head,row_width,from_date,to_date)
{
  let sales = 0, advance = 0, given = 0 , balance = 0

  for(let i = 0;i< data.length;i++)
  {
    sales = sales + parseFloat(data[i].rounded_total)
    advance = advance + parseFloat(data[i].advance)
    given = given + parseFloat(data[i].given)
    balance = balance + parseFloat(data[i].balance)
  }

  // console.log(data)
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  pdfMake.fonts = {
    Roboto: {
      normal: 'NotoSansTamil-Regular.ttf',
      bold: 'NotoSansTamil-Bold.ttf'
    }
  };

const documentDefinition = {
  content: [
    { text: this.apiservice.shop_name, style: 'mainheader' },
    { text: title, style: 'header', alignment:'center' },
    {
      canvas: [{
        "lineColor": "gray",
        "type": "line",
        "x1": 0,
        "y1": 0,
        "x2": 763,
        "y2": 0,
        "lineWidth": 1,
      },
    ],
    margin: [ 0, 5, 0, 5 ],
    },
    {
      columns: [
        [
          { text: `From Date : ${from_date}`,style: 'header1'},
        ],
        [
          { text: `To Date : ${to_date}`,style: 'subheader1', alignment: 'right'},
        ]
      ]
    },
    {
      canvas: [{
        "lineColor": "gray",
        "type": "line",
        "x1": 0,
        "y1": 0,
        "x2": 763,
        "y2": 0,
        "lineWidth": 1,
      },
    ],
    margin: [ 0, 5, 0, 5 ],
    },
    {
			style: 'tableExample',
			table: {
				headerRows: 1,
        widths: row_width ,
        body: [ row_head ,
          // ['S.No','Booking Date', 'Booking No', 'Name',  'Total','Advance','Given','Balance','Billed by'];
          ...data.map(report => [
              {text: report.s_no, style: 'subhead'},
              {text: report.booking_date, style: 'subhead'},
              {text: report.booking_no, style: 'subhead'},
              {text: report.created_by, style: 'subhead'},
              {text: report.cus_name, style: 'subhead'},
              {text: report.cus_mobile, style: 'subhead'},
              [{text:`${report.rounded_total}`, alignment: 'right',style: 'subhead'}],
              [{text:`${report.advance}`, alignment: 'right',style: 'subhead'}],
              // [{text:`${report.given}`, alignment: 'right',style: 'subhead'}],
              [{text:`${report.balance}`, alignment: 'right',style: 'subhead'}],
              {text: report.reference, style: 'subhead'},
              {text: report.paid_status, style: 'subhead'},
              {text: report.lap_days, style: 'subhead'}

          ])
        ],
        style: 'subheader',
			},
			layout: {
				// hLineWidth: function (i, node) {
				// 	return (i === 0 || i === node.table.body.length) ? 2 : 1;
				// },
				// vLineWidth: function (i, node) {
				// 	return (i === 0 || i === node.table.widths.length) ? 2 : 1;
				// },
				hLineColor: function (i, node) {
					return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
				},
				vLineColor: function (i, node) {
					return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
				},

				// hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
				// vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
				// paddingLeft: function(i, node) { return 4; },
				// paddingRight: function(i, node) { return 4; },
				// paddingTop: function(i, node) { return 2; },
				// paddingBottom: function(i, node) { return 2; },
				// fillColor: function (rowIndex, node, columnIndex) { return null; }
			}
		},
    { text: `Total Sales : ₹${parseFloat(sales.toString()).toFixed(2)}`, alignment: 'right' ,style: 'header'},
    { text: `Total Advance : ₹${parseFloat(advance.toString()).toFixed(2)}`, alignment: 'right' ,style: 'header'},
    // { text: `Total Given : ₹${parseFloat(given.toString()).toFixed(2)}`, alignment: 'right' ,style: 'header'},
    { text: `Total Balance : ₹${parseFloat(balance.toString()).toFixed(2)}`, alignment: 'right' ,style: 'header'},
    { text: "This is System Generated Report", style: 'subheadcenter' },
  ],
  styles: {
    tableExample: {
			margin: [0, 5, 0, 15]
		},
    mainheader: {
      fontSize: 16,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 5]
    },
    header: {
      fontSize: 12,
      bold: true,
      margin: [0, 0, 0, 5]
    },
    header1: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 1]
    },
    subheader: {
      fontSize: 7,
      margin: [0, 0, 0, 1]
    },
    subheader1: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 1]
    },
    subbody: {
      fontSize: 11,
      margin: [0, 0, 0, 2]
    },
    subhead: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 2]
    },
    subheadcenter: {
      fontSize: 8,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 2]
    },
    subhead1: {
      fontSize: 8,
      bold: true,
      alignment:'right',
      margin: [0, 0, 0, 2]
    }
  },
  background:{

  },
  pageOrientation: 'landscape', // Set the page orientation to portrait
  pageSize: 'A4', // Set the page size to A4
  pageBreakBefore: (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) => {
    return (currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0); // Add page break before first-level headings
  },
};

// Add an outline border to the PDF
documentDefinition.background = function(currentPage, pageSize) {
  return {
    canvas: [{
      type: 'rect',
      x: 20,
      y: 20,
      w: pageSize.width - 40,
      h: pageSize.height - 40,
      lineWidth: 1,
      lineColor: '#000'
    }]
  };
};
// Generate the PDF
// pdfMake.createPdf(documentDefinition).download('invoice.pdf');
// if(title=="view")
// {
  var win = window.open('', '_blank');
  pdfMake.createPdf(documentDefinition).open({}, win);
// }
  // pdfMake.createPdf(documentDefinition).open();
  // else if(title=="download") pdfMake.createPdf(documentDefinition).download(data.estimate_no+'.pdf');
  // else if(title=="print") pdfMake.createPdf(documentDefinition).print();
}

salesReportPDF(data,title,row_head,row_width,from_date,to_date)
{
  console.log(row_head)
  let sales = 0, advance = 0, given = 0 , balance = 0
  
  for(let i = 0;i< data.length;i++)
  {
    sales = sales + parseFloat(data[i].rounded_total)
    advance = advance + parseFloat(data[i].advance)
    given = given + parseFloat(data[i].given)
    balance = balance + parseFloat(data[i].balance)
  }

  console.log(data)
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  pdfMake.fonts = {
    Roboto: {
      normal: 'NotoSansTamil-Regular.ttf',
      bold: 'NotoSansTamil-Bold.ttf'
    }
  };

const documentDefinition = {
  content: [
    { text: this.apiservice.shop_name, style: 'mainheader' },
    { text: title, style: 'header', alignment:'center' },
    {
      canvas: [{
        "lineColor": "gray",
        "type": "line",
        "x1": 0,
        "y1": 0,
        "x2": 763,
        "y2": 0,
        "lineWidth": 1,
      },
    ],
    margin: [ 0, 5, 0, 5 ],
    },
    {
      columns: [
        [
          { text: `From Date : ${from_date}`,style: 'header1'},
        ],
        [
          { text: `To Date : ${to_date}`,style: 'subheader1', alignment: 'right'},
        ]
      ]
    },
    {
      canvas: [{
        "lineColor": "gray",
        "type": "line",
        "x1": 0,
        "y1": 0,
        "x2": 763,
        "y2": 0,
        "lineWidth": 1,
      },
    ],
    margin: [ 0, 5, 0, 5 ],
    },
    {
			style: 'tableExample',
			table: {
				headerRows: 1,
        widths: row_width ,
        body: [ row_head ,
          // ['S.No','Booking Date', 'Booking No', 'Name',  'Total','Advance','Given','Balance','Billed by'];
          ...data.map(report => [
              {text: report.s_no, style: 'subhead'},
              {text: report.delivery_date, style: 'subhead'},
              {text: report.booking_no, style: 'subhead'},
              {text: report.created_by, style: 'subhead'},
              {text: report.cus_name, style: 'subhead'},
              {text: report.cus_mobile, style: 'subhead'},
              [{text:`${report.rounded_total}`, alignment: 'right',style: 'subhead'}],
              [{text:`${report.advance}`, alignment: 'right',style: 'subhead'}],
              // [{text:`${report.given}`, alignment: 'right',style: 'subhead'}],
              [{text:`${report.balance}`, alignment: 'right',style: 'subhead'}],
              {text: report.reference, style: 'subhead'},
              {text: report.paid_status, style: 'subhead'},
              {text: report.lap_days, style: 'subhead'}

              
              
          ])
        ],
        style: 'subheader',
			},
			layout: {
				// hLineWidth: function (i, node) {
				// 	return (i === 0 || i === node.table.body.length) ? 2 : 1;
				// },
				// vLineWidth: function (i, node) {
				// 	return (i === 0 || i === node.table.widths.length) ? 2 : 1;
				// },
				hLineColor: function (i, node) {
					return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
				},
				vLineColor: function (i, node) {
					return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
				},

				// hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
				// vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
				// paddingLeft: function(i, node) { return 4; },
				// paddingRight: function(i, node) { return 4; },
				// paddingTop: function(i, node) { return 2; },
				// paddingBottom: function(i, node) { return 2; },
				// fillColor: function (rowIndex, node, columnIndex) { return null; }
			}
		},
    { text: `Total Sales : ₹${parseFloat(sales.toString()).toFixed(2)}`, alignment: 'right' ,style: 'header'},
    { text: `Total Advance : ₹${parseFloat(advance.toString()).toFixed(2)}`, alignment: 'right' ,style: 'header'},
    // { text: `Total Given : ₹${parseFloat(given.toString()).toFixed(2)}`, alignment: 'right' ,style: 'header'},
    { text: `Total Balance : ₹${parseFloat(balance.toString()).toFixed(2)}`, alignment: 'right' ,style: 'header'},
    { text: "This is System Generated Report", style: 'subheadcenter' },
  ],
  styles: {
    tableExample: {
			margin: [0, 5, 0, 15]
		},
    mainheader: {
      fontSize: 16,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 5]
    },
    header: {
      fontSize: 12,
      bold: true,
      margin: [0, 0, 0, 5]
    },
    header1: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 1]
    },
    subheader: {
      fontSize: 7,
      margin: [0, 0, 0, 1]
    },
    subheader1: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 1]
    },
    subbody: {
      fontSize: 11,
      margin: [0, 0, 0, 2]
    },
    subhead: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 2]
    },
    subheadcenter: {
      fontSize: 8,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 2]
    },
    subhead1: {
      fontSize: 8,
      bold: true,
      alignment:'right',
      margin: [0, 0, 0, 2]
    }
  },
  background:{

  },
  pageOrientation: 'landscape', // Set the page orientation to portrait
  pageSize: 'A4', // Set the page size to A4
  pageBreakBefore: (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) => {
    return (currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0); // Add page break before first-level headings
  },
};

// Add an outline border to the PDF
documentDefinition.background = function(currentPage, pageSize) {
  return {
    canvas: [{
      type: 'rect',
      x: 20,
      y: 20,
      w: pageSize.width - 40,
      h: pageSize.height - 40,
      lineWidth: 1,
      lineColor: '#000'
    }]
  };
};
// Generate the PDF
// pdfMake.createPdf(documentDefinition).download('invoice.pdf');
// if(title=="view")
// {
  var win = window.open('', '_blank');
  pdfMake.createPdf(documentDefinition).open({}, win);
// }
  // pdfMake.createPdf(documentDefinition).open();
  // else if(title=="download") pdfMake.createPdf(documentDefinition).download(data.estimate_no+'.pdf');
  // else if(title=="print") pdfMake.createPdf(documentDefinition).print();
}

productReportPDF(data,title,row_head,row_width,from_date,to_date)
{
  // let sales = 0, advance = 0, given = 0 , balance = 0
  
  // for(let i = 0;i< data.length;i++)
  // {
  //   sales = sales + parseFloat(data[i].rounded_total)
  //   advance = advance + parseFloat(data[i].advance)
  //   given = given + parseFloat(data[i].given)
  //   balance = balance + parseFloat(data[i].balance)
  // }

  // console.log(data)
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  pdfMake.fonts = {
    Roboto: {
      normal: 'NotoSansTamil-Regular.ttf',
      bold: 'NotoSansTamil-Bold.ttf'
    }
  };

const documentDefinition = {
  content: [
    { text: this.apiservice.shop_name, style: 'mainheader' },
    { text: title, style: 'header', alignment:'center' },
    {
      canvas: [{
        "lineColor": "gray",
        "type": "line",
        "x1": 0,
        "y1": 0,
        "x2": 515,
        "y2": 0,
        "lineWidth": 1,
      },
    ],
    margin: [ 0, 5, 0, 5 ],
    },
    {
      columns: [
        [
          { text: `From Date : ${from_date}`,style: 'header1'},
        ],
        [
          { text: `To Date : ${to_date}`,style: 'subheader1', alignment: 'right'},
        ]
      ]
    },
    {
      canvas: [{
        "lineColor": "gray",
        "type": "line",
        "x1": 0,
        "y1": 0,
        "x2": 515,
        "y2": 0,
        "lineWidth": 1,
      },
    ],
    margin: [ 0, 5, 0, 5 ],
    },
    {
			style: 'tableExample',
			table: {
				headerRows: 1,
        widths: row_width ,
        body: [ row_head ,
          // ['S.No','Product Name', 'Product Rate','Product GST','Total Sold'];
          ...data.map(report => [
              {text: report.s_no, style: 'subhead'},
              {text: report.product_name, style: 'subhead'},
              [{text:`${report.rate}`, alignment: 'right',style: 'subhead'}],
              {text: report.gst, style: 'subhead'},
              {text: `${report.total_sold} Bills`, style: 'subhead'},
          ])
        ],
        style: 'subheader',
			},
			layout: {
				// hLineWidth: function (i, node) {
				// 	return (i === 0 || i === node.table.body.length) ? 2 : 1;
				// },
				// vLineWidth: function (i, node) {
				// 	return (i === 0 || i === node.table.widths.length) ? 2 : 1;
				// },
				hLineColor: function (i, node) {
					return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
				},
				vLineColor: function (i, node) {
					return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
				},

				// hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
				// vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
				// paddingLeft: function(i, node) { return 4; },
				// paddingRight: function(i, node) { return 4; },
				// paddingTop: function(i, node) { return 2; },
				// paddingBottom: function(i, node) { return 2; },
				// fillColor: function (rowIndex, node, columnIndex) { return null; }
			}
		},
    { text: "This is System Generated Report", style: 'subheadcenter' },
  ],
  styles: {
    tableExample: {
			margin: [0, 5, 0, 15]
		},
    mainheader: {
      fontSize: 16,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 5]
    },
    header: {
      fontSize: 12,
      bold: true,
      margin: [0, 0, 0, 5]
    },
    header1: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 1]
    },
    subheader: {
      fontSize: 7,
      margin: [0, 0, 0, 1]
    },
    subheader1: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 1]
    },
    subbody: {
      fontSize: 11,
      margin: [0, 0, 0, 2]
    },
    subhead: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 2]
    },
    subheadcenter: {
      fontSize: 8,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 2]
    },
    subhead1: {
      fontSize: 8,
      bold: true,
      alignment:'right',
      margin: [0, 0, 0, 2]
    }
  },
  background:{

  },
  pageOrientation: 'portrait', // Set the page orientation to portrait
  pageSize: 'A4', // Set the page size to A4
  pageBreakBefore: (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) => {
    return (currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0); // Add page break before first-level headings
  },
};

// Add an outline border to the PDF
documentDefinition.background = function(currentPage, pageSize) {
  return {
    canvas: [{
      type: 'rect',
      x: 20,
      y: 20,
      w: pageSize.width - 40,
      h: pageSize.height - 40,
      lineWidth: 1,
      lineColor: '#000'
    }]
  };
};
// Generate the PDF
// pdfMake.createPdf(documentDefinition).download('invoice.pdf');
// if(title=="view")
// {
  var win = window.open('', '_blank');
  pdfMake.createPdf(documentDefinition).open({}, win);
// }
  // pdfMake.createPdf(documentDefinition).open();
  // else if(title=="download") pdfMake.createPdf(documentDefinition).download(data.estimate_no+'.pdf');
  // else if(title=="print") pdfMake.createPdf(documentDefinition).print();
}

productBillReportPDF(data,title,row_head,row_width,from_date,to_date)
{
  // let sales = 0, advance = 0, given = 0 , balance = 0
  
  // for(let i = 0;i< data.length;i++)
  // {
  //   sales = sales + parseFloat(data[i].rounded_total)
  //   advance = advance + parseFloat(data[i].advance)
  //   given = given + parseFloat(data[i].given)
  //   balance = balance + parseFloat(data[i].balance)
  // }

  // console.log(data)
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  pdfMake.fonts = {
    Roboto: {
      normal: 'NotoSansTamil-Regular.ttf',
      bold: 'NotoSansTamil-Bold.ttf'
    }
  };

const documentDefinition = {
  content: [
    { text: this.apiservice.shop_name, style: 'mainheader' },
    { text: title, style: 'header', alignment:'center' },
    {
      canvas: [{
        "lineColor": "gray",
        "type": "line",
        "x1": 0,
        "y1": 0,
        "x2": 515,
        "y2": 0,
        "lineWidth": 1,
      },
    ],
    margin: [ 0, 5, 0, 5 ],
    },
    {
      columns: [
        [
          { text: `From Date : ${from_date}`,style: 'header1'},
        ],
        [
          { text: `To Date : ${to_date}`,style: 'subheader1', alignment: 'right'},
        ]
      ]
    },
    {
      canvas: [{
        "lineColor": "gray",
        "type": "line",
        "x1": 0,
        "y1": 0,
        "x2": 515,
        "y2": 0,
        "lineWidth": 1,
      },
    ],
    margin: [ 0, 5, 0, 5 ],
    },
    {
			style: 'tableExample',
			table: {
				headerRows: 1,
        widths: row_width ,
        body: [ row_head ,
          // ['S.No','Product Name', 'Product Rate','Product GST','Total Sold'];
          ...data.map(report => [
              {text: report.s_no, style: 'subhead'},
              {text: report.booking_no, style: 'subhead'},
              {text: report.booking_date, style: 'subhead'},
              {text: report.cus_name, style: 'subhead'},
              {text: report.delivery_date, style: 'subhead'},
              [{text:`${report.total}`, alignment: 'right',style: 'subhead'}],
          ])
        ],
        style: 'subheader',
			},
			layout: {
				// hLineWidth: function (i, node) {
				// 	return (i === 0 || i === node.table.body.length) ? 2 : 1;
				// },
				// vLineWidth: function (i, node) {
				// 	return (i === 0 || i === node.table.widths.length) ? 2 : 1;
				// },
				hLineColor: function (i, node) {
					return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
				},
				vLineColor: function (i, node) {
					return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
				},

				// hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
				// vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
				// paddingLeft: function(i, node) { return 4; },
				// paddingRight: function(i, node) { return 4; },
				// paddingTop: function(i, node) { return 2; },
				// paddingBottom: function(i, node) { return 2; },
				// fillColor: function (rowIndex, node, columnIndex) { return null; }
			}
		},
    { text: "This is System Generated Report", style: 'subheadcenter' },
  ],
  styles: {
    tableExample: {
			margin: [0, 5, 0, 15]
		},
    mainheader: {
      fontSize: 16,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 5]
    },
    header: {
      fontSize: 12,
      bold: true,
      margin: [0, 0, 0, 5]
    },
    header1: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 1]
    },
    subheader: {
      fontSize: 7,
      margin: [0, 0, 0, 1]
    },
    subheader1: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 1]
    },
    subbody: {
      fontSize: 11,
      margin: [0, 0, 0, 2]
    },
    subhead: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 2]
    },
    subheadcenter: {
      fontSize: 8,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 2]
    },
    subhead1: {
      fontSize: 8,
      bold: true,
      alignment:'right',
      margin: [0, 0, 0, 2]
    }
  },
  background:{

  },
  pageOrientation: 'portrait', // Set the page orientation to portrait
  pageSize: 'A4', // Set the page size to A4
  pageBreakBefore: (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) => {
    return (currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0); // Add page break before first-level headings
  },
};

// Add an outline border to the PDF
documentDefinition.background = function(currentPage, pageSize) {
  return {
    canvas: [{
      type: 'rect',
      x: 20,
      y: 20,
      w: pageSize.width - 40,
      h: pageSize.height - 40,
      lineWidth: 1,
      lineColor: '#000'
    }]
  };
};
// Generate the PDF
// pdfMake.createPdf(documentDefinition).download('invoice.pdf');
// if(title=="view")
// {
  var win = window.open('', '_blank');
  pdfMake.createPdf(documentDefinition).open({}, win);
// }
  // pdfMake.createPdf(documentDefinition).open();
  // else if(title=="download") pdfMake.createPdf(documentDefinition).download(data.estimate_no+'.pdf');
  // else if(title=="print") pdfMake.createPdf(documentDefinition).print();
}

genPDF(data,title)
{
  var products = []
  var cgst6 = 0,  sgst6 = 0,  cgst9 = 0,  sgst9 = 0,  cgst2_5 = 0,  sgst2_5 = 0,  cgst0 = 0,  sgst0 = 0
  var pid,pname,pqty,prate,pamount,pgst,pgstvalue,ptotal,psub,pid_ar,pname_ar,pqty_ar,prate_ar,ptotal_ar,psub_ar,pamount_ar,pgst_ar,pgstvalue_ar;
  pid = data['product_id'];
    pname = data['product_name'];
    pqty = data['product_qty'];
    prate = data['product_rate'];
    pamount = data['product_amount'];
    pgst = data['product_gst'];
    pgstvalue = data['product_gst_value'];
    ptotal = data['product_total'];
    psub = data['product_sub_products'];

    pid_ar = pid.split('#?');
    pname_ar = pname.split('#?');
    pqty_ar = pqty.split('#?');
    prate_ar = prate.split('#?');
    pamount_ar = pamount.split('#?');
    pgst_ar = pgst.split('#?');
    pgstvalue_ar = pgstvalue.split('#?');
    ptotal_ar = ptotal.split('#?');
    psub_ar = psub.split('#?');

    for(let i = 0;i< pid_ar.length;i++)
    {
      var psubb = psub_ar[i].split('$;');
      var params = {
        id:pid_ar[i],
        p_name:pname_ar[i],
        qty:pqty_ar[i],
        rate:prate_ar[i],
        amount:pamount_ar[i],
        gst:pgst_ar[i],
        gst_value:pgstvalue_ar[i],
        s_no:i+1,
        total:ptotal_ar[i],
        sub_name:psubb
      }
      products.push(params)
    }

    let all_gst = JSON.parse(data['gst']);
    // console.log(all_gst.cgst2_5)
    cgst0 = sgst0 = all_gst.cgst0
    cgst2_5 = sgst2_5 = all_gst.cgst2_5
    cgst9 = sgst9 = all_gst.cgst9
    cgst6 = sgst6 = all_gst.cgst6

    // console.log(products)

  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  pdfMake.fonts = {
    Roboto: {
      normal: 'NotoSansTamil-Regular.ttf',
      bold: 'NotoSansTamil-Bold.ttf'
    }
  };
// Define the shop details
const shopDetails = {
  name: 'V.Arunachalam Iyer & Sons PVT LTD',
  address1: 'M265 A Phase 2, Anbu Nagar,',
  address2: 'Perumalpuram,',
  city: 'Tirunelveli-627007',
  gstin: 'GSTIN : 33AAFCV4271J1Z7',
  fssai: 'FSSAI No : 12416026000407'
};

// Define the document definition
const documentDefinition = {
  content: [
    { text: 'ESTIMATE', style: 'mainheader' },
    {
      columns: [
        [
          { text: `${shopDetails.name}`, style: 'header' },
          { text: `${shopDetails.address1}\n${shopDetails.address2}\n${shopDetails.city}\n${shopDetails.gstin}\n${shopDetails.fssai}\n\n`, style: 'header1' },
        ],
        [
          { text: `${data.estimate_no}\n${data.estimate_date}\n\n`, style: 'header', alignment: 'right'},
        ]
      ]
    },
    {
      columns: [
        [
          { text: 'To', style: 'subhead' },
          { text: `${data.cus_name}\n${data.cus_address}\n${data.cus_mobile}\n`, style: 'subheader' },
        ],
        [
          { text: 'Ship To', style: 'subhead1' },
          { text: `${data.cus_name}\n${data.shipping_address}\n${data.cus_mobile}\n`, style: 'subheader' , alignment: 'right'},
        ]
      ]
    },
    // { text: `Invoice Number: 12345\nDate: ${new Date().toLocaleDateString()}\n\n`, style: 'subheader' },
    // { text: `${customerDetails.name}\n${customerDetails.address}\nPhone: ${customerDetails.phone}\nEmail: ${customerDetails.email}\n\n`, style: 'subheader' },
    {
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto','auto', 'auto'],
        body: [
          ['Product Name', 'Rate', 'Qty', 'GST', 'Value', 'Total'],
          ...products.map(product => [
            [
              product.p_name,
              {
                ul:[
                  product.sub_name
                ],
                style: 'subbody'
              }
            ],
            `₹${product.rate}`, 
               product.qty, 
            `${product.gst}%`,
            `₹${product.gst_value}`, 
            `₹${product.total}`
          ])
        ]
      },
      layout: 'lightHorizontalLines'
    },
    // { text: '\n' },
    // {
    //   table: {
		// 		widths: ['*'],
		// 		body: [
    //         [
    //           { text: "Vessel Details"}
    //         ],
            
    //     ],
		// 	},
    //   hidden: true
    // },
    { text: '\n' },
    {
      table: {
				widths: ['*', 100],
				body: [
            [
              { text: "Delivery Charges"},
              { text: `₹${data.delivery_charges}`, style: 'subhead1' }
            ],
        ]
			}
    },
    {
      table: {
				widths: ['*', 100],
				body: [
					[
            { text: "Service Labour Charges"},
            { text: `₹${data.labour_charges}`, style: 'subhead1' }
          ],
				]
			}
    },
    { text: '\nGST Details\n', bold: true,style: 'subhead' },
    {
      columns: [
        [
          {
            style: 'subhead',
            table: {
              body: [
                ['GST 0%','GST 5%', 'GST 8%', 'GST 12%'],
                [`₹${cgst0}`,`₹${Number(cgst2_5)+Number(sgst2_5)}`, `₹${Number(cgst9)+Number(sgst9)}`, `₹${Number(cgst6)+Number(sgst6)}`],
                ['CGST',`₹${cgst2_5}`, `₹${cgst9}`, `₹${cgst6}`],
                ['SGST',`₹${sgst2_5}`, `₹${sgst9}`, `₹${sgst6}`]
              ]
            }
          }
        ],
        [
          { text: `Sub Total : ₹${data.sub_total}\n`, alignment: 'right',style: 'subhead' },
          { text: `GST Taxes : ₹${data.total_gst}\n`, alignment: 'right' ,style: 'subhead'},
          { text: `Delivery Charges : ₹${data.delivery_charges}\n`, alignment: 'right' ,style: 'subhead'},
          { text: `Labour Charges : ₹${data.labour_charges}\n\n`, alignment: 'right' ,style: 'subhead' },
          { text: `Bill Total : ₹${data.total}\n`, alignment: 'right', style: 'header', }
        ]
      ]
    },
    { text: 'Bank Details\n', bold: true,style: 'subhead' },
    {
      table: {
        widths: ['*', '*'],
        body: [
          [
            { text: 'Account Number', bold: true,style: 'subhead'  },
            { text: '123456789', bold: true,style: 'subhead'  },
          ],
          [
            { text: 'IFSC Code', bold: true,style: 'subhead'  },
            { text: 'KKBK0008793', bold: true,style: 'subhead'  },
          ],
          [
            { text: 'Bank Name', bold: true ,style: 'subhead' },
            { text: 'Kotak Mahindra Bank', bold: true ,style: 'subhead' },
          ],
          [
            { text: 'Branch Name', bold: true ,style: 'subhead' },
            { text: 'Tirunelveli', bold: true ,style: 'subhead' },
          ],
        ],
      },
    },
    { text: '\n' },
    { text: 'We are Looking forward for your Business...Thanks', style: 'subheadcenter' },
    // {
    //   table: {
		// 		widths: ['*'],
		// 		body: [
		// 			['We are Looking forward for your Business...Thanks'],
		// 		]
		// 	}
    // },
    // {
    //   style: 'tableExample',
    //   table: {
    //     body: [
    //       ['Column 1', 'Column 2', 'Column 3'],
    //       ['One value goes here', 'Another one here', 'OK?']
    //     ]
    //   }
    // },
    // { text: `Total: ₹${total.toFixed(2)}\n`, alignment: 'right' },
    // { text: `GST (${(gstRate * 100).toFixed(0)}%): ₹${gstAmount.toFixed(2)}\n`, alignment: 'right' },
    // { text: `Total Including GST: ₹${totalIncludingGst.toFixed(2)}\n`, alignment: 'right' }
  ],
  styles: {
    mainheader: {
      fontSize: 20,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 10]
    },
    header: {
      fontSize: 14,
      bold: true,
      margin: [0, 0, 0, 0]
    },
    header1: {
      fontSize: 12,
      bold: true,
      margin: [0, 0, 0, 1]
    },
    subheader: {
      fontSize: 12,
      margin: [0, 0, 0, 5]
    },
    subheader1: {
      fontSize: 12,
      bold: true,
      margin: [0, 0, 0, 5]
    },
    subbody: {
      fontSize: 10,
      margin: [0, 0, 0, 2]
    },
    subhead: {
      fontSize: 10,
      bold: true,
      margin: [0, 0, 0, 2]
    },
    subheadcenter: {
      fontSize: 10,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 2]
    },
    subhead1: {
      fontSize: 10,
      bold: true,
      alignment:'right',
      margin: [0, 0, 0, 2]
    }
  },
  background:{

  },
  pageOrientation: 'portrait', // Set the page orientation to portrait
  pageSize: 'A4', // Set the page size to A4
  pageBreakBefore: (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) => {
    return (currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0); // Add page break before first-level headings
  },
};

// Add an outline border to the PDF
documentDefinition.background = function(currentPage, pageSize) {
  return {
    canvas: [{
      type: 'rect',
      x: 20,
      y: 20,
      w: pageSize.width - 40,
      h: pageSize.height - 40,
      lineWidth: 1,
      lineColor: '#000'
    }]
  };
};
// Generate the PDF
// pdfMake.createPdf(documentDefinition).download('invoice.pdf');
if(title=="view")
  pdfMake.createPdf(documentDefinition).open();
  else if(title=="download") pdfMake.createPdf(documentDefinition).download(data.estimate_no+'.pdf');
  else if(title=="print") pdfMake.createPdf(documentDefinition).print();
}

generatePDF() {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  pdfMake.fonts = {
    Roboto: {
      normal: 'NotoSansTamil-Regular.ttf',
      bold: 'NotoSansTamil-Bold.ttf'
    }
  };

    let docDefinition = {
      content: [
        {
          text: 'வார்த்தைகள்',
          style: 'Roboto',
          fontSize: 16,
          alignment: 'center',
          color: '#047886'
        },
        {
          text: 'Invoice',
          fontSize: 20,
          bold: true,
          alignment: 'center',
          decoration: 'underline',
          color: 'skyblue'
        },
        {
          text: 'Customer Details',
          style: 'sectionHeader'
        },
        {
          columns: [
            [
              {
                text: "this.invoice.customerName",
                bold:true
              },
              { text: "this.invoice.address" },
              { text:" this.invoice.email" },
              { text: "this.invoice.contactNo" }
            ],
            [
              {
                text: `Date: ${new Date().toLocaleString()}`,
                alignment: 'right'
              },
              { 
                text: `Bill No : ${((Math.random() *1000).toFixed(0))}`,
                alignment: 'right'
              }
            ]
          ]
        },
        {
          text: 'Order Details',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Product', 'Price', 'Quantity', 'Amount'],
            //   ...this.invoice.products.map(p => ([p.name, p.price, p.qty, (p.price*p.qty).toFixed(2)])),
            //   [{text: 'Total Amount', colSpan: 3}, {}, {}, this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2)]
            ]
          }
        },
        {
          text: 'Additional Details',
          style: 'sectionHeader'
        },
        {
            text: "this.invoice.additionalDetails",
            margin: [0, 0 ,0, 15]          
        },
        {
          columns: [
            [{ qr: `${"this.invoice.customerName"}`, fit: '50' }],
            [{ text: 'Signature', alignment: 'right'}],
          ]
        },
        {
          text: 'Terms and Conditions',
          style: 'sectionHeader'
        },
        {
            ul: [
              'Order can be return in max 10 days.',
              'Warrenty of the product will be subject to the manufacturer terms and conditions.',
              'This is system generated invoice.',
            ],
        }
      ],
      styles: {
        Roboto: {
          fontFamily: 'Roboto'
        },
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 15,0, 15]          
        }
      }
    };
    pdfMake.createPdf(docDefinition).open();  
}


}
