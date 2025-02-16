const express = require('express');
const bodyParser = require('body-parser');
const hubspot = require('@hubspot/api-client');

// Config env variables
require('dotenv').config();

// Start process
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Webhook endpoint
app.post('/webhook', async (req, res) => {

	console.log('Webhook received!');
	console.log('Request Body:', req.body);

	// Extract information from the body
    const { sheetName, timestamp, rowData } = req.body;

	// Add condition for sheet name
	if (sheetName !== process.env.SHEET_NAME) return res.status(200).send('Updated other sheet. No action taken.');

	// Check if the minimum required data is provided (to avoid adding empty notes while user is typing/editing information)
    if (rowData && rowData[0] === '' && rowData[2] === '' && rowData[3] === '') {

		// Log and return empty
        console.log('Indices 0, 2, and 3 are empty. Returning 200 without further action.');
        return res.status(200).send('No action taken.');

    }

	// Initiate hubspot
	const hubspotClient = new hubspot.Client({ 'accessToken': process.env.HS_API_KEY });

	// Create note object
	const SimplePublicObjectInputForCreate = {
		properties: {
			hs_timestamp: timestamp,
			hs_note_body: `<strong>${rowData[0] || 'No title'}</strong><br /><br />${rowData[3] || 'No information provided'}<br />${rowData[4] || ''}<br /><br /><strong>Next follow-up:</strong> ${rowData[1] || 'N/A'}<br /><strong>Contact customer at:</strong> ${rowData[2] || 'No number specified'}`,
			hubspot_owner_id: process.env.HS_OWNER_ID,
		},
		associations: [
			{
				types: [
					{
						associationCategory: 'HUBSPOT_DEFINED',
						associationTypeId: 202,
					}
				],
				to: {
					id: process.env.HS_CONTACT_ID
				}
			}
		],
	};

	// Send information
	try {

		// Send to HubSpot
		const apiResponse = await hubspotClient.crm.objects.notes.basicApi.create(SimplePublicObjectInputForCreate);
		console.log(JSON.stringify(apiResponse, null, 2));

		// Send success response
		return res.status(200).send('Data received and processed successfully');

	} catch (e) {

		// Catch and log error(s)
		e.message === 'HTTP request failed'
			? console.error(JSON.stringify(e.response, null, 2))
			: console.error(e);

		// Send success response
		return res.status(400).send('Error processing/saving data');

	}

});

// Start the server
app.listen(port, () => console.log(`Server is running on port: ${port}`));
