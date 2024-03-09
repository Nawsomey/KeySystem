const express = require('express');
const fingerprint = require('fingerprintjs2');

const app = express();
const port = process.env.PORT || 4000;

const userKeys = new Map();

app.use(express.static('public')); // public directory

app.get('/generateKey', (req, res) => {
    getHWID(req.headers['user-agent'], (hwid) => {
        if (userKeys.has(hwid)) {
            const existingKey = userKeys.get(hwid);
            res.json({ secretKey: existingKey, hwid: hwid });
        } else {
            const newKey = generateRandomKey();
            userKeys.set(hwid, newKey);

            setTimeout(() => {
                userKeys.delete(hwid);
            }, 24 * 60 * 60 * 1000);

            res.json({ secretKey: newKey, hwid: hwid });
        }
    });
});

app.get('/validateKey/:key', (req, res) => {
    const key = req.params.key;

    const userWithKey = Array.from(userKeys.entries()).find(([_, userKey]) => userKey === key);

    if (userWithKey) {
        res.json({ valid: true });
    } else {
        res.json({ valid: false });
    }
});

app.get('/retrieveKey', (req, res) => {
    getHWID(req.headers['user-agent'], (hwid) => {
        const userKey = userKeys.get(hwid);
        res.json({ key: userKey });
    });
});

function getHWID(userAgent, callback) {
    const options = { excludes: { plugins: true } };
    fingerprint.get(options, (result) => {
        const values = result.map(component => component.value);
        const hwid = fingerprint.x64hash128(values.join(''), 31);
        callback(hwid);
    });
}

function generateRandomKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return key;
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
