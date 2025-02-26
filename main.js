const { google } = require('googleapis');
const credentials = require('./credentials/credentials.json');

const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = '11vwb5RKHRECeAva5Egn8hkMHhLYxl1cOoJdTHhxLVns';


// GET
async function getAllData() {
    const range = 'engenharia_de_software!A3:H';
    console.log(`[${new Date().toLocaleTimeString()}] INFO: Fetching data from range: ${range}`);
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: range,
        });
        console.log(`[${new Date().toLocaleTimeString()}] SUCCESS: Successfully fetched data from range: ${range}`);
        return response.data.values;

    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] ERROR: Error fetching data from Google Sheets:`, error);
        throw error;
    }
}

// PUT
async function updateSheetData(data) {
    const range = 'engenharia_de_software!G4:H';
    console.log(`[${new Date().toLocaleTimeString()}] INFO: Updating data in range: ${range}`);
    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: range,
            valueInputOption: 'RAW',
            resource: { values: data },
        });
        console.log(`[${new Date().toLocaleTimeString()}] SUCCESS: Successfully updated data in range: ${range}`);

    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] ERROR: Error updating data in Google Sheets:`, error);
        throw error;
    }
}

function transformToJSON(data) {
    const headers = data[0];
    const rows = data.slice(1);

    console.log(`[${new Date().toLocaleTimeString()}] INFO: Transforming sheet to JSON`);
    try {
        const jsonData = rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index];
            });
            return obj;
        });

        console.log(`[${new Date().toLocaleTimeString()}] SUCCESS: Successfully transformed sheet to JSON`);
        return jsonData;

    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] ERROR: Error transforming sheet to JSON:`, error);
        throw error;
    }
}

function processData(jsonData) {
    const classesAmount = 60;
    const tolerance = classesAmount * 0.25;

    return jsonData.map(student => {
        const id = parseInt(student['Matricula']);
        const absences = parseInt(student['Faltas']);
        const p1 = parseInt(student['P1']);
        const p2 = parseInt(student['P2']);
        const p3 = parseInt(student['P3']);
        const average = Math.ceil((p1 + p2 + p3) / 3);

        let situation = '';
        let fga = 0;

        console.log(`[${new Date().toLocaleTimeString()}] INFO: Calculating student ${id} situation`);
        if (absences > tolerance) {
            situation = 'Reprovado por Falta';
        } else if (average < 50) {
            situation = 'Reprovado por Nota';
        } else if (average >= 50 && average < 70) {
            situation = 'Exame Final';
            fga = Math.ceil(100 - average);
        } else {
            situation = 'Aprovado';
        }
        console.log(`[${new Date().toLocaleTimeString()}] INFO: Student ${id} situation: ${situation}`);

        return [situation, fga];
    });
}

async function main() {
    try {
        console.log(`[${new Date().toLocaleTimeString()}] WARN: Starting Log Application Monitoring: All write/read activity will be registered!`);

        console.log(`[${new Date().toLocaleTimeString()}] INFO: Starting application`);

        const data = await getAllData();
        const jsonData = transformToJSON(data);
        const processedData = processData(jsonData);
        await updateSheetData(processedData);

        console.log(`[${new Date().toLocaleTimeString()}] SUCCESS: Application finished successfully`);

    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] ERROR: Application failed: ${error.message}`);
        throw error;
    }
}

main();