/* eslint-disable no-nested-ternary */
import { useNavigate, Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Avatar, Box, ClickAwayListener, Divider, Paper, Stack, Typography, Grid, Button, Badge, Tooltip } from '@mui/material';
import { IconPower, IconBook, IconBrandDiscord, IconBrandTwitter, IconBookUpload, IconEye, IconAward, IconBell } from '@tabler/icons';

// web3 imports
import { useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';

// project imports
import MainCard from 'components/cards/MainCard';
import { shortenAddress } from 'utils/utils';
import { mutations, queries } from '../graphql/graphql';
import Transitions from 'components/@extended/Transitions';
import { IMAGE_PROXY, DEFAULT_IMAGE_URL } from 'config/config';
import DiscordLogo from 'assets/images/icons/discord.svg';
import TwitterLogo from 'assets/images/icons/twitter.svg';
import EthLogo from 'assets/images/blockchains/ethereum-icon.png';

// third party
import Cookies from 'js-cookie';
import useAuth from 'hooks/useAuth';
import { isEmpty, isObject } from 'lodash';
import useAuthMutation from 'hooks/useAuthMutation';
import { useToasts } from 'hooks/useToasts';
import useConnections from 'hooks/useConnetions';
import useAuthQuery from 'hooks/useAuthQuery';
import { useBundleView } from 'contexts/BundleWalletContext';
import WalletValueSection from 'components/WalletValueSection';
import useNotifications from 'hooks/useNotifications';
import MetamaskLogo from 'assets/images/icons/metamask.svg';
import { useEthcontext } from 'contexts/EthWalletProvider';
import { useEffect } from 'react';

const ProfilePopperContext = ({ showProfile, open, handleClose, TransitionProps }: any) => {
    const { connection } = useConnections();
    // Metamask context
    const { ethAddress, ethConnected, ethConnect, ethBalance } = useEthcontext();
    const { setShowBundleView } = useBundleView();
    const theme = useTheme();
    const auth = useAuth();
    const { unreadCount, handleToggle } = useNotifications();
    const navigate = useNavigate();
    const mainWallet = useWallet();
    const { publicKey, wallet, disconnect } = mainWallet;
    const { showInfoToast } = useToasts();
    const { data: escrowBal, refetch: refetchEscrow } = useAuthQuery(queries.GET_ME_ESCROW_BALANCE, {
        variables: {
            wallet: mainWallet?.publicKey?.toBase58()
        }
    });
    const [getDiscordAuthLink] = useAuthMutation(mutations.GET_DISCORD_LINK);
    const [getTwitterAuthLink] = useAuthMutation(mutations.GET_TWITTER_LINK);
    const [getWithdrawTx] = useAuthMutation(mutations.GET_ME_WITHDRAW_TRANSACTION_INSTRUCTIONS);
    const { showSuccessToast, showErrorToast } = useToasts();

    const handleDiscordConnect = async () => {
        showInfoToast('Redirect to discord authentication site...');
        const { data: urlData } = await getDiscordAuthLink({
            variables: {
                redirectUri: window.location.origin
            }
        });
        const url = urlData.getDiscordConnectURL;
        window.open(url);
    };
    const handleTwitterConnect = async () => {
        showInfoToast('Redirect to twitter authentication site...');
        const { data: urlData } = await getTwitterAuthLink({
            variables: {
                address: mainWallet.publicKey?.toBase58(),
                redirectUri: window.location.origin
            }
        });
        const url = urlData.getTwitterAuth;
        window.open(url);
    };
    const handleLogout = async () => {
        try {
            await disconnect()
                .then(() => {
                    Cookies.remove('auth-nonce');
                    navigate('/home');
                })
                .catch(() => {
                    // silent catch
                });
        } catch (err) {
            console.error(err);
        }
    };

    const handleWithdraw = async () => {
        if (!escrowBal?.getMEEscrowBalance?.balance) {
            return;
        }
        try {
            const { data: instructions } = await getWithdrawTx({
                variables: {
                    buyer: mainWallet.publicKey?.toBase58(),
                    amount: escrowBal?.getMEEscrowBalance?.balance
                }
            });
            const { getMEWithdrawTransactionInstructions: response } = instructions;
            if ((response && response.data) || Object.keys(response).length > 0) {
                const transaction = Transaction.from(Buffer.from(response.txSigned));
                const res = await mainWallet.sendTransaction(transaction, connection);
                await connection.confirmTransaction(res);
                const getTransResp = await connection.getTransaction(res, { commitment: 'confirmed' });
                if (isObject(getTransResp) && getTransResp?.meta?.err === null) {
                    showSuccessToast(
                        <Typography
                            component="a"
                            sx={{ color: '#fff' }}
                            href={`https://solscan.io/tx/${res}`}
                            target="_blank"
                            rel="noreferrer"
                            className="m-auto"
                        >
                            Successfully withdraw {escrowBal?.getMEEscrowBalance?.balance} SOL from bidding wallet.
                        </Typography>
                    );
                } else {
                    showErrorToast('Fail to withdraw.');
                }
            }
        } catch (error) {
            console.error(error);
            showErrorToast('There are some errors, please try again later.');
        } finally {
            refetchEscrow();
        }
    };

    const getAvatar = (proxy = IMAGE_PROXY) => {
        if (auth.user?.avatar) {
            return `${proxy}${auth.user?.avatar}`;
        }
        if (auth.user?.discord?.avatar) {
            return `${proxy}https://cdn.discordapp.com/avatars/${auth.user?.discord?.id}/${auth.user?.discord?.avatar}.png`;
        }
        return `${proxy}${DEFAULT_IMAGE_URL}`;
    };

    useEffect(() => {
        console.log('eth connected', ethConnected);
        // eslint-disable-next-line
    }, [ethConnected, ethAddress]);

    return (
        <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
                <Paper sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgb(36, 24, 47)' : 'white' }}>
                    {open && (
                        <>
                            {showProfile && (
                                <>
                                    <MainCard
                                        border={false}
                                        content={false}
                                        style={{
                                            backgroundColor: 'transparent'
                                        }}
                                    >
                                        {mainWallet.connected && (
                                            <Box sx={{ m: 1, mb: 0 }}>
                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    alignItems="center"
                                                    justifyContent="flex-start"
                                                    sx={{ width: '100%' }}
                                                >
                                                    <Avatar
                                                        src={getAvatar()}
                                                        sx={{
                                                            ...theme.typography.largeAvatar,
                                                            margin: '8px 8px 8px 4px !important',
                                                            cursor: 'pointer',
                                                            backgroundColor: 'transparent'
                                                        }}
                                                        aria-controls={open ? 'menu-list-grow' : undefined}
                                                        aria-haspopup="true"
                                                        color="inherit"
                                                        onClick={() => navigate(`/bundle`)}
                                                    />
                                                    <Stack
                                                        direction="column"
                                                        alignItems="flex-start"
                                                        justifyContent="flex-start"
                                                        sx={{ width: '100%' }}
                                                    >
                                                        <Grid container sx={{ cursor: 'pointer', alignItems: 'center' }}>
                                                            <Grid
                                                                item
                                                                xs={12}
                                                                sx={{ minHeight: 24, alignItems: 'center', display: 'flex' }}
                                                            >
                                                                <Typography variant="h5" noWrap>
                                                                    {auth.user?.vanity ||
                                                                        auth.user?.discord?.name ||
                                                                        auth.user?.twitter?.name ||
                                                                        (publicKey && shortenAddress(publicKey?.toBase58(), 7))}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid container sx={{ alignItems: 'center', ml: -0.875 }}>
                                                            {auth.user?.discord?.name && auth.user?.discord?.discriminator && (
                                                                <Grid item xs={12}>
                                                                    <Typography
                                                                        variant="caption"
                                                                        noWrap
                                                                        sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}
                                                                    >
                                                                        <IconBrandDiscord style={{ height: 14 }} />{' '}
                                                                        {`${auth.user?.discord?.name}#${auth.user?.discord?.discriminator}`}
                                                                    </Typography>
                                                                </Grid>
                                                            )}
                                                            {auth.user?.twitter?.username && (
                                                                <Grid item xs={12}>
                                                                    <Typography
                                                                        variant="caption"
                                                                        noWrap
                                                                        sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}
                                                                    >
                                                                        <IconBrandTwitter style={{ height: 14 }} /> @
                                                                        {auth.user?.twitter?.username}
                                                                    </Typography>
                                                                </Grid>
                                                            )}
                                                        </Grid>
                                                    </Stack>
                                                </Stack>
                                            </Box>
                                        )}
                                    </MainCard>
                                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                                        {!isEmpty(auth.user?.discord) ? (
                                            <>
                                                {!auth.user?.discord?.membership && (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        onClick={handleDiscordConnect}
                                                        sx={{
                                                            backgroundColor: '#5865F2',
                                                            '&:hover': {
                                                                backgroundColor: 'hsl(235,calc(var(--saturation-factor, 1)*86.1%),71.8%)'
                                                            },
                                                            gap: 1
                                                        }}
                                                    >
                                                        <img src={DiscordLogo} alt="Discord" width="18" />
                                                        Verify
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {auth.token && (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        onClick={handleDiscordConnect}
                                                        sx={{
                                                            backgroundColor: '#5865F2',
                                                            '&:hover': {
                                                                backgroundColor: 'hsl(235,calc(var(--saturation-factor, 1)*86.1%),71.8%)'
                                                            },
                                                            gap: 1
                                                        }}
                                                    >
                                                        <img src={DiscordLogo} alt="Discord" width="18" />
                                                        Connect
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                        {!auth.user?.twitter?.username && auth.token && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={handleTwitterConnect}
                                                sx={{
                                                    backgroundColor: '#fff',
                                                    '&:hover': {
                                                        backgroundColor: '#1D9BF022'
                                                    },
                                                    gap: 1,
                                                    color: '#1D9BF0'
                                                }}
                                            >
                                                <img src={TwitterLogo} alt="Twitter" width="18" />
                                                Connect
                                            </Button>
                                        )}
                                    </Stack>
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                        justifyContent="center"
                                        style={{ marginTop: 10, display: 'none' }}
                                    >
                                        <Badge variant="dot" color="secondary">
                                            <Link
                                                to={{
                                                    pathname: `/quests`
                                                }}
                                                style={{
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                <Button variant="contained" size="small" startIcon={<IconBook />}>
                                                    Quests
                                                </Button>
                                            </Link>
                                        </Badge>
                                        <Badge variant="dot" color="secondary">
                                            <Link
                                                to={{
                                                    pathname: `/rewards`
                                                }}
                                                style={{
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                <Button variant="contained" size="small" startIcon={<IconAward />}>
                                                    Rewards
                                                </Button>
                                            </Link>
                                        </Badge>
                                    </Stack>
                                </>
                            )}
                            <MainCard
                                border={false}
                                elevation={16}
                                content={false}
                                boxShadow
                                shadow={theme.shadows[16]}
                                sx={{ backgroundColor: 'transparent' }}
                            >
                                {mainWallet.connected && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            pt: 0,
                                            width: '100%',
                                            minWidth: 260,
                                            [theme.breakpoints.down('md')]: {
                                                minWidth: '100%'
                                            }
                                        }}
                                    >
                                        {auth.user?.vanity && (
                                            <Stack
                                                direction="row"
                                                spacing={0.5}
                                                alignItems="center"
                                                justifyContent="flex-start"
                                                sx={{ p: 0.5, maxWidth: '100%' }}
                                            >
                                                <Tooltip title="View Wallet Portfolio">
                                                    <Grid container sx={{ mt: 1, justifyContent: 'space-between' }}>
                                                        <Grid
                                                            item
                                                            xs={12}
                                                            sx={{
                                                                mb: 1,
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                backgroundColor:
                                                                    theme.palette.mode === 'dark' ? '#09080d' : 'primary.light',
                                                                borderRadius: '.75rem',
                                                                p: 1,
                                                                cursor: 'pointer',
                                                                gap: 1
                                                            }}
                                                            onClick={() => navigate(`/account/${auth.user?.wallet}`)}
                                                        >
                                                            <IconEye />
                                                            <Typography noWrap>{shortenAddress(auth.user?.wallet, 7)}</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Tooltip>
                                            </Stack>
                                        )}

                                        {wallet && publicKey && (
                                            <WalletValueSection
                                                title="Main Wallet"
                                                wallet={publicKey?.toBase58()}
                                                open={open}
                                                handleWithdraw={handleWithdraw}
                                                showEscrow
                                                escrowBal={escrowBal}
                                            />
                                        )}

                                        <Divider sx={{ mt: 1, mb: 1 }} />
                                        {ethConnected ? (
                                            <>
                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    alignItems="center"
                                                    justifyContent="flex-start"
                                                    sx={{ p: 0.5, maxWidth: '100%' }}
                                                >
                                                    <Grid container sx={{ mt: 1, justifyContent: 'space-between' }}>
                                                        <Grid
                                                            item
                                                            xs={12}
                                                            sx={{
                                                                mb: 1,
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                backgroundColor:
                                                                    theme.palette.mode === 'dark' ? '#09080d' : 'primary.light',
                                                                borderRadius: '.75rem',
                                                                p: 1
                                                            }}
                                                        >
                                                            <Typography noWrap>{ethAddress && shortenAddress(ethAddress, 7)}</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Stack>
                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    alignItems="center"
                                                    justifyContent="flex-start"
                                                    sx={{ p: 0.5 }}
                                                >
                                                    <Avatar
                                                        src={EthLogo}
                                                        sx={{
                                                            ...theme.typography.mediumAvatar,
                                                            width: 24,
                                                            height: 24
                                                        }}
                                                        aria-controls={open ? 'menu-list-grow' : undefined}
                                                        aria-haspopup="true"
                                                        color="inherit"
                                                    />
                                                    <Stack direction="column" alignItems="flex-start" justifyContent="flex-start">
                                                        <Typography variant="body1" fontWeight="400" sx={{ ml: 1 }}>
                                                            Main Wallet
                                                        </Typography>
                                                        {wallet && (
                                                            <Typography variant="body1" fontWeight="800" sx={{ ml: 1 }}>
                                                                {(ethBalance || 0).toLocaleString()} ETH
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                    {/* <Button onClick={() => getWalletNfts(ethAddress)}>GET NFTS</Button> */}
                                                </Stack>
                                            </>
                                        ) : (
                                            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => ethConnect()}
                                                    sx={{
                                                        backgroundColor: '#5865F2',
                                                        '&:hover': {
                                                            backgroundColor: 'hsl(235,calc(var(--saturation-factor, 1)*86.1%),71.8%)'
                                                        },
                                                        gap: 1
                                                    }}
                                                >
                                                    <img src={MetamaskLogo} alt="" style={{ width: 18, height: 18 }} />
                                                    <span style={{ whiteSpace: 'nowrap' }}>Connect Metamask</span>
                                                </Button>
                                            </Stack>
                                        )}
                                        <Divider sx={{ mt: 1, mb: 1 }} />
                                        {/* <Stack
                                    direction="row"
                                    spacing={0.5}
                                    alignItems="center"
                                    justifyContent="flex-start"
                                    sx={{
                                        p: 0.5,
                                        mb: 1,
                                        borderRadius: '4px',
                                        '&:hover': {
                                            cursor: 'pointer',
                                            transition: 'all .1s ease-in-out',
                                            background: theme.palette.primary.dark
                                        }
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            ...theme.typography.mediumAvatar,
                                            cursor: 'pointer'
                                        }}
                                        aria-controls={open ? 'menu-list-grow' : undefined}
                                        aria-haspopup="true"
                                        color="inherit"
                                    >
                                        <IconAward stroke={1.5} size="1.3rem" />
                                    </Avatar>
                                    <Stack direction="column" alignItems="flex-start" justifyContent="flex-start">
                                        <Typography variant="body1" fontWeight="800" sx={{ ml: 1 }}>
                                            Rewards
                                        </Typography>
                                    </Stack>
                                </Stack> */}
                                        {/* <Stack
                                    direction="row"
                                    spacing={0.5}
                                    alignItems="center"
                                    justifyContent="flex-start"
                                    sx={{
                                        p: 0.5,
                                        mb: 1,
                                        borderRadius: '4px',
                                        '&:hover': {
                                            cursor: 'pointer',
                                            transition: 'all .1s ease-in-out',
                                            background: theme.palette.primary.dark
                                        }
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            ...theme.typography.mediumAvatar,
                                            cursor: 'pointer'
                                        }}
                                        aria-controls={open ? 'menu-list-grow' : undefined}
                                        aria-haspopup="true"
                                        color="inherit"
                                    >
                                        <IconRefresh stroke={1.5} size="1.3rem" />
                                    </Avatar>
                                    <Stack direction="column" alignItems="flex-start" justifyContent="flex-start">
                                        <Typography variant="body1" fontWeight="800" sx={{ ml: 1 }}>
                                            Change Provider
                                        </Typography>
                                    </Stack>
                                </Stack> */}
                                        <Stack
                                            direction="row"
                                            spacing={0.5}
                                            alignItems="center"
                                            justifyContent="flex-start"
                                            onClick={() => navigate(`/bundle`)}
                                            sx={{
                                                p: 0.5,
                                                mb: 1,
                                                borderRadius: '4px',
                                                '&:hover': {
                                                    cursor: 'pointer',
                                                    transition: 'all .1s ease-in-out',
                                                    background: theme.palette.primary.dark
                                                }
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    ...theme.typography.mediumAvatar,
                                                    cursor: 'pointer'
                                                }}
                                                aria-controls={open ? 'menu-list-grow' : undefined}
                                                aria-haspopup="true"
                                                color="inherit"
                                            >
                                                <IconBook stroke={1.5} size="1.3rem" />
                                            </Avatar>
                                            <Stack direction="column" alignItems="flex-start" justifyContent="flex-start">
                                                <Typography variant="body1" fontWeight="800" sx={{ ml: 1 }}>
                                                    View Bundle
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                        <Stack
                                            direction="row"
                                            spacing={0.5}
                                            alignItems="center"
                                            justifyContent="flex-start"
                                            onClick={() => setShowBundleView(true)}
                                            sx={{
                                                p: 0.5,
                                                mb: 1,
                                                borderRadius: '4px',
                                                '&:hover': {
                                                    cursor: 'pointer',
                                                    transition: 'all .1s ease-in-out',
                                                    background: theme.palette.primary.dark
                                                }
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    ...theme.typography.mediumAvatar,
                                                    cursor: 'pointer'
                                                }}
                                                aria-controls={open ? 'menu-list-grow' : undefined}
                                                aria-haspopup="true"
                                                color="inherit"
                                            >
                                                <IconBookUpload stroke={1.5} size="1.3rem" />
                                            </Avatar>
                                            <Stack direction="column" alignItems="flex-start" justifyContent="flex-start">
                                                <Typography variant="body1" fontWeight="800" sx={{ ml: 1 }}>
                                                    Add Wallet to Bundle
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                        <Stack
                                            direction="row"
                                            spacing={0.5}
                                            alignItems="center"
                                            justifyContent="flex-start"
                                            onClick={() => handleToggle()}
                                            sx={{
                                                p: 0.5,
                                                mb: 1,
                                                borderRadius: '4px',
                                                '&:hover': {
                                                    cursor: 'pointer',
                                                    transition: 'all .1s ease-in-out',
                                                    background: theme.palette.primary.dark
                                                }
                                            }}
                                        >
                                            <Badge
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right'
                                                }}
                                                badgeContent={unreadCount}
                                                color="secondary"
                                            >
                                                <Avatar
                                                    sx={{
                                                        ...theme.typography.mediumAvatar,
                                                        cursor: 'pointer'
                                                    }}
                                                    aria-controls={open ? 'menu-list-grow' : undefined}
                                                    aria-haspopup="true"
                                                    color="inherit"
                                                >
                                                    <IconBell stroke={1.5} size="1.3rem" />
                                                </Avatar>
                                            </Badge>
                                            <Stack direction="column" alignItems="flex-start" justifyContent="flex-start">
                                                <Typography variant="body1" fontWeight="800" sx={{ ml: 1 }}>
                                                    Notifications
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                        <Stack
                                            direction="row"
                                            spacing={0.5}
                                            alignItems="center"
                                            justifyContent="flex-start"
                                            onClick={handleLogout}
                                            sx={{
                                                p: 0.5,
                                                mb: 1,
                                                borderRadius: '4px',
                                                '&:hover': {
                                                    cursor: 'pointer',
                                                    transition: 'all .1s ease-in-out',
                                                    background: theme.palette.primary.dark
                                                }
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    ...theme.typography.mediumAvatar,
                                                    cursor: 'pointer'
                                                }}
                                                aria-controls={open ? 'menu-list-grow' : undefined}
                                                aria-haspopup="true"
                                                color="inherit"
                                            >
                                                <IconPower stroke={1.5} size="1.3rem" />
                                            </Avatar>
                                            <Stack direction="column" alignItems="flex-start" justifyContent="flex-start">
                                                <Typography variant="body1" fontWeight="800" sx={{ ml: 1 }}>
                                                    Sign Out
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                )}
                            </MainCard>
                        </>
                    )}
                </Paper>
            </Transitions>
        </ClickAwayListener>
    );
};

export default ProfilePopperContext;
