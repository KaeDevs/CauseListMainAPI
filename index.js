const express = require('express');
const fs = require('fs'); // Import the filesystem module

const app = express();
const port = 3000;

app.listen(port, () => {
    console.log('Server is listening on port 3000');
});

app.get('/', (req, res) => {
    res.send("<h1>Hello from API</h1>");
});

app.get('/data', (req, res) => {
    const page = parseInt(req.query.page) || 1;  // Page number (defaults to 1)
    const limit = parseInt(req.query.limit) || 10; // Items per page (defaults to 10)

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading the data file');
            return;
        }

        const jsonData = JSON.parse(data);

        // Calculate the start and end index
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Paginate the data
        const paginatedData = jsonData.slice(startIndex, endIndex);

        // Return the paginated data and some metadat   a
        const response = {
            page: page,
            limit: limit,
            totalItems: jsonData.length,
            totalPages: Math.ceil(jsonData.length / limit),
            data: paginatedData
        };

        res.json(response);
    });
});
