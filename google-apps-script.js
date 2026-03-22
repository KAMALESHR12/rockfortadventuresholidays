// ============================================================
// ROCKFORT ADVENTURE HOLIDAYS — Google Apps Script Backend
// PASTE THIS ENTIRE CODE in Google Apps Script
// ============================================================

const SHEET_NAME = "Enquiries";

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);
    
    const row = [
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.name || '',
      data.phone || '',
      data.email || '',
      data.dest || '',
      data.service || '',
      data.date || '',
      data.group || '',
      data.msg || '',
      'New'  // Status
    ];
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Enquiry saved!' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getAll') {
      const sheet = getOrCreateSheet();
      const rows = sheet.getDataRange().getValues();
      
      if (rows.length <= 1) {
        return jsonResponse([]);
      }
      
      const enquiries = rows.slice(1).map((row, i) => ({
        id: i + 2, // row number in sheet
        timestamp: row[0],
        name: row[1],
        phone: row[2],
        email: row[3],
        dest: row[4],
        service: row[5],
        date: row[6],
        group: row[7],
        msg: row[8],
        status: row[9] || 'New'
      })).reverse(); // newest first
      
      return jsonResponse(enquiries);
    }
    
    if (action === 'updateStatus') {
      const rowNum = parseInt(e.parameter.row);
      const status = e.parameter.status;
      const sheet = getOrCreateSheet();
      sheet.getRange(rowNum, 10).setValue(status); // Column J = Status
      return jsonResponse({ success: true });
    }
    
    if (action === 'delete') {
      const rowNum = parseInt(e.parameter.row);
      const sheet = getOrCreateSheet();
      sheet.deleteRow(rowNum);
      return jsonResponse({ success: true });
    }
    
    return jsonResponse({ error: 'Unknown action' });
    
  } catch(err) {
    return jsonResponse({ error: err.toString() });
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add headers
    const headers = ['Timestamp', 'Name', 'Phone', 'Email', 'Destination', 'Service', 'Travel Date', 'Group Size', 'Message', 'Status'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0d9488').setFontColor('white');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
