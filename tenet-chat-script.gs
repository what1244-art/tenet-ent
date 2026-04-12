/**
 * Tenet Entertainment Team Chat - Google Apps Script Backend
 *
 * Setup:
 * 1. Google Sheets에 "Chat" 시트 생성
 * 2. A1: timestamp, B1: sender, C1: message (헤더)
 * 3. 이 스크립트를 Apps Script에 붙여넣기
 * 4. 웹 앱으로 배포 (누구나 접근 가능)
 */

var SHEET_NAME = 'Chat';
var MAX_MESSAGES = 50;

function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || 'read';

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createJsonResponse({ error: 'Sheet not found' });
    }

    // 메시지 보내기 (GET으로 처리)
    if (action === 'send') {
      var sender = params.sender;
      var message = params.message;

      if (!sender || !message) {
        return createJsonResponse({ error: 'Missing sender or message' });
      }

      var allowedMembers = ['영민', '주호', '혜림', '요한'];
      if (allowedMembers.indexOf(sender) === -1) {
        return createJsonResponse({ error: 'Unknown member' });
      }

      var timestamp = new Date();
      sheet.appendRow([timestamp, sender, message]);

      return createJsonResponse({ success: true, timestamp: timestamp.toISOString() });
    }

    // 메시지 읽기
    var lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return createJsonResponse({ messages: [] });
    }

    var startRow = Math.max(2, lastRow - MAX_MESSAGES + 1);
    var numRows = lastRow - startRow + 1;
    var data = sheet.getRange(startRow, 1, numRows, 3).getValues();

    var messages = [];
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      if (row[0] && row[1] && row[2]) {
        messages.push({
          timestamp: new Date(row[0]).toISOString(),
          sender: row[1].toString().trim(),
          message: row[2].toString()
        });
      }
    }

    return createJsonResponse({ messages: messages });

  } catch (error) {
    return createJsonResponse({ error: error.message });
  }
}

function doPost(e) {
  return doGet(e);
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 초기 설정 함수 - 한 번만 실행
 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  sheet.getRange(1, 1, 1, 3).setValues([['timestamp', 'sender', 'message']]);
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 80);
  sheet.setColumnWidth(3, 400);

  var headerRange = sheet.getRange(1, 1, 1, 3);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4a90d9');
  headerRange.setFontColor('#ffffff');

  Logger.log('Chat sheet setup complete!');
}
