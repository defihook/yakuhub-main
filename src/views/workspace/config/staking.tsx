/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
import * as anchor from '@project-serum/anchor';
import { useState, useEffect, useRef } from 'react';
import { Button, Grid, TextField, Typography } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import useConnections from 'hooks/useConnetions';
import { fund, getGlobalSate, getProgram, initGlobal, programId, updateGlobal } from 'contexts/workspace/staking/transaction';
import { getMint } from '@solana/spl-token-v2';

// import './style.scss';
import MainStep from './components/MainStep';

export default function StakingConfigPage() {
    const wallet = useWallet();
    const { connection } = useConnections();
    const [loading, setLoading] = useState(false);
    const [fundLoading, setFundLoading] = useState(false);
    const [nftCreator, setNftCreator] = useState('');
    const [splAddress, setSplAddress] = useState('');
    const [traits, setTraits] = useState(['', '', '', '', '']);
    const [traitType, setTraitType] = useState('');
    const [traitRewards, setTraitRewards] = useState([0, 0, 0, 0, 0]);
    const [dailyReward, setDailyReward] = useState(0);
    const [durations, setDurations] = useState([7, 14, 30]);
    const [durationRewards, setDurationRewards] = useState([0, 0, 0]);
    const [vaultName, setVaultName] = useState('');
    const [fundAmount, setFundAmount] = useState(0);
    const [globalData, setGlobalData] = useState<any>();
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [discord, setDiscord] = useState('');
    const [twitter, setTwitter] = useState('');
    const [decimals, setDecimals] = useState(LAMPORTS_PER_SOL);
    const downloadFileRef: any = useRef();

    const clearInput = () => {
        setTraits(['', '', '', '', '']);
        setTraitRewards([0, 0, 0, 0, 0]);
        setDailyReward(0);
        setDurations([7, 14, 30]);
        setDurationRewards([0, 0, 0]);
        setFundAmount(0);
    };

    useEffect(() => {
        if (!vaultName) return;
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vaultName]);

    const fetchData = async () => {
        if (wallet.publicKey === null) return;
        const fetchedGlobalData = await getGlobalSate(connection, wallet.publicKey, vaultName);
        setGlobalData(fetchedGlobalData);
        if (fetchedGlobalData === null) {
            clearInput();
            return;
        }
        // console.log(globalData.nftCreator.toString());
        // console.log(globalData.rewardTokenMint.toString());
        setNftCreator(fetchedGlobalData.nftCreator.toString());
        setSplAddress(fetchedGlobalData.rewardTokenMint.toString());
        const program = getProgram(wallet, connection);
        const splMint = await getMint(program.provider.connection, globalData.rewardTokenMint);
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const decimals = Math.pow(10, splMint.decimals);
        setDecimals(decimals);
        // console.log(globalData.normalRate.toNumber());
        setDailyReward(globalData.normalRate.toNumber() / decimals);
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const traits = ['', '', '', '', ''];
        const rates = [0, 0, 0, 0, 0];
        globalData.traitNames.forEach((trait: string, index: number) => {
            traits[index] = trait;
            rates[index] = globalData.traitRates[index].toNumber() / decimals;
        });
        setTraits(traits);
        setTraitRewards(rates);
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const durations = [7, 14, 30];
        const lockRates = [0, 0, 0];
        globalData.lockDurations.forEach((duration: number, index: number) => {
            durations[index] = duration;
            lockRates[index] = globalData.lockRates[index].toNumber() / decimals;
        });
        setDurations(durations);
        setDurationRewards(lockRates);
    };

    const handleClickFund = async () => {
        try {
            await fund(wallet, connection, (e: boolean) => setFundLoading(e), splAddress, vaultName, fundAmount, decimals);
        } catch (error) {
            console.log(error);
        }
    };

    const handleClickInit = async () => {
        if (!vaultName || !nftCreator || !splAddress) {
            return;
        }
        const rewardTokenMint = new PublicKey(splAddress);
        const traitNames = [];
        const traitRates = [];
        for (let i = 0; i < traits.length; i++) {
            if (!traits[i]) continue;
            traitNames.push(traits[i]);
            traitRates.push(new anchor.BN(traitRewards[i] * decimals));
        }
        console.log(traitRates, traitNames, durations, durationRewards, dailyReward);
        try {
            await initGlobal(
                wallet,
                connection,
                decimals,
                vaultName,
                nftCreator,
                rewardTokenMint,
                traitRates,
                traitNames,
                dailyReward,
                durations,
                durationRewards,
                (e: boolean) => setLoading(e)
            );
        } catch (error) {
            console.log(error);
        }
        // set init global set
        // await initGlobal(wallet, connection, )
    };

    const handleClickUpdate = async () => {
        if (!vaultName || !nftCreator || !splAddress) {
            return;
        }
        const rewardTokenMint = new PublicKey(splAddress);
        const traitNames = [];
        const traitRates = [];
        for (let i = 0; i < traits.length; i++) {
            if (!traits[i]) continue;
            traitNames.push(traits[i]);
            traitRates.push(new anchor.BN(traitRewards[i] * decimals));
        }
        console.log(traitRates, traitNames, durations, durationRewards, dailyReward);
        try {
            await updateGlobal(
                wallet,
                connection,
                decimals,
                vaultName,
                nftCreator,
                rewardTokenMint,
                traitRates,
                traitNames,
                dailyReward,
                durations,
                durationRewards,
                (e: boolean) => setLoading(e)
            );
        } catch (error) {
            console.log(error);
        }

        // update global
    };

    const handlClickDownload = async () => {
        const envContent = {
            CONFIG_NETWORK: 'mainnet-beta',
            CONFIG_PROGRAM_ID: programId.toBase58(),
            CONFIG_VAULT_NAME: vaultName,
            CONFIG_ADMIN_KEY: wallet.publicKey?.toString(),
            CONFIG_REWARD_TOKEN_MINT: splAddress,
            CONFIG_REWARD_TOKEN_SYMBOL: tokenSymbol,
            CONFIG_REWARD_TOKEN_DECIMAL: decimals,
            CONFIG_NFT_CREATOR: nftCreator,
            CONFIG_TRAIT_TYPE: traitType,
            CONFIG_DISCORD_LINK: discord,
            CONFIG_TWITTER_LINK: twitter
        };
        const blob = new Blob([JSON.stringify(envContent)]);
        const fileDownloadUrl = URL.createObjectURL(blob);
        downloadFileRef.current.href = fileDownloadUrl;
        downloadFileRef.current.click();
    };

    const [activeStep, setActiveStep] = useState(1);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const circleStyle = (currentStep: number) => {
        if (currentStep === activeStep) {
            return 'active';
        }
        if (currentStep < activeStep) {
            return 'passed';
        }
        return '';
    };

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
                <div className="create-main-left hidden lg:block">
                    <ul className="mb-0">
                        {steps.map((el, idx) => (
                            <li key={idx} className="step-list">
                                <span className={circleStyle(el.step)} />
                                <div>
                                    <h3 className={`secondary-title ${activeStep >= el.step ? '' : 'text-muted'}`}>{el.title}</h3>
                                    <p className={`detail-text mt-1 ${activeStep >= el.step ? 'text-white' : 'text-muted'}`}>{el.detail}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="create-main-right">
                    <div className="create-box">
                        <div className="create-box-header">
                            <h3 className="secondary-title pb-4">{steps[activeStep - 1].title}</h3>
                        </div>
                        {activeStep === 1 && (
                            <MainStep
                                vaultName={vaultName}
                                setVaultName={setVaultName}
                                nftCreator={nftCreator}
                                setNftCreator={setNftCreator}
                                splAddress={splAddress}
                                setSplAddress={setSplAddress}
                                handleNext={handleNext}
                                traits={traits}
                                traitRewards={traitRewards}
                                setTraits={setTraits}
                                setTraitRewards={setTraitRewards}
                                dailyReward={dailyReward}
                                setDailyReward={setDailyReward}
                                durations={durations}
                                setDurations={setDurations}
                                durationRewards={durationRewards}
                                globalData={globalData}
                                setDurationRewards={setDurationRewards}
                                handleClickInit={handleClickInit}
                                wallet={wallet}
                                handleClickUpdate={handleClickUpdate}
                            />
                        )}
                        {activeStep === 2 && (
                            <Grid container>
                                <Grid item md={12} sx={{ my: 1 }}>
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
                                <Grid item md={12} sx={{ my: 1 }}>
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
                                <Grid item md={12} sx={{ my: 1 }}>
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
                                <Grid item md={12} sx={{ my: 1 }}>
                                    <div className="flex mt-5">
                                        <Button variant="contained" className="dark-btn flex-1 mr-2" onClick={() => handleBack()}>
                                            Back
                                        </Button>
                                        <Button variant="contained" className="primary-btn flex-1 ml-2" onClick={() => handleNext()}>
                                            Next
                                        </Button>
                                    </div>
                                </Grid>
                            </Grid>
                        )}
                        {activeStep === 3 && (
                            <Grid container spacing={1}>
                                <Grid item md={12}>
                                    <Typography sx={{ fontSize: 12, my: 1 }}>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pharetra lectus et purus condimentum,
                                        ac cursus diam tempus. Cras eget consectetur orci.
                                    </Typography>
                                </Grid>
                                <Grid item md={12}>
                                    <Typography sx={{ fontSize: 12 }}>Fund Amount:</Typography>
                                </Grid>
                                <Grid item md={12}>
                                    <Grid container spacing={1}>
                                        <Grid item md={12}>
                                            <TextField
                                                variant="outlined"
                                                fullWidth
                                                placeholder="Amount"
                                                sx={{
                                                    fieldset: { borderColor: '#f38aff !important' },
                                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                                }}
                                                value={fundAmount}
                                                onChange={(e) => {
                                                    setFundAmount(parseFloat(e.target.value) || 0);
                                                }}
                                            />
                                        </Grid>
                                        <Grid item md={12}>
                                            <Button variant="contained" className="primary-btn flex-1" onClick={() => handleClickFund()}>
                                                Fund
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item md={12} mt={2}>
                                    <Button variant="contained" className="primary-btn flex-1" onClick={() => handlClickDownload()}>
                                        Download Config File
                                    </Button>
                                </Grid>
                                <Grid item md={12} mt={2}>
                                    {!globalData && (
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            className="primary-btn flex-1"
                                            onClick={() => handleClickInit()}
                                        >
                                            {loading ? 'Creating...' : 'Create New Vault'}
                                        </Button>
                                    )}
                                    {wallet.publicKey && (
                                        <>
                                            {globalData && globalData.admin.toString() === wallet.publicKey.toString() && (
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    className="primary-btn flex-1"
                                                    disabled={loading}
                                                    onClick={() => handleClickUpdate()}
                                                >
                                                    {loading ? 'Updating...' : 'Update Vault'}
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </Grid>
                                <Grid item md={12} sx={{ my: 1 }}>
                                    <Button variant="contained" className="dark-btn flex-1 mr-2" onClick={() => handleBack()}>
                                        Back
                                    </Button>
                                </Grid>
                            </Grid>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const steps = [
    {
        step: 1,
        title: 'Choose your Staking model',
        detail: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pharetra lectus et purus condimentum, ac cursus diam tempus. Cras eget consectetur orci.'
    },
    {
        step: 2,
        title: 'Token symbol & Social links',
        detail: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pharetra lectus et purus condimentum, ac cursus diam tempus. Cras eget consectetur orci.'
    },
    {
        step: 3,
        title: 'Create/Update Valut',
        detail: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pharetra lectus et purus condimentum, ac cursus diam tempus. Cras eget consectetur orci.'
    }
];
