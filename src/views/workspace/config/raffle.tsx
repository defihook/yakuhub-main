import { useEffect, useRef, useState } from 'react';
import { Button, Grid, TextField, Typography } from '@mui/material';
import useConnections from 'hooks/useConnetions';
import { getGlobalSate, initialize, programId } from 'contexts/workspace/raffle/transaction';
import { useWallet } from '@solana/wallet-adapter-react';
// import './style.scss';

export default function RaffleConfigPage() {
    const downloadFileRef: any = useRef();
    const wallet = useWallet();
    const { connection } = useConnections();
    const [loading, setLoading] = useState(false);
    const [splAddress, setSplAddress] = useState('');
    const [globalName, setGlobalName] = useState('');
    const [globalData, setGlobalData] = useState<any>();
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [discord, setDiscord] = useState('');
    const [twitter, setTwitter] = useState('');

    const fetchData = async () => {
        if (wallet.publicKey === null) return;
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const globalData = await getGlobalSate(connection, wallet.publicKey, globalName);
        setGlobalData(globalData);
    };

    const handleClickInit = async () => {
        if (!globalName) {
            return;
        }
        try {
            await initialize(wallet, connection, globalName, (e: boolean) => setLoading(e));
        } catch (error) {
            console.log(error);
        }
    };

    const handlClickDownload = async () => {
        const envContent = {
            CONFIG_NETWORK: 'devnet',
            CONFIG_PROGRAM_ID: programId.toBase58(),
            CONFIG_GLOBAL_NAME: globalName,
            CONFIG_PREY_TOKEN_MINT: splAddress,
            CONFIG_PREY_TOKEN_SYMBOL: tokenSymbol,
            CONFIG_DISCORD_LINK: discord,
            CONFIG_TWITTER_LINK: twitter
        };
        const blob = new Blob([JSON.stringify(envContent)]);
        const fileDownloadUrl = URL.createObjectURL(blob);
        downloadFileRef.current.href = fileDownloadUrl;
        downloadFileRef.current.click();
    };

    useEffect(() => {
        if (!globalName) return;
        fetchData();
        // eslint-disable-next-line @typescript-eslint/no-use-before-define, react-hooks/exhaustive-deps
    }, [globalName]);
    return (
        <div className="create-container">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a href="" ref={downloadFileRef} className="hidden" download="config.json" style={{ display: 'none' }}>
                Download Env
            </a>
            <div className="create-header">
                <h2 className="primary-title">One Click Config</h2>
                <p className="detail-text text-muted">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pharetra lectus et purus condimentum, ac cursus diam
                    tempus. Cras eget consectetur orci.
                </p>
            </div>

            <div className="create-main flex justify-between">
                <Grid container>
                    <Grid item md={6}>
                        <Grid container spacing={1}>
                            <Grid item md={12} sx={{ mb: 3 }}>
                                <Grid container spacing={1}>
                                    <Grid item md={12}>
                                        <Typography sx={{ fontSize: 12, my: 1 }}>Global Name</Typography>
                                    </Grid>
                                    <Grid item md={12}>
                                        <TextField
                                            variant="outlined"
                                            fullWidth
                                            placeholder="Global Name"
                                            sx={{
                                                fieldset: { borderColor: '#f38aff !important' },
                                                '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                            }}
                                            value={globalName}
                                            onChange={(e) => setGlobalName(e.target.value)}
                                        />
                                    </Grid>
                                    {!globalData && (
                                        <Grid item md={12}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                disabled={loading || globalName === ''}
                                                className="primary-btn flex-1"
                                                onClick={() => handleClickInit()}
                                            >
                                                {loading ? 'Creating...' : 'Create New Global'}
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>

                            <Grid item md={12}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="SPL Token Address:"
                                    sx={{
                                        fieldset: { borderColor: '#f38aff !important' },
                                        '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                    }}
                                    value={splAddress}
                                    onChange={(e) => setSplAddress(e.target.value)}
                                />
                            </Grid>
                            <Grid item md={12}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="Token Symbol:"
                                    sx={{
                                        fieldset: { borderColor: '#f38aff !important' },
                                        '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                    }}
                                    value={tokenSymbol}
                                    onChange={(e) => {
                                        setTokenSymbol(e.target.value);
                                    }}
                                />
                            </Grid>
                            <Grid item md={12}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="Discord Link:"
                                    sx={{
                                        fieldset: { borderColor: '#f38aff !important' },
                                        '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                    }}
                                    value={discord}
                                    onChange={(e) => {
                                        setDiscord(e.target.value);
                                    }}
                                />
                            </Grid>
                            <Grid item md={12}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="Twitter Link:"
                                    sx={{
                                        fieldset: { borderColor: '#f38aff !important' },
                                        '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                    }}
                                    value={twitter}
                                    onChange={(e) => {
                                        setTwitter(e.target.value);
                                    }}
                                />
                            </Grid>
                            <Grid item md={12} mt={2}>
                                <Button variant="contained" fullWidth className="primary-btn flex-1" onClick={() => handlClickDownload()}>
                                    Download Config File
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}
