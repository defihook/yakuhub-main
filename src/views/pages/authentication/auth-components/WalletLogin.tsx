/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { Button, Grid, Stack, Typography, useMediaQuery, CircularProgress, TextField, Chip, Switch } from '@mui/material';

// web3 imports
import { WalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet, Wallet } from '@solana/wallet-adapter-react';

// project imports
import AuthWrapper from '../AuthWrapper';
import AuthCardWrapper from '../AuthCardWrapper';
import AuthFooter from 'components/cards/AuthFooter';
import { useToasts } from 'hooks/useToasts';
import { shortenAddress } from 'utils/utils';

// third party
import { useMutation } from '@apollo/client';
import { mutations, queries } from '../../../../graphql/graphql';
import { isMobile } from 'react-device-detect';

// assets
import Confetti from 'assets/images/icons/confetti.png';
import DiscordLogo from 'assets/images/icons/discord.svg';
import { SystemProgram, Transaction } from '@solana/web3.js';
import { explorerLinkFor } from 'utils/transactions';
import useAuth from 'hooks/useAuth';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { map } from 'lodash';
import useConnections from 'hooks/useConnetions';
import Logo from 'components/Logo';
import ChainWalletSelect from 'components/ChainWalletSelect';
import { useEthcontext } from 'contexts/EthWalletProvider';

const WalletButton = styled(Button)({
    gap: '5px'
});

/*

    If you do it in one file, seperate components in this file and bridge states with cross comp.
    TODO:
    STEP SYSTEM: Step 1 (Connect Wallet / Sign Message) -> 2 (Choose Username) -> 3 (Give option to link Discord)
    Access & Refresh tokens, Jwt

*/
enum STEPS {
    SELECT_WALLET = 0,
    SIGN_MESSAGE = 1,
    CHOOSE_USERNAME = 2,
    LINK_DISCORD = 3
}

