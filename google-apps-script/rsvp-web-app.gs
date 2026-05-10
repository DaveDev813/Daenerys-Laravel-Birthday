const SPREADSHEET_ID = '1ZhRPpUreSLnTPRMP8yWRJNpk5hQVoaUuKAzg05FpGWw';

function doPost(event) {
  const params = (event && event.parameter) || {};
  const fullName = String(params.fullName || '').trim();
  const guestCount = getValidGuestCount(params.guestCount);
  const submittedAt = params.submittedAt
    ? new Date(params.submittedAt)
    : new Date();

  if (!fullName || !isValidGuestCount(guestCount)) {
    return jsonResponse({
      ok: false,
      message: 'Full name and guest count are required.',
    });
  }

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheets()[0];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Submitted At', 'Full name', 'Number of Guest comming']);
  }

  sheet.appendRow([submittedAt, fullName, guestCount]);

  return jsonResponse({
    ok: true,
  });
}

function doGet() {
  return jsonResponse({
    ok: true,
  });
}

function testDoPost() {
  return doPost({
    parameter: {
      fullName: 'Test Guest',
      guestCount: '1',
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

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
