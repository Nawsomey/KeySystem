const express = require("express");
const session = require("express-session");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const app = express();
const port = process.env.PORT || 4000;

const keysFile = "keys.txt"; // File to store keys
const rawkeysFile = "rawkeys.txt"; // File to store raw keys

// Store user key generation times in-memory
const userKeyTimestamps = {};

// Middleware
app.use(
    session({
        secret: "soysauce", // Replace with a strong secret
        resave: false,
        saveUninitialized: false,
    })
);
app.use(express.static("public"));

// Serve the root page (index.html)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Serve the key generator page (after verification is complete)
app.get("/keygenerator.html", (req, res) => {
    const key = req.query.key; // Get the query parameter (key)
    if (!key) {
        return res.status(400).json({ error: "Invalid key." });
    }

    // Check if the key is valid (check against rawkeys.txt)
    fs.readFile(rawkeysFile, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading keys file." });
        }

        const keys = data.split("\n").map(line => line.trim());
        if (!keys.includes(key)) {
            return res.status(404).json({ error: "Invalid or expired key." });
        }

        // If key is valid, show key generator page
        res.sendFile(path.join(__dirname, "public/keygenerator.html"));
    });
});

// Function to generate a random key
function generateRandomKey() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "";
    for (let i = 0; i < 16; i++) {
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return key;
}

// Fetch the key from the session (for use with app.js)
app.get("/getKey", (req, res) => {
    if (req.session.key) {
        res.json({ secretKey: req.session.key });
    } else {
        res.json({ error: "No key found" });
    }
});

// Handle the Linkvertise process or other verification
app.get("/verify", (req, res) => {
    const newKey = generateRandomKey();
    req.session.key = newKey; // Save key to session

    // Redirect to the key generator with the key in the URL fragment
    res.redirect(`/keygenerator.html#${newKey}`);
});

// Generate a new key for the user (using IP-based rate limiting)
app.get("/generateKey", async (req, res) => {
    const userIP = req.ip;
    const lastGeneratedTime = userKeyTimestamps[userIP];
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (lastGeneratedTime && Date.now() - lastGeneratedTime < twentyFourHours) {
        return res.json({
            error: "You already have a generated key. Please use the existing key or wait 24 hours.",
        });
    }

    // Generate a new key
    const newKey = generateRandomKey();
    userKeyTimestamps[userIP] = Date.now(); // Update the user's timestamp
    req.session.key = newKey;

    // Write key and IP to files
    fs.appendFile(keysFile, `${newKey} ${userIP}\n`, (err) => {
        if (err) console.error("Error writing to keys.txt:", err);
    });
    fs.appendFile(rawkeysFile, `${newKey}\n`, (err) => {
        if (err) console.error("Error writing to rawkeys.txt:", err);
        else {
            exec(
                'git pull origin main && git add . && git commit -m "Add new key" && git push origin main',
                (error, stdout, stderr) => {
                    if (error) console.error(`Git push error: ${error.message}`);
                    if (stderr) console.error(`Git push stderr: ${stderr}`);
                    console.log(`Git push stdout: ${stdout}`);
                }
            );
        }
    });

    // Respond with the new key
    res.json({ secretKey: newKey });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
