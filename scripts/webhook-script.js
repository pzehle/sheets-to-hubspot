function sendRowToWebhook(e) {

	// URL to send the new data to
	const webhookUrl = process.env.TEST_WEBHOOK_URL;

	// Get sheet information
	const sheet = e.source.getActiveSheet();
	const lastRow = sheet.getLastRow();

	// Ignore execution if the last row is the first row
	if (lastRow === 1) return;

	// Get the data from the last row
	const data = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];

	// Prepare the payload to send
	const payload = {
		timestamp: new Date().toISOString(),
		rowData: data
	};

	// Send the data to the webhook URL
	const options = {
		method: 'post',
		contentType: 'application/json',
		payload: JSON.stringify(payload),
	};

	// Initiate hook
	UrlFetchApp.fetch(webhookUrl, options);

}
