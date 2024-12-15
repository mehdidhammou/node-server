const express = require('express');
const app = express();
const fetch = require('node-fetch');
const fileupload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

app.use(fileupload());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/transcribe', async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No file uploaded');
        }

        const file = req.files.file;
        const filename = file.name;
        const extension = path.extname(filename).toLowerCase();

        if (extension !== '.wav' && extension !== '.flac') {
            return res.status(400).send('File must be a wav or flac file');
        }

        if (!file.mimetype.startsWith('audio/')) {
            return res.status(400).send('File must be an audio file');
        }

        if (!process.env.HF_KEY || !process.env.API_URL) {
            return res.status(500).send('Missing required environment variables (HF_KEY, API_URL)');
        }

        const tempPath = path.join(__dirname, 'uploads', filename);

        await file.mv(tempPath);

        const response = await fetch(process.env.API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.HF_KEY}`,
            },
            body: fs.createReadStream(tempPath),
        });

        const result = await response.json();

        fs.unlinkSync(tempPath);

        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
