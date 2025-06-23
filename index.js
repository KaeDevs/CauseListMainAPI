const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

function getFormattedDate(dateStr) {
    if (dateStr) {
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate)) {
            return `${String(parsedDate.getDate()).padStart(2, '0')}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${parsedDate.getFullYear()}`;
        }
    }
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
}

function isWeekend(dateSTR) {
    const parsedDate = new Date(dateSTR);
    if (!isNaN(parsedDate)) {
        const day = parsedDate.getDay();
        return day === 0 || day === 6;
    }
    return false;
}

app.listen(PORT, HOST, () => {
    console.log(`Server is listening on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send("<h1>Hello from API</h1>");
});

app.get('/users', (req, res) => {
    res.send("<h1>Hello from API</h1>");
});

app.get('/data/:district', (req, res) => {
    const ipdate = req.query.date || new Date().toISOString().split('T')[0];
    if (isWeekend(ipdate)) {
        return res.status(404).json({ message: "Data on Weekends are not Available!!" });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const formattedDate = getFormattedDate(req.query.date);
    const option = req.params.district;
    const dist = path.join(process.cwd(), `jsons/${option}${formattedDate}.json`);

    fs.readFile(dist, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(404).json({ message: "Data not found for the given date or district." });
        }

        const jsonData = JSON.parse(data);
        const startIndex = (page - 1) * limit;
        const paginatedData = jsonData["cases"].slice(startIndex, startIndex + limit);

        res.json({
            page,
            limit,
            totalItems: jsonData["cases"].length,
            totalPages: Math.ceil(jsonData["cases"].length / limit),
            data: paginatedData
        });
    });
});

app.get('/courts/:district', (req, res) => {
    const ipdate = req.query.date || new Date().toISOString().split('T')[0];
    if (isWeekend(ipdate)) {
        return res.json({ message: "Data on Weekends are not Available!!" });
    }
    const formattedDate = getFormattedDate(req.query.date);
    const option = req.params.district;
    const dist = path.join(process.cwd(), `jsons/${option}${formattedDate}.json`);

    fs.readFile(dist, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(404).json({ message: "Court data not found." });
        }

        const jsonData = JSON.parse(data);
        res.json({ CList: jsonData.courts });
    });
});

app.get('/dataoa/:advocateName/:district', (req, res) => {
    const ipdate = req.query.date || new Date().toISOString().split('T')[0];
    if (isWeekend(ipdate)) {
        return res.json({ message: "Data on Weekends are not Available!!" });
    }
    const formattedDate = getFormattedDate(req.query.date);
    const district = req.params.district;
    let advocateName = req.params.advocateName;
    let courtNumber = req.query.courtNumber;
    const filePath = path.join(process.cwd(), `jsons/${district}${formattedDate}.json`);

    advocateName = advocateName && advocateName.toUpperCase() !== "NULL" ? advocateName.toUpperCase() : null;
    if (courtNumber) {
        courtNumber = parseInt(courtNumber, 10).toString();
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(404).json({ message: "Data not found for the given date or district." });
        }

        const jsonData = JSON.parse(data);

        const filteredCases = jsonData["cases"].filter(caseItem => {
            const petitionerAdvocates = caseItem.petitioner_advocates.toUpperCase();
            const respondentAdvocates = caseItem.respondent_advocates.toUpperCase();
            const caseCourtNumber = caseItem["COURT NO."].replace(/[^0-9]/g, '');

            if (courtNumber === "0" || courtNumber === "00") {
                return (
                    (petitionerAdvocates.includes(advocateName) || respondentAdvocates.includes(advocateName)) &&
                    (caseCourtNumber === "0" || caseCourtNumber === "00")
                );
            }

            if (advocateName && courtNumber) {
                return (
                    (petitionerAdvocates.includes(advocateName) || respondentAdvocates.includes(advocateName)) &&
                    caseCourtNumber === courtNumber
                );
            } else if (advocateName) {
                return (
                    petitionerAdvocates.includes(advocateName) || respondentAdvocates.includes(advocateName)
                );
            } else if (courtNumber) {
                return caseCourtNumber === courtNumber;
            }
            return false;
        });

        if (filteredCases.length === 0) {
            return res.status(404).json({
                message: `No cases found${advocateName ? ` for advocate: ${advocateName}` : ''}${courtNumber ? ` in court number: ${courtNumber}` : ''}`
            });
        }

        res.json({
            ...(advocateName && { advocate: advocateName }),
            ...(courtNumber && { courtNumber }),
            totalCases: filteredCases.length,
            cases: filteredCases
        });
    });
});

app.get('/keys/:district', (req, res) => {
    const ipdate = req.query.date || new Date().toISOString().split('T')[0];
    if (isWeekend(ipdate)) {
        return res.json({ message: "Data on Weekends are not Available!!" });
    }
    const formattedDate = getFormattedDate(req.query.date);
    const option = req.params.district;
    const dist = path.join(process.cwd(), `jsons/${option}${formattedDate}.json`);

    fs.readFile(dist, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).json({ message: "Court numbers not found." });
        }

        const jsonData = JSON.parse(data);
        res.json(jsonData.court_numbers);
    });
});




// app.get('/data/:advocateName/:courtNumber', (req, res) => {
//     const advocateName = req.params.advocateName.toUpperCase();
//     const courtNumberPrefix = `COURT NO. ${req.params.courtNumber.padStart(2, '0')}`;

//     console.log(`Received request for advocate: ${advocateName} in court starting with: ${courtNumberPrefix}`);

//     fs.readFile('causelist_with_courts_and_timing.json', 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading the data file:', err);
//             res.status(500).send('Error reading the data file');
//             return;
//         }

//         const jsonData = JSON.parse(data);


//         const filteredCases = jsonData["cases"].filter(caseItem => {
//             const petitionerAdvocates = caseItem.petitioner_advocates.toUpperCase();
//             const respondentAdvocates = caseItem.respondent_advocates.toUpperCase();
//             const caseCourtNumber = caseItem["COURT NO."].toUpperCase();

//             return (petitionerAdvocates.includes(advocateName) || respondentAdvocates.includes(advocateName)) &&
//                 caseCourtNumber.startsWith(courtNumberPrefix);
//         });

//         console.log(`Found ${filteredCases.length} cases for advocate: ${advocateName} in court: ${courtNumberPrefix}`);


//         if (filteredCases.length === 0) {
//             return res.status(404).json({ message: `No cases found for advocate: ${advocateName} in court: ${courtNumberPrefix}` });
//         }


//         res.json({
//             advocate: advocateName,
//             courtNumber: courtNumberPrefix,
//             totalCases: filteredCases.length,
//             cases: filteredCases
//         });
//     });
// });


// app.get('/keys/:district', (req, res) => {
//     const dist = "";
//     const option = req.params.district;
//     const now = new Date();
//     const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
//     if (option === "mdu") {
//         dist = path.join(process.cwd(), `jsons/mdu${formattedDate}.json`);
//     } else {
//         dist = path.join(process.cwd(),`jsons/madr${formattedDate}.json`);
//     }
//     console.log(dist)

//     fs.readFile(dist, 'utf8', (err, data) => {
//         if (err) {
//             res.status(500).send('Error reading the data file');
//             return;
//         }

//         const jsonData = JSON.parse(data);


//         const keys = jsonData.court_numbers;


//         res.json(keys);
//     });
// });
