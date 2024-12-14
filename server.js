const express = require("express");
const session = require("express-session");
const fs = require("fs");
const { exec } = require("child_process");
const app = express();
const port = process.env.PORT || 4000;

const keysFile = "keys.txt"; // File to store keys
const rawkeysFile = "rawkeys.txt"; // File to store raw keys

// Store user key generation times in-memory (or use a database for persistence across restarts)
const userKeyTimestamps = {};

app.use(
    session({
        secret: "soysauce", // Replace with a strong secret
        resave: false,
        saveUninitialized: false,
    }),
);

app.use(express.static("public"));

app.get("/generateKey", (req, res) => {
    const userIP = req.ip;

    // Check if the user has a timestamp recorded
    const lastGeneratedTime = userKeyTimestamps[userIP];
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (lastGeneratedTime && Date.now() - lastGeneratedTime < twentyFourHours) {
        // If the user already generated a key in the last 24 hours, deny new key generation
        return res.json({
            error: "You already have a generated key. Please use the existing key or wait 24 hours.",
        });
    }

    // Generate a new key since it's either a new user or 24 hours have passed
    const newKey = generateRandomKey();
    userKeyTimestamps[userIP] = Date.now(); // Update the timestamp for this user

    // Store the new key in the session
    req.session.key = newKey;

    // Get user's IP address as a simple identifier (consider more robust options)
    const hwid = req.ip;

    // Write the new key and hwid to keys.txt and rawkeys.txt
    fs.appendFile(keysFile, `${newKey} ${hwid}\n`, (err) => {
        if (err) {
            console.error("Error writing to keys.txt:", err);
        }
    });
    fs.appendFile(rawkeysFile, `${newKey}\n`, (err) => {
        if (err) {
            console.error("Error writing to rawkeys.txt:", err);
        } else {
            exec(
                'git pull origin main && git add . && git commit -m "Add new key" && git push origin main',
                (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Git push error: ${error.message}`);
                    }
                    if (stderr) {
                        console.error(`Git push stderr: ${stderr}`);
                    }
                    console.log(`Git push stdout: ${stdout}`);
                },
            );
        }
    });

    // Respond with the new key
    res.json({ secretKey: newKey });
});

// Endpoint to retrieve the current key, in case the page reloads
app.get("/getKey", (req, res) => {
    if (req.session.key) {
        res.json({ secretKey: req.session.key });
    } else {
        res.json({ secretKey: null });
    }
});

// Function to clear all keys in the txt files every 24 hours
function clearKeysFiles() {
    fs.writeFile(keysFile, "", (err) => {
        if (err) {
            console.error("Error clearing keys.txt:", err);
        } else {
            console.log("keys.txt has been cleared.");
        }
    });

    fs.writeFile(rawkeysFile, "", (err) => {
        if (err) {
            console.error("Error clearing rawkeys.txt:", err);
        } else {
            console.log("rawkeys.txt has been cleared.");
        }
    });
}

// Schedule the file clearing every 24 hours (86400000 milliseconds)
setInterval(clearKeysFiles, 24 * 60 * 60 * 1000);

// Function to generate a random key (16 characters long)
function generateRandomKey() {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "";
    for (let i = 0; i < 16; i++) {
        // Generate a 16-character key
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return key;
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
