const SPREADSHEET_ID = '1ZhRPpUreSLnTPRMP8yWRJNpk5hQVoaUuKAzg05FpGWw';
const SCRIPT_VERSION = '2026-05-11-kids-count-v1';
const SHEET_HEADERS = [
  'Submitted At',
  'Full name',
  'Number of Adult(s) Comming',
  'Number of kids(s) Comming Ages 1-10 years old',
];

function doPost(event) {
  const params = (event && event.parameter) || {};
  const fullName = String(params.fullName || '').trim();
  const guestCount = getValidGuestCount(params.guestCount);
  const kidsCount = getValidKidsCount(params.kidsCount);
  const submittedAt = params.submittedAt
    ? new Date(params.submittedAt)
    : new Date();

  if (
    !fullName ||
    !isValidGuestCount(guestCount) ||
    !isValidKidsCount(kidsCount)
  ) {
    return jsonResponse({
      ok: false,
      version: SCRIPT_VERSION,
      message: 'Full name, adult count, and kids count are required.',
    });
  }

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheets()[0];

  ensureSheetHeaders(sheet);

  sheet.appendRow([submittedAt, fullName, guestCount, kidsCount]);

  return jsonResponse({
    ok: true,
    version: SCRIPT_VERSION,
    guestCount,
    kidsCount,
  });
}

function doGet() {
  return jsonResponse({
    ok: true,
    version: SCRIPT_VERSION,
    acceptsNotGoing: true,
    acceptsKidsCount: true,
  });
}

function testDoPost() {
  return doPost({
    parameter: {
      fullName: 'Test Guest',
      guestCount: '1',
      kidsCount: '0',
      submittedAt: new Date().toISOString(),
    },
  });
}

function testDeclineDoPost() {
  return doPost({
    parameter: {
      fullName: 'Test Decline Guest',
      guestCount: 'not going',
      submittedAt: new Date().toISOString(),
    },
  });
}

function getValidGuestCount(value) {
  const rawValue = String(value === undefined ? '' : value).trim();

  if (rawValue.toLowerCase() === 'not going') {
    return 'not going';
  }

  const guestCount = Number(value === undefined || value === '' ? 1 : value);

  if (!Number.isFinite(guestCount) || guestCount < 1) {
    return 1;
  }

  return Math.max(1, Math.floor(guestCount));
}

function isValidGuestCount(value) {
  return value === 'not going' || (Number.isFinite(value) && value >= 1);
}

function getValidKidsCount(value) {
  const kidsCount = Number(value === undefined || value === '' ? 0 : value);

  if (!Number.isFinite(kidsCount) || kidsCount < 0) {
    return 0;
  }

  return Math.max(0, Math.floor(kidsCount));
}

function isValidKidsCount(value) {
  return Number.isFinite(value) && value >= 0;
}

function ensureSheetHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SHEET_HEADERS);
    return;
  }

  const headerRange = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
  const existingHeaders = headerRange.getValues()[0];
  const nextHeaders = SHEET_HEADERS.map(
    (header, index) => existingHeaders[index] || header
  );

  if (nextHeaders[2] === 'Number of Guest comming') {
    nextHeaders[2] = SHEET_HEADERS[2];
  }

  if (nextHeaders[3] !== SHEET_HEADERS[3]) {
    nextHeaders[3] = SHEET_HEADERS[3];
  }

  headerRange.setValues([nextHeaders]);
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
