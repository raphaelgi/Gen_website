const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

const accountsFilePaths = {
    spotify: path.join(__dirname, 'spotify_accounts.json'),
    netflix: path.join(__dirname, 'netflix_accounts.json')
};
const leaderboardFilePath = path.join(__dirname, 'leaderboard.json');

// Function to read accounts from the file
const readAccounts = (service) => {
    const data = fs.readFileSync(accountsFilePaths[service], 'utf8');
    return JSON.parse(data);
};

// Function to write accounts to the file
const writeAccounts = (service, accounts) => {
    fs.writeFileSync(accountsFilePaths[service], JSON.stringify(accounts, null, 2));
};

// Function to read leaderboard data
const readLeaderboard = () => {
    if (!fs.existsSync(leaderboardFilePath)) {
        return { count: 0 };
    }
    const data = fs.readFileSync(leaderboardFilePath, 'utf8');
    return JSON.parse(data);
};

// Function to write leaderboard data
const writeLeaderboard = (leaderboard) => {
    fs.writeFileSync(leaderboardFilePath, JSON.stringify(leaderboard, null, 2));
};

app.get('/generate-account/:service', (req, res) => {
    const service = req.params.service.toLowerCase();

    if (accountsFilePaths[service]) {
        try {
            let accounts = readAccounts(service);

            if (accounts.length > 0) {
                const account = accounts.pop();
                writeAccounts(service, accounts);

                // Update leaderboard
                let leaderboard = readLeaderboard();
                leaderboard.count += 1;
                writeLeaderboard(leaderboard);

                res.json({ account: account });
            } else {
                res.status(404).json({ error: 'No accounts available' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(404).json({ error: 'Service not supported' });
    }
});

app.get('/leaderboard', (req, res) => {
    try {
        const leaderboard = readLeaderboard();
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
