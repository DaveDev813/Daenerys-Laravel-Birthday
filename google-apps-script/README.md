# Birthday RSVP Google Sheet Web App

1. Open the Google Sheet.
2. Go to `Extensions` > `Apps Script`.
3. Paste the contents of `rsvp-web-app.gs`.
4. Click `Deploy` > `New deployment`.
5. Choose `Web app`.
6. Set `Execute as` to `Me`.
7. Set `Who has access` to `Anyone`.
8. Copy the web app URL.
9. Add it to the frontend build env as `BIRTHDAY_RSVP_WEB_APP_URL`.

This Quasar project loads frontend env values from `.env.frontend` in the project root.
