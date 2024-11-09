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
        fs.appendFile(rawkeysFile, `${newKey}\n`, (err) => {
            if (err) {
                console.error("Error writing to rawkeys.txt:", err);
            } else {
                // Run Git push command after writing to rawkeys.txt
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
