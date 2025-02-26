// Apis imports
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('./credentials/credentials.json');
const http = require('http');

// OAuth2 Set up
const oAuth2Client = new OAuth2Client(
    credentials.web.client_id,
    credentials.web.client_secret,
    credentials.web.redirect_uris[0]
);

// Initializes Google Sheets API
const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

// Sheet info to link in methods
const spreadsheetId = '11vwb5RKHRECeAva5Egn8hkMHhLYxl1cOoJdTHhxLVns';
const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/11vwb5RKHRECeAva5Egn8hkMHhLYxl1cOoJdTHhxLVns/edit?gid=0#gid=0';

// Set up sheet limits
const initialRow = 4;
const finalRow = 27;

// Student situation
let situation = [];

// All students averages
let generalAverages = [];

// Read from sheet
async function GET(range) {
    try {
        console.log(`[${new Date().toLocaleTimeString()}] INFO: Fetching data from range: ${range}`);
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: range,
        });
        console.log(`[${new Date().toLocaleTimeString()}] INFO: Successfully fetched data from range: ${range}`);
        return response.data.values;
    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] ERROR: Error fetching data from Google Sheets:`, error);
        throw error;
    }
}

// Write on sheet
async function PUT(range, values) {
    try {
        console.log(`[${new Date().toLocaleTimeString()}] INFO: Updating data in range: ${range}`);
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: range,
            valueInputOption: 'RAW',
            resource: { values },
        });
        console.log(`[${new Date().toLocaleTimeString()}] INFO: Successfully updated data in range: ${range}`);
    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] ERROR: Error updating data in Google Sheets:`, error);
        throw error;
    }
}

async function absentFailedForAbsence() {
    const classesAmount = 60;
    const tolerance = classesAmount * 0.25;

    // Define row range
    const range = `engenharia_de_software!C${initialRow}:C${finalRow}`;

    const absences = await GET(range);

    console.log(`[${new Date().toLocaleTimeString()}] INFO: Checking absences for range: ${range}`);
    if (absences.length > 0) {
        absences.forEach((cell, index) => {
            const absenceCount = parseInt(cell[0], 10);
            if (absenceCount > tolerance) {
                situation.push('Reprovado por Falta');
                console.log(`[${new Date().toLocaleTimeString()}] INFO: Student in row ${initialRow + index} failed due to absence`);
            } else {
                situation.push(null);
            }
        });
    } else {
        console.log(`[${new Date().toLocaleTimeString()}] ERROR: No data found in the absences range.`);
    }
}

async function calculateAverage(i) {
    // Define column range
    const range = `engenharia_de_software!D${i}:F${i}`;

    const grades = await GET(range);

    console.log(`[${new Date().toLocaleTimeString()}] INFO: Calculating average for row: ${i}`);
    const avg = Math.ceil(grades[0].reduce((a, b) => parseInt(a, 10) + parseInt(b, 10), 0) / grades[0].length);

    console.log(`[${new Date().toLocaleTimeString()}] INFO: Average calculated for row ${i}: ${avg}`);
    return avg;
}

async function calculateFGA() {
    const FGA = [];

    // Verify if student situation is 'Final Test'
    console.log(`[${new Date().toLocaleTimeString()}] INFO: Calculating FGA for students in "Exame Final" situation`);
    generalAverages.forEach((average, index) => {
        if (situation[index] === 'Exame Final') {
            // Formula (5 <= (avg + fga) / 2) application rounding up
            let FGAcalc = Math.ceil(100 - average);
            FGA.push(FGAcalc);
            console.log(`[${new Date().toLocaleTimeString()}] INFO: FGA calculated for student in row ${initialRow + index}: ${FGAcalc}`);
        } else {
            FGA.push(0);
        }
    });

    // Type standardization to fill the cell
    const FGAValues = FGA.map(value => [value]);

    // Define row range
    const range = `engenharia_de_software!H${initialRow}:H${finalRow}`;

    // Fill the FGA column
    await PUT(range, FGAValues);
}

async function calculateSituation() {
    console.log(`[${new Date().toLocaleTimeString()}] INFO: Calculating student situations`);

    // If there was a absent failed for absence case, it fills the situation array with the case, otherwise puts null
    await absentFailedForAbsence();

    // Calculate each student average grade
    for (let i = initialRow; i <= finalRow; i++) {
        const avg = await calculateAverage(i);
        generalAverages.push(avg);
    }

    // If the student did not fail for absence, define situation based on grade
    for (let j = initialRow; j <= finalRow; j++) {
        if (situation[j - initialRow] !== null) continue;

        if (generalAverages[j - initialRow] < 50) {
            situation[j - initialRow] = 'Reprovado por Nota';
            console.log(`[${new Date().toLocaleTimeString()}] INFO: Student in row ${j} is in "Failed by Grade" situation`);
        } else if (generalAverages[j - initialRow] >= 50 && generalAverages[j - initialRow] < 70) {
            situation[j - initialRow] = 'Exame Final';
            console.log(`[${new Date().toLocaleTimeString()}] INFO: Student in row ${j} is in "Exame Final" situation`);
        } else {
            situation[j - initialRow] = 'Aprovado';
            console.log(`[${new Date().toLocaleTimeString()}] INFO: Student in row ${j} is in "Approved" situation`);
        }
    }

    // Type standardization to fill the cell
    const situationValues = situation.map(value => [value]);

    // Define row range
    const range = `engenharia_de_software!G${initialRow}:G${finalRow}`;

    // Fill the situation column
    await PUT(range, situationValues);
}

async function runApplication() {
    try {
        console.log(`[${new Date().toLocaleTimeString()}] WARN: Starting Log Application Monitoring: All write/read activity will be registered!`);

        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log(`[${new Date().toLocaleTimeString()}] INFO: Starting application`);

        await calculateSituation();
        await calculateFGA();
        
        console.log(`[${new Date().toLocaleTimeString()}] INFO: Application finished successfully`);
    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] ERROR: Application failed: ${error.message}`);
    }
}

// Temporary server to autenticate
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const code = url.searchParams.get('code');

    if (code) {
        try {
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);

            // Redirect user to the sheet
            res.writeHead(302, { Location: spreadsheetUrl });
            res.end();

            await runApplication();

        } catch (error) {
            res.end(`Erro: ${error.message}`);
        }
    } else {
        res.end('No authorization code found.');
    }
});

// Wait for the URL from the temp server
server.listen(5000, () => {
    console.log('Temporary server running on http://localhost:5000/google/callback');

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('Please, visit the URL to complete the authentication:');
    console.log(authUrl);
});
