import { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Grid, Card, CardContent, CardHeader } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { motion } from 'framer-motion';
import { fetchNetworkInfo, getMiningRewards } from './api';
import './App.css';

function App() {
    const [hashrate, setHashrate] = useState('');
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { blockreward, networkHashrate } = await fetchNetworkInfo();

            const ownHashrateThs = parseFloat(hashrate) / 1_000_000_000;  // Convert kH/s to TH/s
            const percentOfNetwork = ownHashrateThs / networkHashrate;

            const rewards = getMiningRewards(blockreward, percentOfNetwork);

            setResults({
                networkHashrateMhs: networkHashrate * 1_000_000,  // Convert TH/s to MH/s
                blockreward,
                percentOfNetwork,
                rewards
            });
            setError(null);
        } catch (err) {
            setError('Failed to retrieve network information');
            setResults(null);
        }
    };

    return (
        <Container maxWidth="lg" className="container">
            <Paper elevation={12} className="paper">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="header">
                        <img src="https://explorer.spectre-network.org/k-icon-glow.png" alt="Spectre Logo" className="logo" />
                        <Typography variant="h3" gutterBottom align="center" className="title">
                            Spectre Mining Rewards Calculator
                        </Typography>
                    </div>
                </motion.div>
                <form onSubmit={handleSubmit} noValidate autoComplete="off">
                    <TextField
                        label="Mining Hashrate (kH/s)"
                        variant="outlined"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={hashrate}
                        onChange={(e) => setHashrate(e.target.value)}
                        required
                        InputProps={{
                            endAdornment: <SyncIcon />
                        }}
                    />
                    <Button variant="contained" color="secondary" type="submit" fullWidth>
                        Calculate <SyncIcon />
                    </Button>
                </form>
                {error && (
                    <Typography variant="body1" color="error" align="center" className="error-text">
                        {error}
                    </Typography>
                )}
                {results && (
                    <Grid container spacing={4} className="results-grid">
                        <Grid item xs={12} md={6}>
                            <Card className="network-card">
                                <CardHeader
                                    title="Network Statistics"
                                    avatar={<InfoIcon />}
                                />
                                <CardContent>
                                    <Typography variant="h6">Current Network Hashrate:</Typography>
                                    <Typography variant="body1">{results.networkHashrateMhs.toFixed(2)} MH/s</Typography>
                                    <Typography variant="h6">Block Reward:</Typography>
                                    <Typography variant="body1">{results.blockreward} SPR</Typography>
                                    <Typography variant="h6">Your Portion of the Network Hashrate:</Typography>
                                    <Typography variant="body1">{(results.percentOfNetwork * 100).toFixed(9)}%</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card className="rewards-card">
                                <CardHeader
                                    title="Estimated Rewards"
                                    avatar={<AttachMoneyIcon />}
                                />
                                <CardContent>
                                    {Object.keys(results.rewards).map((key) => (
                                        <Typography key={key} variant="body1">
                                            <strong>Per {key}:</strong> {results.rewards[key].toFixed(6)} SPR
                                        </Typography>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Paper>
        </Container>
    );
}

export default App;
