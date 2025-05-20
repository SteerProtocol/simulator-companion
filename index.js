const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8765;

let anvilProcess = null;

// Helper function for timestamp logs
const log = (message) => {
    console.log(`[${new Date().toISOString()}] ${message}`);
};

const error = (message) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
};

// Helper function to kill anvil process
const killAnvilProcess = () => {
    if (anvilProcess) {
        log('Killing existing Anvil process before starting new one');
        anvilProcess.kill('SIGINT');
        anvilProcess = null;
    }
};

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    log(`${req.method} ${req.path} - Request received`);
    next();
});

// Validate RPC URL
const isValidRpcUrl = (url) => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (e) {
        return false;
    }
};

app.post('/start-anvil', (req, res) => {
    const { blockNumber, rpcUrl } = req.body;
    log(`Received request to start Anvil with RPC URL: ${rpcUrl}${blockNumber ? ` at block ${blockNumber}` : ''}`);

    // Kill existing process if it exists
    killAnvilProcess();

    if (!rpcUrl) {
        error('Missing required rpcUrl parameter');
        return res.status(400).json({
            error: 'Missing rpcUrl parameter',
            status: 400
        });
    }

    if (!isValidRpcUrl(rpcUrl)) {
        error(`Invalid RPC URL provided: ${rpcUrl}`);
        return res.status(400).json({
            error: 'Invalid RPC URL. Must be a valid HTTP/HTTPS URL',
            status: 400
        });
    }

    if (rpcUrl.includes('localhost:' + port)) {
        error('Invalid RPC URL: Cannot use this server as RPC URL');
        return res.status(400).json({
            error: 'Cannot use this server as RPC URL. Please provide an Ethereum RPC endpoint',
            status: 400
        });
    }

    const args = ['--fork-url', rpcUrl];
    if (blockNumber) {
        args.push('--fork-block-number', blockNumber.toString());
    }

    log(`Starting Anvil with command: anvil ${args.join(' ')}`);

    try {
        anvilProcess = spawn('anvil', args);
        log('Anvil process spawned');

        anvilProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output) {
                log(`Anvil stdout: ${output}`);
            }
        });

        anvilProcess.stderr.on('data', (data) => {
            const output = data.toString().trim();
            if (output) {
                error(`Anvil stderr: ${output}`);
            }
        });

        anvilProcess.on('close', (code) => {
            log(`Anvil process exited with code ${code}`);
            anvilProcess = null;
        });

        anvilProcess.on('error', (err) => {
            error(`Failed to start Anvil process: ${err.message}`);
            anvilProcess = null;
            if (!res.headersSent) {
                res.status(500).json({
                    error: `Failed to start Anvil process: ${err.message}`,
                    status: 500
                });
            }
        });

        // Give Anvil a moment to start and potentially error out
        setTimeout(() => {
            if (anvilProcess && !res.headersSent) {
                if (anvilProcess.exitCode === null) {
                    log('Anvil process successfully started and running');
                    res.status(200).json({
                        message: 'Anvil process started',
                        status: 200
                    });
                } else {
                    error('Anvil process failed to start or exited unexpectedly');
                    if (!res.headersSent) {
                        res.status(500).json({
                            error: 'Anvil process failed to start or exited unexpectedly',
                            status: 500
                        });
                    }
                }
            } else if (!anvilProcess && !res.headersSent) {
                error('Anvil process failed to start');
                res.status(500).json({
                    error: 'Failed to start Anvil process',
                    status: 500
                });
            }
        }, 2000);
    } catch (err) {
        error(`Exception while starting Anvil: ${err.message}`);
        res.status(500).json({
            error: `Exception while starting Anvil: ${err.message}`,
            status: 500
        });
    }
});

app.post('/stop-anvil', (req, res) => {
    log('Received request to stop Anvil');

    if (!anvilProcess) {
        log('Stop request received but no Anvil process is running');
        return res.status(400).send('Anvil is not running.');
    }

    log('Sending SIGINT to Anvil process...');
    anvilProcess.kill('SIGINT');
    res.status(200).send('Anvil process is being stopped.');
});

const server = app.listen(port, () => {
    log(`HTTP server started and listening on port ${port}`);
    log('Ready to accept requests');
});

// Graceful shutdown handling
const shutdown = (signal) => {
    log(`\n${signal} received. Beginning graceful shutdown...`);
    server.close(() => {
        log('HTTP server closed.');
        if (anvilProcess) {
            log('Stopping Anvil process due to server shutdown...');
            anvilProcess.kill('SIGINT');
            anvilProcess = null;
        }
        log('Shutdown complete. Exiting process.');
        process.exit(0);
    });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM')); 