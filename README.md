# Technical Considerations

The code was developed in **Node.js**. It uses a service account to simplify authentication logic.

# Sheet

https://docs.google.com/spreadsheets/d/11vwb5RKHRECeAva5Egn8hkMHhLYxl1cOoJdTHhxLVns/edit?gid=0#gid=0

## How to Run

To run the project, follow the steps below:

### Install dependencies:

```bash
npm install
```

## Download the credentials to access Google Sheets API

``` bash
python3 script.py
```

### Run the project:

```bash
npm start
```

# Functionality

- Fetches all data at once from the spreadsheet to minimize API calls.
- Processes the data locally to calculate averages, determine student statuses, and compute FGA values.
- Updates only the necessary columns (Situation and FGA) in the spreadsheet, leaving the rest of the data untouched.
