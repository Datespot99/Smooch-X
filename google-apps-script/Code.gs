/** Smooch X lead collector. Deploy as a Google Apps Script Web App. */
const SPREADSHEET_ID = '1ivM5AlYMM-C80QekRH25-MUADoaR99VX5JWFbB-Dz7o';
const SHEET_NAME = 'Sheet1';
const TIME_ZONE = 'Asia/Kolkata';

function doGet(e) {
  return saveLead_(e && e.parameter);
}

function doPost(e) {
  return saveLead_(e && e.parameter);
}

function saveLead_(params) {
  const name = String((params && params.name) || '').trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 60 || !/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(name)) {
    return ContentService.createTextOutput('Invalid name');
  }

  const now = new Date();
  const date = Utilities.formatDate(now, TIME_ZONE, 'dd-MM');
  const time = Utilities.formatDate(now, TIME_ZONE, 'hh:mma');
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet tab not found: ' + SHEET_NAME);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // Protect leading signs from being treated as spreadsheet formulas.
    const safeName = /^[=+@-]/.test(name) ? "'" + name : name;
    sheet.appendRow([safeName, date, time]);
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput('OK');
}
