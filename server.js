const express = require('express');
const session = require('express-session');
const fs = require('fs'); 
const app = express();
const port = process.env.PORT || 4000;

const keysFile = 'keys.txt'; // File to store keys

app.use(session({
    secret: 'soysauce', // Replace with a strong secret
    resave: false,
    saveUninitialized: false
}));

app.use(express.static('public'));

app.get('/generateKey', (req, res) => {
    // Check if a key already exists in the session
    if (req.session.key) {
        res.json({ secretKey: req.session.key });
    } else {
        const newKey = generateRandomKey();
        req.session.key = newKey;

        // Get user's IP address as a simple identifier (consider more robust options)
        const hwid = req.ip; // Use a more robust method if needed

        // Write key and hwid to keys.txt
        fs.appendFile(keysFile, `${newKey} ${hwid}\n`, (err) => {
            if (err) {
                console.error("Error writing to keys.txt:", err);
            }
        });

        res.json({ secretKey: newKey });
    }
});

// ... other routes ...

function generateRandomKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) { // Generate a 16-character key
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return key;
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});