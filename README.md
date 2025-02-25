# Technical Considerations

The code was developed in **Node.js**. It uses my credentials to simplify authentication logic, although, as we know, makes the code insecure and vulnerable.

# Sheet

https://docs.google.com/spreadsheets/d/11vwb5RKHRECeAva5Egn8hkMHhLYxl1cOoJdTHhxLVns/edit?gid=0#gid=0

## How to Run

To run the project, follow the steps below:

### Install dependencies:

```bash
npm install
```

### Run the project:

```bash
npm start
```

The data undergoes type standardization (value => [value] (list of unitary lists)) before being written to the cells.

# Functionality

The project uses the Google Sheets API to manipulate the spreadsheet and authenticates using service account credentials.

- **Read operations:** Performed using the `GET` method.
- **Write operations:** Performed using the `PUT` method.
Both methods require pre-defined parameters set by the functions that call them.

---

## Main Logic

The project's logic is based on two main arrays:

### `situation`
- Checks for students **failed due to absences**.
- If the number of absences is **greater than 15**, the status is set to `"Failed due to Absences"`.
- Otherwise, the status is set to `null`.

### `generalAverages`
- Calculates the average for **all students** (including those already failed due to absences) to ensure data consistency.
- After calculating the averages, each student's status is determined based on the following criteria:

| Average           | Student Status       |
|---------------|---------------------|
| Average < 50   | Failed by Grades   |
| 50 ≤ Average < 70 | Final Test        |
| Average ≥ 70   | Approved             |

---

## FGA Calculation (Final Grade for Approval)

For students in the **Final Test**, the final grade for approval (FGA) is calculated using the formula:

\[
5 \leq \frac{(\text{Average} + \text{FGA})}{2}
\]

- If the student is **not** in the "Final Test," the **FGA*** is set to `0`.
- The FGA value is then written to the spreadsheet.
