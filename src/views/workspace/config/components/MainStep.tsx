import { useState } from 'react';
import { Grid, TextField, Typography, Tab, Button } from '@mui/material';
import { TabContext, TabList } from '@mui/lab';
import { WalletContextState } from '@solana/wallet-adapter-react';

export default function MainStep(props: {
    vaultName: string;
    setVaultName: Function;
    nftCreator: string;
    setNftCreator: Function;
    splAddress: string;
    setSplAddress: Function;
    handleNext: Function;
    traits: string[];
    traitRewards: number[];
    dailyReward: number;
    setDailyReward: Function;
    setTraits: Function;
    setTraitRewards: Function;
    durations: number[];
    setDurations: Function;
    durationRewards: number[];
    setDurationRewards: Function;
    globalData: any;
    wallet: WalletContextState;
    handleClickInit: Function;
    handleClickUpdate: Function;
}) {
    const {
        wallet,
        durations,
        setDurations,
        durationRewards,
        setDurationRewards,
        vaultName,
        setVaultName,
        handleClickInit,
        handleClickUpdate,
        nftCreator,
        setNftCreator,
        splAddress,
        setSplAddress,
        handleNext,
        globalData,
        traits,
        traitRewards,
        setTraits,
        dailyReward,
        setDailyReward,
        setTraitRewards
    } = props;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [masterProjects, setMasterProjects] = useState<any>([[]]);

    const [tabIdx, setTabIdx] = useState('model-1');

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setMasterProjects([[]]);
        if (newValue !== 'model-1') {
            console.log('all');
        } else {
            console.log('other');
        }
        setTabIdx(newValue);
    };
    return (
        <Grid container>
            <Grid item md={12} sx={{ mt: 1 }}>
                <TabContext value={tabIdx}>
                    <TabList
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            marginTop: '-12px',
                            mb: { xs: 2, md: 0 },
                            width: '100%',
                            '.MuiTabs-root': {
                                width: '100%'
                            },
                            '.MuiTabs-flexContainer': { borderBottom: 'none' }
                        }}
                        textColor="secondary"
                        indicatorColor="secondary"
                    >
                        <Tab label="Traits Based" id="model-1" value="model-1" />
                        <Tab label="All equal" id="model-2" value="model-2" />
                        <Tab label="Time Locked" id="model-3" value="model-3" />
                    </TabList>
                </TabContext>
            </Grid>
            <Grid item md={12} sx={{ my: 1 }}>
                <Typography variant="subtitle1" sx={{ fontSize: 12 }}>
                    Vault Name:
                </Typography>
                <TextField
                    variant="outlined"
                    value={vaultName}
                    fullWidth
                    placeholder="Please enter name of valut"
                    onChange={(event) => setVaultName(event.target.value)}
                    sx={{
                        fieldset: { borderColor: '#f38aff !important' },
                        '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                    }}
                />
            </Grid>
            <Grid item md={12} sx={{ my: 1 }}>
                <Typography variant="subtitle1" sx={{ fontSize: 12 }}>
                    NFT Creator Address:
                </Typography>
                <TextField
                    variant="outlined"
                    value={nftCreator}
                    fullWidth
                    placeholder="Enter of paste verified NFT creator address"
                    onChange={(event) => setNftCreator(event.target.value)}
                    sx={{
                        fieldset: { borderColor: '#f38aff !important' },
                        '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                    }}
                />
            </Grid>
            <Grid item md={12} sx={{ my: 1 }}>
                <Typography variant="subtitle1" sx={{ fontSize: 12 }}>
                    SPL Token Address:
                </Typography>
                <TextField
                    variant="outlined"
                    value={splAddress}
                    fullWidth
                    placeholder="Enter or paste SPL token adderss for reward"
                    onChange={(event) => setSplAddress(event.target.value)}
                    sx={{
                        fieldset: { borderColor: '#f38aff !important' },
                        '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                    }}
                />
            </Grid>
            <Grid item md={12} sx={{ mt: 3, mb: 1 }}>
                {tabIdx === 'model-1' && (
                    <Typography sx={{ fontSize: 20, fontWeight: 700, borderBottom: '1px solid #302b33', pb: 1 }}>
                        Model 1 - Trait based
                    </Typography>
                )}
                {tabIdx === 'model-2' && (
                    <Typography sx={{ fontSize: 20, fontWeight: 700, borderBottom: '1px solid #302b33', pb: 1 }}>
                        Model 2 - All equal
                    </Typography>
                )}
                {tabIdx === 'model-3' && (
                    <Typography sx={{ fontSize: 20, fontWeight: 700, borderBottom: '1px solid #302b33', pb: 1 }}>
                        Model 3 - Time locked
                    </Typography>
                )}
            </Grid>

            {tabIdx === 'model-1' && (
                <Grid item md={12}>
                    <Grid container spacing={1}>
                        <Grid item md={12} sx={{ my: 1 }}>
                            <TextField
                                variant="outlined"
                                value={splAddress}
                                fullWidth
                                placeholder="Trait Type"
                                onChange={(event) => setSplAddress(event.target.value)}
                                sx={{
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                            />
                        </Grid>
                        {traits.map((trait, index) => (
                            <>
                                <Grid item md={6}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        placeholder="Trait Name"
                                        value={trait}
                                        onChange={(e) => {
                                            const newTraits = [...traits];
                                            newTraits[index] = e.target.value;
                                            setTraits(newTraits);
                                        }}
                                        sx={{
                                            fieldset: { borderColor: '#f38aff !important' },
                                            '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                        }}
                                    />
                                </Grid>
                                <Grid item md={6}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        placeholder="Daily Reward"
                                        value={traitRewards[index]}
                                        onChange={(e) => {
                                            const newTraitRewards = [...traitRewards];
                                            newTraitRewards[index] = parseFloat(e.target.value) || 0;
                                            setTraitRewards(newTraitRewards);
                                        }}
                                        sx={{
                                            fieldset: { borderColor: '#f38aff !important' },
                                            '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                        }}
                                    />
                                </Grid>
                            </>
                        ))}
                    </Grid>
                </Grid>
            )}
            {tabIdx === 'model-2' && (
                <Grid item md={12}>
                    <Grid container spacing={1}>
                        <Grid item md={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                placeholder="Trait Name"
                                value={dailyReward}
                                onChange={(e) => setDailyReward(parseFloat(e.target.value) || 0)}
                                sx={{
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            )}
            {tabIdx === 'model-3' && (
                <Grid item md={12}>
                    <Grid container spacing={1}>
                        {durations.map((duration, index) => (
                            <>
                                <Grid item md={12}>
                                    <Typography variant="subtitle1" sx={{ fontSize: 12 }}>
                                        Duration:
                                    </Typography>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        placeholder="Trait Name"
                                        value={duration}
                                        onChange={(e) => {
                                            const newDurations = [...durations];
                                            newDurations[index] = parseInt(e.target.value, 10) || 0;
                                            setDurations(newDurations);
                                        }}
                                        sx={{
                                            fieldset: { borderColor: '#f38aff !important' },
                                            '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                        }}
                                    />
                                </Grid>
                                <Grid item md={12}>
                                    <Typography variant="subtitle1" sx={{ fontSize: 12 }}>
                                        Reward for Duration:
                                    </Typography>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        placeholder="Reward for Duration"
                                        value={durationRewards[index]}
                                        onChange={(e) => {
                                            const newDurationRewards = [...durationRewards];
                                            newDurationRewards[index] = parseFloat(e.target.value) || 0;
                                            setDurationRewards(newDurationRewards);
                                        }}
                                        sx={{
                                            fieldset: { borderColor: '#f38aff !important' },
                                            '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                        }}
                                    />
                                </Grid>
                            </>
                        ))}
                    </Grid>
                </Grid>
            )}
            <Grid item md={12} sx={{ mt: 3 }}>
                <Grid container spacing={1}>
                    {/* <Grid item md={6}>
                        {!globalData && (
                            <Button variant="contained" fullWidth className="primary-btn flex-1" onClick={() => handleClickInit()}>
                                Create New Vault
                            </Button>
                        )}
                        {wallet.publicKey && (
                            <>
                                {globalData && globalData.admin.toString() === wallet.publicKey.toString() && (
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        className="primary-btn flex-1"
                                        onClick={() => handleClickUpdate()}
                                    >
                                        Create New Vault
                                    </Button>
                                )}
                            </>
                        )}
                    </Grid> */}
                    <Grid item md={6}>
                        <Button disabled variant="contained" fullWidth className="dark-btn flex-1" onClick={() => handleNext()}>
                            Back
                        </Button>
                    </Grid>
                    <Grid item md={6}>
                        <Button variant="contained" fullWidth className="primary-btn flex-1 ml-2" onClick={() => handleNext()}>
                            Next
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}
