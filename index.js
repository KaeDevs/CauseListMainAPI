const express = require('express');
const fs = require('fs');
// node index.js
const app = express();
const PORT = process.env.PORT || 3000; // Use Render's dynamic PORT or fallback to 3000
const HOST = '0.0.0.0';
const path = require('path');


app.listen(PORT, HOST, () => {
    console.log('Server is listening on port 3000');
});

app.get('/', (req, res) => {
    res.send("<h1>Hello from API</h1>");
});
app.get('/users', (req, res) => {
    res.send("<h1>Hello from API</h1>");
});

app.get('/data/:district', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    let dist = "";  // Change const to let for reassignment
    const option = req.params.district;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    if (option === "mdu") {
        dist = path.join(__dirname, 'public', 'jsons', `mdu${formattedDate}.json`);
    } else {
        dist = `jsons/madr${formattedDate}.json`;
    }
    

    fs.readFile(dist, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send(`Error reading the data file1 ${dist}`);
            return;
        }

        const jsonData = JSON.parse(data);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Get the paginated slice of cases
        const paginatedData = jsonData["cases"].slice(startIndex, endIndex);

        const response = {
            page: page,
            limit: limit,
            totalItems: jsonData["cases"].length,  // Total items in the 'cases' array
            totalPages: Math.ceil(jsonData["cases"].length / limit),  // Total pages based on limit
            data: paginatedData
        };

        res.json(response);
    });
});


app.get('/courts/:district', (req, res) => {
    let dist = "";  // Change const to let for reassignment
    const option = req.params.district;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    if (option === "mdu") {
        dist = `jsons/mdu${formattedDate}.json`;
        console.log(dist)
    } else {
        dist = `jsons/madr${formattedDate}.json`;
    }
    console.log(dist)
    fs.readFile(dist, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading the data file');
            return;
        }

        const jsonData = JSON.parse(data);


        const courts = jsonData.courts;

        const response = {
            CList: courts
        }


        res.json(response);
    });
});

app.get('/data/:advocateName/:district', (req, res) => {
    dist = "";
    const option = req.params.district;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    if (option === "mdu") {
        dist = `jsons/mdu${formattedDate}.json`;
        console.log(dist)
    } else {
        dist = `jsons/madr${formattedDate}.json`;
    }
    const advocateName = req.params.advocateName.toUpperCase();

    fs.readFile(dist, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading the data file');
            return;
        }

        const jsonData = JSON.parse(data);


        const filteredCases = jsonData["cases"].filter(caseItem => {
            const petitionerAdvocates = caseItem.petitioner_advocates.toUpperCase();
            const respondentAdvocates = caseItem.respondent_advocates.toUpperCase();

            return petitionerAdvocates.includes(advocateName) || respondentAdvocates.includes(advocateName);
        });


        if (filteredCases.length === 0) {
            return res.status(404).json({ message: `No cases found for advocate: ${advocateName}` });
        }


        res.json({
            advocate: advocateName,
            totalCases: filteredCases.length,
            cases: filteredCases
        });
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


app.get('/keys/:district', (req, res) => {
    const dist = "";
    const option = req.params.district;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    if (option === "mdu") {
        dist = `jsons/mdu${formattedDate}.json`;
        console.log(dist)
    } else {
        dist = `jsons/madr${formattedDate}.json`;
    }
    console.log(dist)

    fs.readFile(dist, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading the data file');
            return;
        }

        const jsonData = JSON.parse(data);


        const keys = jsonData.court_numbers;


        res.json(keys);
    });
});
