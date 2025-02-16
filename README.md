# Send latest row from Google Sheets to HubSpot as a contact's note

There are 2 files provided, `index.js` and `index.axios.js`. Both provide exactly the same functionality, but one uses the HubSpot API client for NodeJS, while the other is using plain axios library.

Another file is provided, under `scripts/webhook-script.js` which is the code added as a function in the Google Sheets environment as a trigger for each row that has changed.