const WalletLogin = ({ dismiss, requireSign }: any) => {
    const { connection } = useConnections();

    // Metamask context
    const { ethAddress, ethConnected, ethConnect } = useEthcontext();

    const [step, setStep] = useState(STEPS.SELECT_WALLET);
    const [username, setUsername] = useState('');
    const [isLedger, setIsLedger] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);

    // wallet init
    const wallet = useWallet();
    const { wallets, connected, connecting, publicKey, select, connect, signMessage } = wallet;

    // hooks
    const theme = useTheme();
    const auth = useAuth();
    const { showInfoToast, showErrorToast, showWarningToast } = useToasts();

    // mutations / queries
    const [login] = useMutation(mutations.LOG_IN);
    const [signup] = useMutation(mutations.SIGN_UP);
    const [getSubwallet] = useAuthLazyQuery(queries.GET_ALL_SUBWALLET);

    const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

    const [listWallets] = useMemo(() => {
        const detected: Wallet[] = [];

        for (const w of wallets) {
            if (
                (isMobile && ['Solflare', 'Slope', 'Phantom'].includes(w?.adapter?.name)) ||
                (!isMobile && w.readyState === WalletReadyState.Installed)
            ) {
                detected.push(w);
            }
        }

        setTimeout(() => {
            setIsConnecting(false);
        }, 1500);

        return [detected];
    }, [wallets]);

    useEffect(() => {
        if (publicKey && connected) {
            if (!requireSign) {
                attemptLogin(publicKey.toBase58());
            } else {
                setStep(STEPS.SIGN_MESSAGE);
            }
        }

        console.log(`connecting: ${connecting} | connected: ${connected}`);
        if (!connecting && !connected) {
            connect().catch(() => {});
        }
    }, [publicKey, connect]);

    useEffect(() => {
        if (ethAddress) {
            attemptLoginEth();
        }
    }, [ethAddress]);

    const handleEtherLogin = useCallback(async () => {
        try {
            setIsConnecting(true);
            const connectEth = await ethConnect();
            connectEth.wait();
            setIsConnecting(false);
            if (ethConnected) {
                await attemptLoginEth();
            }
        } catch (error) {
            setIsConnecting(false);
        }
    }, [ethConnected]);

    // new functions
    const handleClick = useCallback(
        (adapter: WalletAdapter) => {
            console.log(adapter, wallet?.wallet?.adapter?.readyState);
            if (wallet.wallet?.adapter?.readyState === WalletReadyState.Installed && (!wallet.publicKey || !adapter.publicKey)) {
                // Reload
                console.log('Reload page');
                window.location.reload();
                return;
            }
            if (adapter.name !== wallet.wallet?.adapter.name) {
                console.log('selecting', adapter.name);
                select(adapter.name);
            }
        },
        [select]
    );

    const attemptLogin = async (address: string) => {
        if (publicKey && address) {
            try {
                setIsConnecting(true);
                const { data } = await login({ variables: { wallet: address } });
                if (data.login.token) {
                    auth.signin(data.login.token, address);
                    auth.setUserData(data.login.user);
                    showInfoToast(`Connected to wallet ${shortenAddress(address)}`);

                    const { data: subwallets } = await getSubwallet({ variables: { user: data.login.user.id } });
                    if (subwallets && subwallets.getAllLinkedWallet) {
                        auth.setUserData({
                            ...data.login.user,
                            wallets: map(subwallets.getAllLinkedWallet, ({ wallet: addr }: any) => addr)
                        });
                    }
                    setIsConnecting(false);
                    if (!data.login.registered) {
                        setStep(STEPS.CHOOSE_USERNAME);
                    } else {
                        dismiss();
                    }
                }
            } catch (error) {
                showErrorToast('An error occurred while contacting the database, please try again.');
            } finally {
                setIsConnecting(false);
            }
        } else {
            setStep(STEPS.SELECT_WALLET);
            setIsConnecting(false);
            showErrorToast('There seems to be an issue with your connection, please try again.');
        }
    };

    const attemptLoginEth = async () => {
        if (ethAddress) {
            try {
                setIsConnecting(true);
                const { data } = await login({ variables: { ethAddress } });
                if (data.login.token) {
                    auth.signin(data.login.token);
                    auth.setUserData(data.login.user);
                    showInfoToast(`Connected to wallet ${shortenAddress(ethAddress)}`);

                    setIsConnecting(false);
                    if (!data.login.registered) {
                        setStep(STEPS.CHOOSE_USERNAME);
                    } else {
                        dismiss();
                    }
                }
            } catch (error) {
                showErrorToast('An error occurred while contacting the database, please try again.');
            } finally {
                setIsConnecting(false);
            }
        } else {
            setStep(STEPS.SELECT_WALLET);
            setIsConnecting(false);
            showErrorToast('There seems to be an issue with your connection, please try again.');
        }
    };

    const handleSignTransaction = async () => {
        if (publicKey) {
            setIsConnecting(true);
            try {
                const transaction = new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: publicKey,
                        toPubkey: publicKey,
                        lamports: 1000
                    })
                );

                transaction.feePayer = publicKey;
                const blockHashObj = await connection.getLatestBlockhash();
                transaction.recentBlockhash = blockHashObj.blockhash;

                const signature = await wallet.sendTransaction(transaction, connection);
                await connection.confirmTransaction(signature, 'confirmed');
                auth.sign();
                if (!auth.token) {
                    attemptLogin(publicKey.toBase58());
                } else {
                    dismiss();
                }

                setIsConnecting(false);

                console.log(explorerLinkFor(signature, connection));
            } catch (err) {
                setStep(STEPS.SIGN_MESSAGE);
                setIsConnecting(false);
                showErrorToast(`The request was rejected, please try again.`);
                console.log(err);
            }
        }
    };

    const handleSignMessage = async () => {
        if (publicKey) {
            setIsConnecting(true);
            try {
                const message = `Welcome to the Yaku Hub!\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nYour authentication status will reset after 24 hours.\n\nWallet address:\n${publicKey}`;
                const encodedMessage = new TextEncoder().encode(message);
                const signature = await signMessage!(encodedMessage);
                if (!signature) showErrorToast(`An error occurred while confirming the signature, please try again.`);
                auth.sign();
                if (!auth.token) {
                    attemptLogin(publicKey.toBase58());
                } else {
                    dismiss();
                }
            } catch (err: any) {
                console.log(err);
                setStep(STEPS.SIGN_MESSAGE);
                setIsConnecting(false);
                showErrorToast(`The request was rejected, please try again.`);
            }
        } else {
            setStep(STEPS.SELECT_WALLET);
        }
    };

    const link = async (type: string) => {
        // OAuth init
        showWarningToast('Discord integration is going to be added at a later date.');
    };

    const handleUsername = async (name: string) => {
        setUsername(name);

        // check username for dupes
    };

    const handleSignup = async () => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const wallet = publicKey?.toBase58();
        if (wallet !== null) {
            try {
                setIsConnecting(true);
                const { data } = await signup({
                    variables: { wallet, vanity: username }
                });
                if (data.signup.token && wallet) {
                    auth.signin(data.signup.token, wallet);
                    auth.setUserData(data.signup.user);
                    setStep(STEPS.LINK_DISCORD);
                    showInfoToast('Congratulations! You are all set and ready to dive into the Yakuverse!');

                    dismiss();
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsConnecting(false);
            }
        } else {
            setStep(STEPS.SELECT_WALLET);
            showErrorToast('There seems to be an issue with your connection, please try again.');
        }
    };

    const handleProfileVisit = async () => {
        if (!publicKey || !connected) {
            setStep(STEPS.SELECT_WALLET);
            showErrorToast('There seems to be an issue with your connection, please try again.');
            return;
        }
        dismiss();
    };

    // TODO: PublicKey and wallet is not being reset, so clicking another button doesnt work.
    const handleReset = async () => {
        await wallet.disconnect().then(() => console.log('disconnect'));
        setIsLedger(false);
        setStep(STEPS.SELECT_WALLET);
    };

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const handleBack = async (step: number) => {
        if (step === 1) {
            handleReset();
            return;
        }
        setStep(step - 1);
    };
    return (
        <AuthWrapper>
            <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '70vh' }}>
                <Grid item xs={12}>
                    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(70vh - 68px)' }}>
                        <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
                            <AuthCardWrapper>
                                <Grid container spacing={2} alignItems="center" justifyContent="center">
                                    {step === 3 ? (
                                        <Grid item>
                                            <Link to="#">
                                                <img src={Confetti} alt="Complete" width={120} height={120} />
                                            </Link>
                                        </Grid>
                                    ) : (
                                        <Grid item>
                                            <Link to="#">
                                                <Logo />
                                            </Link>
                                        </Grid>
                                    )}
                                    {connecting || isConnecting ? (
                                        <Grid item xs={12}>
                                            <Grid
                                                container
                                                direction={matchDownSM ? 'column-reverse' : 'row'}
                                                alignItems="center"
                                                justifyContent="center"
                                                sx={{ mt: 1 }}
                                            >
                                                <Grid item>
                                                    <Stack alignItems="center" justifyContent="center" spacing={1}>
                                                        <CircularProgress color="secondary" />
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <>
                                            {step === 0 && (
                                                <ChainWalletSelect
                                                    setIsConnecting={setIsConnecting}
                                                    handleClick={handleClick}
                                                    handleEtherLogin={handleEtherLogin}
                                                />
                                            )}

                                            {step === 1 && (
                                                <>
                                                    <Grid item xs={12}>
                                                        <Grid
                                                            container
                                                            direction={matchDownSM ? 'column-reverse' : 'row'}
                                                            alignItems="center"
                                                            justifyContent="center"
                                                        >
                                                            <Grid item>
                                                                <Stack alignItems="center" justifyContent="center" spacing={3}>
                                                                    <Typography variant="caption" fontSize="16px" textAlign="center">
                                                                        You are required to prove ownership of this wallet by signing this
                                                                        message.
                                                                    </Typography>

                                                                    <Chip
                                                                        label={publicKey && shortenAddress(publicKey.toBase58(), 5)}
                                                                        size="medium"
                                                                        variant="filled"
                                                                    />

                                                                    <Typography variant="caption" fontSize="16px" textAlign="center">
                                                                        Using Ledger?
                                                                    </Typography>
                                                                    <Switch
                                                                        sx={{ mt: '0px !important' }}
                                                                        color="secondary"
                                                                        checked={isLedger}
                                                                        onChange={(e) => setIsLedger(e.target.checked)}
                                                                        inputProps={{ 'aria-label': 'controlled' }}
                                                                    />
                                                                </Stack>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>

                                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                                        <Stack direction="column" justifyContent="center">
                                                            <WalletButton
                                                                variant="contained"
                                                                color="secondary"
                                                                onClick={isLedger ? handleSignTransaction : handleSignMessage}
                                                            >
                                                                {!isLedger ? 'Sign Message' : 'Sign Transaction'}
                                                            </WalletButton>

                                                            <WalletButton
                                                                variant="outlined"
                                                                color="primary"
                                                                onClick={() => handleBack(step)}
                                                                sx={{ mt: 2 }}
                                                            >
                                                                Go Back
                                                            </WalletButton>
                                                        </Stack>
                                                    </Grid>
                                                </>
                                            )}

                                            {step === 2 && (
                                                <>
                                                    <Grid item xs={12}>
                                                        <Grid
                                                            container
                                                            direction={matchDownSM ? 'column-reverse' : 'row'}
                                                            alignItems="center"
                                                            justifyContent="center"
                                                        >
                                                            <Grid item>
                                                                <Stack alignItems="center" justifyContent="center" spacing={1}>
                                                                    <Typography variant="caption" fontSize="16px" textAlign="center">
                                                                        It appears to be your first time accessing the Yaku Hub.
                                                                        <br />
                                                                        <br />
                                                                        You are eligible to choose a username, this will be displayed around
                                                                        the site and used as your vanity url.
                                                                    </Typography>
                                                                </Stack>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>

                                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                                        <TextField
                                                            fullWidth
                                                            label="Username (Optional)"
                                                            value={username}
                                                            onChange={(e) => handleUsername(e.target.value)}
                                                        />
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <WalletButton
                                                                variant="outlined"
                                                                color="primary"
                                                                onClick={() => handleBack(step)}
                                                                sx={{ mt: 2 }}
                                                            >
                                                                Go Back
                                                            </WalletButton>

                                                            <WalletButton
                                                                variant="contained"
                                                                color="secondary"
                                                                onClick={handleSignup}
                                                                sx={{ mt: 2 }}
                                                            >
                                                                Sign Up
                                                            </WalletButton>
                                                        </Stack>
                                                    </Grid>
                                                </>
                                            )}

                                            {step === 3 && (
                                                <>
                                                    <Grid item xs={12}>
                                                        <Grid
                                                            container
                                                            direction={matchDownSM ? 'column-reverse' : 'row'}
                                                            alignItems="center"
                                                            justifyContent="center"
                                                        >
                                                            <Grid item>
                                                                <Stack alignItems="center" justifyContent="center" spacing={1}>
                                                                    {/* <img src={Confetti} alt="Complete" width={120} height={120} /> */}
                                                                    <Typography variant="h1" fontSize="16px" textAlign="center">
                                                                        Congratulations!
                                                                    </Typography>

                                                                    <Typography variant="caption" fontSize="16px" textAlign="center">
                                                                        Your account has been successfully created.
                                                                        <br />
                                                                        <br />
                                                                        You can choose to link your Discord and gain access to additional
                                                                        features such as Alert, Staking and other notifications.
                                                                        <br />
                                                                        <br />
                                                                        This step is optional and can be skipped and completed later in
                                                                        settings.
                                                                    </Typography>
                                                                </Stack>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>

                                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                                        <Stack direction="column" justifyContent="center">
                                                            <WalletButton
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={() => link('discord')}
                                                                sx={{
                                                                    mt: 2,
                                                                    backgroundColor: '#5865F2',
                                                                    '&:hover': {
                                                                        backgroundColor:
                                                                            'hsl(235,calc(var(--saturation-factor, 1)*86.1%),71.8%)'
                                                                    }
                                                                }}
                                                            >
                                                                <img src={DiscordLogo} alt="Discord" width="24" />
                                                                Link Discord
                                                            </WalletButton>

                                                            <WalletButton
                                                                variant="outlined"
                                                                color="secondary"
                                                                onClick={() => handleProfileVisit()}
                                                                sx={{ mt: 2 }}
                                                            >
                                                                Visit Hub
                                                            </WalletButton>
                                                        </Stack>
                                                    </Grid>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Grid>
                            </AuthCardWrapper>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
                    <AuthFooter />
                </Grid>
            </Grid>
        </AuthWrapper>
    );
};

export default WalletLogin;
