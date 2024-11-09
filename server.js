const express = require('express');
const session = require('express-session');
const fs = require('fs');
const { exec } = require('child_process'); // Import exec to run shell commands
const app = express();
const port = process.env.PORT || 4000;

const keysFile = 'keys.txt'; // File to store keys
const rawkeysFile = 'rawkeys.txt'; // File to store raw keys

app.use(session({
    secret: 'soysauce', // Replace with a strong secret
    resave: false,
    saveUninitialized: false
}));

app.use(express.static('public'));

app.get('/getKey', (req, res) => {
    if (req.session.key) {
        // If a key is already present in the session, send it to the client
        res.json({ secretKey: req.session.key });
    } else {
        // If no key is available, send an empty response
        res.json({ secretKey: null });
    }
});

app.get('/generateKey', (req, res) => {
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (req.session.key && req.session.keyTimestamp) {
        const timeElapsed = Date.now() - req.session.keyTimestamp;

        if (timeElapsed < twentyFourHours) {
            return res.json({
                error: "You already have a generated key. Please use the existing key or wait 24 hours."
            });
        }
    }

    const newKey = generateRandomKey();
    req.session.key = newKey;
    req.session.keyTimestamp = Date.now();

    const hwid = req.ip;

    fs.appendFile(keysFile, `${newKey} ${hwid}\n`, (err) => {
        if (err) {
            console.error("Error writing to keys.txt:", err);
        }
    });
    fs.appendFile(rawkeysFile, `${newKey}\n`, (err) => {
        if (err) {
            console.error("Error writing to rawkeys.txt:", err);
        } else {
            exec('git add . && git commit -m "Add new key" && git push --set-upstream origin main', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Git push error: ${error.message}`);
                }
                if (stderr) {
                    console.error(`Git push stderr: ${stderr}`);
                }
                console.log(`Git push stdout: ${stdout}`);
            });
        }
    });

    res.json({ secretKey: newKey });
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
