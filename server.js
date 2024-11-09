const express = require('express');
const session = require('express-session');
const fs = require('fs');
const { exec } = require('child_process'); // Import exec to run shell commands
const app = express();
const port = process.env.PORT || 4000;

const keysFile = 'keys.txt'; // File to store keys
const rawkeysFile = 'rawkeys.txt'; // File to store raw keys
const resetFile = 'last_reset.txt'; // File to store the last reset timestamp

app.use(session({
    secret: 'soysauce', // Replace with a strong secret
    resave: false,
    saveUninitialized: false
}));

app.use(express.static('public'));

app.get('/generateKey', (req, res) => {
    const hwid = req.ip; // Use IP or other unique identifier
    let existingKey = null;

    // Read keys from the file and find if the user already has a key
    fs.readFile(keysFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading keys file:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Check if the user already has a key
        const keys = data.split('\n');
        for (let keyEntry of keys) {
            const [key, storedHwid] = keyEntry.split(' ');
            if (storedHwid === hwid) {
                existingKey = key;
                break;
            }
        }

        // If the user has an existing key, check if 24 hours have passed
        if (existingKey) {
            const currentTime = new Date().getTime();
            const lastResetTime = fs.existsSync(resetFile) ? parseInt(fs.readFileSync(resetFile, 'utf8')) : 0;
            const oneDayInMillis = 24 * 60 * 60 * 1000;

            if (currentTime - lastResetTime < oneDayInMillis) {
                return res.json({ message: 'You already have a generated key. Please use the existing key or wait 24 hours.' });
            }
        }

        // If no key exists or 24 hours have passed, generate a new one
        const newKey = generateRandomKey();
        req.session.key = newKey;

        // Save the new key and hwid to the file
        fs.appendFile(keysFile, `${newKey} ${hwid}\n`, (err) => {
            if (err) {
                console.error("Error writing to keys.txt:", err);
            }
        });

        fs.appendFile(rawkeysFile, `${newKey}\n`, (err) => {
            if (err) {
                console.error("Error writing to rawkeys.txt:", err);
            } else {
                // Git commit/push logic can go here
                exec('git config user.email "nawsifsmail@gmail.com" && git config user.name "Nawsomey" && git add . && git commit -m "Add new key" && git push --set-upstream origin main', (error, stdout, stderr) => {
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
});

// Function to generate a random 16-character key
function generateRandomKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) { // Generate a 16-character key
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return key;
}

// Clear keys every 24 hours
function clearKeys() {
    const currentTime = new Date().getTime();
    const oneDayInMillis = 24 * 60 * 60 * 1000;

    // Check if 24 hours have passed since the last key reset
    const lastResetTime = fs.existsSync(resetFile) ? parseInt(fs.readFileSync(resetFile, 'utf8')) : 0;
    if (currentTime - lastResetTime >= oneDayInMillis) {
        // Reset the keys and update the last reset time
        fs.writeFileSync(keysFile, ''); // Clear the keys.txt file
        fs.writeFileSync(rawkeysFile, ''); // Clear the rawkeys.txt file
        fs.writeFileSync(resetFile, currentTime.toString()); // Update the last reset time
        console.log('Keys reset successfully.');
    }
}

// Set up a daily reset of the keys (every 24 hours)
setInterval(clearKeys, 24 * 60 * 60 * 1000); // Run every 24 hours

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
