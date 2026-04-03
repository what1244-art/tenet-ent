/**
 * Tenet Entertainment Team Chat - Google Apps Script Backend
 *
 * Setup:
 * 1. Google Sheets에 "Chat" 시트 생성
 * 2. A1: timestamp, B1: sender, C1: message (헤더)
 * 3. 이 스크립트를 Apps Script에 붙여넣기
 * 4. 웹 앱으로 배포 (누구나 접근 가능)
 */

const SHEET_NAME = 'Chat';
const MAX_MESSAGES = 50;

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createJsonResponse({ error: 'Sheet not found' });
    }

    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return createJsonResponse({ messages: [] });
    }

    const startRow = Math.max(2, lastRow - MAX_MESSAGES + 1);
    const numRows = lastRow - startRow + 1;
    const data = sheet.getRange(startRow, 1, numRows, 3).getValues();

    const messages = data
      .filter(row => row[0] && row[1] && row[2])
      .map(row => ({
        timestamp: new Date(row[0]).toISOString(),
        sender: row[1].toString().trim(),
        message: row[2].toString()
      }));

    return createJsonResponse({ messages: messages });

  } catch (error) {
    return createJsonResponse({ error: error.message });
  }
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createJsonResponse({ error: 'Sheet not found' });
    }

    let body;
    if (e.postData) {
      body = JSON.parse(e.postData.contents);
    } else {
      return createJsonResponse({ error: 'No data received' });
    }

    const sender = body.sender;
    const message = body.message;

    if (!sender || !message) {
      return createJsonResponse({ error: 'Missing sender or message' });
    }

    const allowedMembers = ['영민', '주호', '혜림', '요한'];
    if (!allowedMembers.includes(sender)) {
      return createJsonResponse({ error: 'Unknown member' });
    }

    const timestamp = new Date();
    sheet.appendRow([timestamp, sender, message]);

    return createJsonResponse({
      success: true,
      timestamp: timestamp.toISOString()
    });

  } catch (error) {
    return createJsonResponse({ error: error.message });
  }
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 초기 설정 함수 - 한 번만 실행
 * 시트가 없으면 생성하고 헤더를 추가합니다.
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  sheet.getRange(1, 1, 1, 3).setValues([['timestamp', 'sender', 'message']]);
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 80);
  sheet.setColumnWidth(3, 400);

  // 헤더 스타일
  const headerRange = sheet.getRange(1, 1, 1, 3);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4a90d9');
  headerRange.setFontColor('#ffffff');

  Logger.log('Chat sheet setup complete!');
}
