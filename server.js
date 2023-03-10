const express = require('express');
const app = express();
const fetch = require('node-fetch');
const fileupload = require('express-fileupload');

require('dotenv').config();

app.use(fileupload());
app.use(express.json());



app.get('/', (req, res) => {
    res.send('Hello World');
});


app.post('/transcribe', async (req, res) => {

    try {
        // check if file is uploaded
        if (!req.files) {
            return res.status(400).send('No file uploaded');
        }
        // check if the file is audio wav or flac
        const file = req.files.file;
        const filename = file.name;
        const extension = filename.split('.').pop();
        if (extension !== 'wav' && extension !== 'flac') {
            return res.status(400).send('File must be a wav or flac file');
        }

        if (!process.env.HF_KEY || !process.env.API_URL) {
            return res.status(500).send('check your env variables');
        }

        const response = await fetch(
            process.env.API_URL,
            {
                headers: { Authorization: `Bearer ${process.env.HF_KEY}` },
                method: "POST",
                body: file.data,
            }
        );
        const result = await response.json();
        res.send(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }

});

app.listen(process.env.PORT || 3000);