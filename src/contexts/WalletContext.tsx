/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, ReactNode, useState, useCallback, useEffect, useMemo, createContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dialog, useMediaQuery, useTheme } from '@mui/material';
import { useMutation, useLazyQuery } from '@apollo/client';
import { map } from 'lodash';

// project imports
import { DEFAULT_RPC, USE_QUIKNODE } from 'config/config';
import { useToasts } from 'hooks/useToasts';
import useAuth from 'hooks/useAuth';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import useAuthMutation from 'hooks/useAuthMutation';
import { mutations, queries } from '../graphql/graphql';
import { selectFastestRpc } from 'actions/shared';
import { shortenAddress } from 'utils/utils';
import { useDispatch } from 'store';
import { updateHasWorkspace } from 'store/slices/menu';

// web3 imports
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    GlowWalletAdapter,
    ExodusWalletAdapter,
    TorusWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    LedgerWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useEthcontext } from './EthWalletProvider';
import WalletLogin from 'views/pages/authentication/auth-components/WalletLogin';

export const WalletsContext = createContext<any>(null);
export const WalletHandlerProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const theme = useTheme();
    const wallet = useWallet();
    const { publicKey } = wallet;
    const auth = useAuth();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [connected, setConnected] = useState(!!publicKey);
    const [exCode, setExCode] = useState('');
    const [open, setOpen] = useState(false);
    const { showInfoToast, showWarningToast } = useToasts();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [getSubwallet] = useAuthLazyQuery(queries.GET_ALL_SUBWALLET);
    const [getWorkpacesCount] = useLazyQuery(queries.GET_WORKSPACES_COUNT);
    const [login] = useMutation(mutations.LOG_IN);
    const [connectDiscord] = useAuthMutation(mutations.DISCORD_AUTH);
    const [connectTwitter] = useAuthMutation(mutations.TWITTER_AUTH);
    // Metamask context
    const { ethAddress, ethConnected } = useEthcontext();

    const attemptLogin = async () => {
        if (publicKey && !auth.isAttempting) {
            try {
                auth.attempting(true);
                const { data } = await login({
                    variables: { wallet: publicKey.toBase58(), ethAddress }
                });
                if (data?.login?.token) {
                    auth.signin(data.login.token, publicKey.toBase58());
                    auth.setUserData(data.login.user);
                    if (publicKey) {
                        showInfoToast(`Connected to wallet ${shortenAddress(publicKey.toBase58())}`);
                    }
                    if (ethAddress) {
                        showInfoToast(`Connected to wallet ${shortenAddress(ethAddress)}`);
                    }
                    setConnected(!!publicKey || ethConnected);
                    if (searchParams && searchParams.get('code') && (auth.token || data.login.token)) {
                        const code = searchParams.get('code') || exCode;
                        const state = searchParams?.get('state');
                        if (code) {
                            console.log('Wallet is connected, with Code:', code);
                            setExCode(code);
                            if (state === 'connect-twitter') {
                                connectTwitter({
                                    variables: {
                                        address: publicKey.toBase58(),
                                        code,
                                        redirectUri: window.location.origin
                                    }
                                }).then(({ data: resp }) => {
                                    if (resp && resp.linkTwitter) {
                                        auth.setUserData(resp.linkTwitter);
                                    }
                                });
                            } else {
                                connectDiscord({
                                    variables: {
                                        address: publicKey.toBase58(),
                                        code,
                                        redirectUri: window.location.origin
                                    }
                                }).then(({ data: resp }: any) => {
                                    if (resp && resp.discordAuth) {
                                        auth.setUserData(resp.discordAuth);
                                    }
                                });
                            }
                        }
                    }
                    const { data: subwallets } = await getSubwallet({ variables: { user: data.login.user.id } });
                    if (subwallets && subwallets.getAllLinkedWallet) {
                        auth.setUserData({
                            ...data.login.user,
                            wallets: map(subwallets.getAllLinkedWallet, ({ wallet: address }: any) => address)
                        });
                    }
                }
            } catch (error) {
                console.error(error);
                showWarningToast('Failed attempt auto login.');
            } finally {
                auth.attempting(false);
            }
        }
    };

    const attemptLoginEth = async () => {
        if (ethAddress && !auth.isAttempting) {
            try {
                auth.attempting(true);
                const { data } = await login({
                    variables: { ethAddress, wallet: auth.myPublic || publicKey?.toBase58() }
                });
                if (data?.login?.token) {
                    auth.signin(data.login.token);
                    auth.setUserData(data.login.user);
                    if (ethAddress) {
                        showInfoToast(`Connected to wallet ${shortenAddress(ethAddress)}`);
                    }
                }
            } catch (error) {
                console.error(error);
                showWarningToast('Failed attempt auto login with Eth.');
            } finally {
                auth.attempting(false);
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
        auth.attempting(false);
    };

    useEffect(() => {
        if (ethAddress !== '' || ethConnected) {
            handleClose();
            attemptLoginEth();
        }
    }, [ethConnected, ethAddress]);

    const checkWallet = () => {
        auth.attempting(!publicKey && !connected && !auth.isAttempting);
        setOpen(!publicKey && !connected && !auth.isAttempting);
    };

    useEffect(() => {
        if (!publicKey && connected) {
            showInfoToast('Disconnected from wallet');
            localStorage.removeItem('address');
            localStorage.removeItem('workspace');
            dispatch(updateHasWorkspace(false));
            auth.logout();
        }
        console.log(publicKey, connected, auth.token, auth.isAttempting);

        if (publicKey && connected) {
            console.log('PUBLIC_KEY_STORING...');
            localStorage.setItem('address', JSON.stringify(publicKey.toBase58()));
            console.log('STORED! :)');
            fetchWorkpacesCount();

            if (!auth.token) {
                const jwt = localStorage.getItem('yaku-lemonade');
                if (jwt) {
                    auth.signin(jwt, publicKey.toBase58());
                }
                console.log('Auto login');
                handleClose();
                attemptLogin();
            }
        }
        setConnected(!!publicKey);
    }, [publicKey, connected]);

    const fetchWorkpacesCount = async () => {
        if (publicKey) {
            try {
                console.log('WORKSPACES_COUNT_FETCHING...');
                const { data } = await getWorkpacesCount({ variables: { owner: publicKey.toBase58() } });
                console.log('WORKSPACES_COUNT: ', data.getWorkspacesCount);
                if (data.getWorkspacesCount > 0) {
                    dispatch(updateHasWorkspace(true));
                } else {
                    dispatch(updateHasWorkspace(false));
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <WalletsContext.Provider value={{ checkWallet, handleClose, attemptLoginEth, attemptLogin, setOpen }}>
            {children}
            <Dialog open={open} disableEscapeKeyDown fullScreen={fullScreen} sx={{ '.MuiPaper-root': { p: 0 } }}>
                <WalletLogin dismiss={handleClose} />
            </Dialog>
        </WalletsContext.Provider>
    );
};

export const WalletContext: FC<{ children: ReactNode }> = ({ children }) => {
    const network = WalletAdapterNetwork.Mainnet;
    const [selectedEndpt, setSelectedEndpt] = useState(clusterApiUrl(network));
    const endpoint = useMemo(() => selectedEndpt, [selectedEndpt]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new GlowWalletAdapter(),
            new ExodusWalletAdapter(),
            new TorusWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new SolletExtensionWalletAdapter({ network }),
            new SolletWalletAdapter({ network }),
            new LedgerWalletAdapter()
        ],
        [network]
    );

    const selectEndpoint = async () => {
        const selectedNode = await selectFastestRpc();
        setSelectedEndpt(USE_QUIKNODE ? DEFAULT_RPC : selectedNode.uri || clusterApiUrl(network));
    };

    useEffect(() => {
        selectEndpoint();
    }, [network]);

    const { showErrorToast } = useToasts();

    const onError = useCallback((error: WalletError) => {
        // custom handling for Slope since it doesn't return a message
        if (error.name === 'WalletAccountError') {
            showErrorToast(`The request was rejected, please try again.`);
        }
    }, []);

    return (
        <ConnectionProvider endpoint={endpoint} config={{ confirmTransactionInitialTimeout: 240000 }}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect>
                {children}
            </WalletProvider>
        </ConnectionProvider>
    );
};
