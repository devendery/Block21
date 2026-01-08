function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);

    // Handle Subscription (Stay Updated)
    if (data.type === 'subscribe') {
      var sheet = doc.getSheetByName('Subscribers');
      if (!sheet) {
        sheet = doc.insertSheet('Subscribers');
        sheet.appendRow(['Timestamp', 'Email']);
      }
      sheet.appendRow([new Date(), data.email]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ "result": "success", "message": "Subscribed" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Handle Participation (Default)
    var sheet = doc.getSheetByName('Responses');
    if (!sheet) {
      sheet = doc.insertSheet('Responses');
      sheet.appendRow(['Timestamp', 'Wallet Address', 'USDT Amount', 'B21 Tokens', 'Tx Hash', 'Consent', 'Signature']);
    }

    sheet.appendRow([
      new Date(),
      data.wallet,
      data.usdtAmount,
      data.tokenAmount,
      data.txHash,
      data.consent,
      data.signature,
      "Pending" // Default Status
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "row": sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = doc.getSheetByName('Responses');
  
  var totalRaised = 0;
  var tokensAllocated = 0;
  var investors = 0;
  var history = [];

  if (sheet) {
    var data = sheet.getDataRange().getValues();

    // Skip header row
    for (var i = 1; i < data.length; i++) {
      var usdt = parseFloat(data[i][2]); // Column C is USDT
      var tokens = parseFloat(data[i][3].toString().replace(/,/g, '')); // Column D is Tokens

      if (!isNaN(usdt)) totalRaised += usdt;
      if (!isNaN(tokens)) tokensAllocated += tokens;
      investors++;
    }

    // Get last 10 transactions for history
    var startRow = Math.max(1, data.length - 10);
    for (var i = data.length - 1; i >= startRow; i--) {
      history.push({
        date: data[i][0],
        wallet: data[i][1],
        usdt: data[i][2],
        tokens: data[i][3],
        txHash: data[i][4],
        status: data[i][7] || "Pending"
      });
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ 
      "totalRaised": totalRaised.toFixed(2), 
      "investors": investors,
      "tokensAllocated": tokensAllocated.toFixed(2),
      "history": history
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
