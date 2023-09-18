import { Injectable } from '@angular/core';
import { log } from 'console';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
export class TableUtil {

  static generateExcelnew(datasource,sheet,title1) {
    const title = "Kings Kitchen";
    const header = ['Order ID','Name','Date','Time','Payment Mode','Status','Products','Product Price','Product Type','Product Qty','Total Amount','Cooking Instructions','Address']
    const header1 = ['sl_no','name','date','time','pay_mode','status','product_name','product_price','product_type','product_qty','total_amount','cooking','address']
    const data = datasource
    let arr = []
    if(data.length != 0 && data != null)
    {
      for(let i=0;i<data.length;i++)
      {
        let newarr = []
        for(let j=0;j<header1.length;j++)
        {
          newarr.push(data[i][header1[j]])
        }
        arr.push(newarr)
      }
    }
    else{
      alert("No data")
    }

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Kings Kicthen');
    //Add Row and formatting
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { name: 'Comic Sans MS', family: 4, size: 16, underline: 'double', bold: true }
    worksheet.addRow([]);
    worksheet.mergeCells('A1:D2');
    //Blank Row 
    worksheet.addRow([]);
    //Add Header Row
    let headerRow = worksheet.addRow(header);
    
    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: '9F4020BF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    // worksheet.addRows(data);
    // Add Data and Conditional Formatting
    arr.forEach(d => {
      let row = worksheet.addRow(d);
    }
    );
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.addRow([]);

    let footerRow = worksheet.addRow(['This is system generated excel sheet.']);
    footerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCFFE5' }
    };

    footerRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title1+'.xlsx');
    })
  }

  static generateReportExcel(datasource,head,body,title1,shop) {
    const title = title1;
    // console.log(title)
    const header = head
    // console.log(header)

    const header1 = body
    const data = datasource
    let arr = []
    if(data.length != 0 && data != null)
    {
      for(let i=0;i<data.length;i++)
      {
        let newarr = []
        for(let j=0;j<header1.length;j++)
        {
          newarr.push(data[i][header1[j]])
        }
        arr.push(newarr)
      }
      console.log(arr)
    }
    else{
      alert("No data")
    }

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(shop);
    //Add Row and formatting
    let titleRow = worksheet.addRow([title]);
    console.log(titleRow)
    titleRow.font = { name: 'Comic Sans MS', family: 4, size: 16, underline: 'double', bold: true }
    worksheet.addRow([]);
    worksheet.mergeCells('A1:D2');
    //Blank Row 
    worksheet.addRow([]);
    //Add Header Row
    // let headerRow = worksheet.addRow(header);

    let headerRow = worksheet.addRow(header);

    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: '9F4020BF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    // worksheet.addRows(data);
    // Add Data and Conditional Formatting
    arr.forEach(d => {
      let row = worksheet.addRow(d);
    }
    );
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.addRow([]);

    let footerRow = worksheet.addRow(['This is system generated excel sheet.']);
    footerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCFFE5' }
    };

    footerRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title1+'.xlsx');
    })
  }

  static newexcel()
  {
    const title = 'Car Sell Report';
    const header = ["Year", "Month", "Make", "Model", "Quantity", "Pct"]
    const data = [
      [2007, 1, "Volkswagen ", "Volkswagen Passat", 1267, 10],
      [2007, 1, "Toyota ", "Toyota Rav4", 819, 6.5],
      [2007, 1, "Toyota ", "Toyota Avensis", 787, 6.2],
      [2007, 1, "Volkswagen ", "Volkswagen Golf", 720, 5.7],
      [2007, 1, "Toyota ", "Toyota Corolla", 691, 5.4],
      [2007, 1, "Peugeot ", "Peugeot 307", 481, 3.8],
      [2008, 1, "Toyota ", "Toyota Prius", 217, 2.2],
      [2008, 1, "Skoda ", "Skoda Octavia", 216, 2.2],
      [2008, 1, "Peugeot ", "Peugeot 308", 135, 1.4],
      [2008, 2, "Ford ", "Ford Mondeo", 624, 5.9],
      [2008, 2, "Volkswagen ", "Volkswagen Passat", 551, 5.2],
      [2008, 2, "Volkswagen ", "Volkswagen Golf", 488, 4.6],
      [2008, 2, "Volvo ", "Volvo V70", 392, 3.7],
      [2008, 2, "Toyota ", "Toyota Auris", 342, 3.2],
      [2008, 2, "Volkswagen ", "Volkswagen Tiguan", 340, 3.2],
      [2008, 2, "Toyota ", "Toyota Avensis", 315, 3],
      [2008, 2, "Nissan ", "Nissan Qashqai", 272, 2.6],
      [2008, 2, "Nissan ", "Nissan X-Trail", 271, 2.6],
      [2008, 2, "Mitsubishi ", "Mitsubishi Outlander", 257, 2.4],
      [2008, 2, "Toyota ", "Toyota Rav4", 250, 2.4],
      [2008, 2, "Ford ", "Ford Focus", 235, 2.2],
      [2008, 2, "Skoda ", "Skoda Octavia", 225, 2.1],
      [2008, 2, "Toyota ", "Toyota Yaris", 222, 2.1],
      [2008, 2, "Honda ", "Honda CR-V", 219, 2.1],
      [2008, 2, "Audi ", "Audi A4", 200, 1.9],
      [2008, 2, "BMW ", "BMW 3-serie", 184, 1.7],
      [2008, 2, "Toyota ", "Toyota Prius", 165, 1.6],
      [2008, 2, "Peugeot ", "Peugeot 207", 144, 1.4]
    ];
    //Create workbook and worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Car Data');
    //Add Row and formatting
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { name: 'Comic Sans MS', family: 4, size: 16, underline: 'double', bold: true }
    worksheet.addRow([]);
    worksheet.mergeCells('A1:D2');
    //Blank Row 
    worksheet.addRow([]);
    //Add Header Row
    let headerRow = worksheet.addRow(header);
    
    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    // worksheet.addRows(data);
    // Add Data and Conditional Formatting
    data.forEach(d => {
      let row = worksheet.addRow(d);
      let qty = row.getCell(5);
      let color = 'FF99FF99';
      if (+qty.value < 500) {
        color = 'FF9999'
      }
      qty.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color }
      }
    }
    );
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.addRow([]);
    //Footer Row
    let footerRow = worksheet.addRow(['This is system generated excel sheet.']);
    footerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCFFE5' }
    };
    footerRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    //Merge Cells
    worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);
    //Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'CarData.xlsx');
    })

  }

  static exportPDF(data,head,displayedColumns,shop,title,savefile)
  {
    let arr = []
    if(data.length != 0 && data != null)
    {
      for(let i=0;i<data.length;i++)
      {
        let newarr = []
        for(let j=0;j<displayedColumns.length;j++)
        {
          newarr.push(data[i][displayedColumns[j]])
        }
        arr.push(newarr)
      }
    }
    else{
      alert("No data")
    }

    // console.log(head)
    // console.log(arr)

    var doc = new jsPDF();

    // doc.setFontSize(18);
    // doc.text(shop, 12, 8);
    doc.text(title, 10, 8);
    doc.setFontSize(10);
    doc.setTextColor(100);

    (doc as any).autoTable({
      head: head,
      body: arr,
      theme: 'plain',
      didDrawCell: data => {
        // console.log(data.column.index)
      }
    })

    // below line for Open PDF document in new tab
    doc.output('dataurlnewwindow')
    // below line for Download PDF document  
    doc.save(savefile+'.pdf');
  }

}

