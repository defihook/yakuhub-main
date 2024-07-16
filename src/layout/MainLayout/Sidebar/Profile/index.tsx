/* eslint-disable no-nested-ternary */
import { useEffect, useRef, useState, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Avatar, Box, Popper, Stack, Typography, Grid, Button, Badge } from '@mui/material';
import { IconChevronDown, IconAward, IconBook, IconBrandDiscord, IconBrandTwitter } from '@tabler/icons';

// web3 imports
import { useWallet } from '@solana/wallet-adapter-react';

// project imports
import MainCard from 'components/cards/MainCard';
import { shortenAddress } from 'utils/utils';
import { mutations } from '../../../../graphql/graphql';
import { IMAGE_PROXY, DEFAULT_IMAGE_URL } from 'config/config';
import DiscordLogo from 'assets/images/icons/discord.svg';
import TwitterLogo from 'assets/images/icons/twitter.svg';

// third party
import useAuth from 'hooks/useAuth';
import { isEmpty } from 'lodash';
import useAuthMutation from 'hooks/useAuthMutation';
import { useToasts } from 'hooks/useToasts';
import ProfilePopperContext from '../../../../components/ProfilePopperContent';
// ==============================|| SIDEBAR MENU LIST ||============================== //

const Profile = ({ noPopper }: any) => {
    const theme = useTheme();
    const auth = useAuth();
    const navigate = useNavigate();
    const mainWallet = useWallet();
    const { publicKey } = mainWallet;
    const { showInfoToast } = useToasts();
    const [getDiscordAuthLink] = useAuthMutation(mutations.GET_DISCORD_LINK);
    const [getTwitterAuthLink] = useAuthMutation(mutations.GET_TWITTER_LINK);

    const [open, setOpen] = useState(false);
    const anchorRef = useRef<any>(null);
    const prevOpen = useRef(open);

    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef?.current?.focus();
        }

        prevOpen.current = open;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleToggle = () => {
        if (noPopper) {
            return;
        }
        setOpen((prev) => !prev);
    };

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

    const handleClose = (event: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
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
    return (
        <>
            {!noPopper ? (
                <>
                    <MainCard
                        border={false}
                        content={false}
                        style={{
                            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark[200] : 'transparent'
                        }}
                    >
                        {mainWallet.publicKey && (
                            <Box sx={{ m: 1, mb: 0 }}>
                                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-start" sx={{ width: '100%' }}>
                                    <Avatar
                                        src={getAvatar()}
                                        sx={{
                                            ...theme.typography.largeAvatar,
                                            margin: '8px 8px 8px 4px !important',
                                            cursor: noPopper ? 'inherit' : 'pointer',
                                            backgroundColor: 'transparent'
                                        }}
                                        aria-controls={open ? 'menu-list-grow' : undefined}
                                        aria-haspopup="true"
                                        color="inherit"
                                        onClick={() => navigate(`/bundle`)}
                                    />
                                    <Stack direction="column" alignItems="flex-start" justifyContent="flex-start" sx={{ width: '100%' }}>
                                        <Grid
                                            container
                                            onClick={handleToggle}
                                            sx={{
                                                cursor: noPopper ? 'inherit' : 'pointer',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Grid
                                                item
                                                xs={noPopper ? 12 : 10}
                                                sx={{ minHeight: 24, alignItems: 'center', display: 'flex' }}
                                            >
                                                <Typography variant="h5" noWrap>
                                                    {auth.user?.vanity ||
                                                        auth.user?.discord?.name ||
                                                        auth.user?.twitter?.name ||
                                                        (publicKey && shortenAddress(publicKey?.toBase58(), 7))}
                                                </Typography>
                                            </Grid>
                                            {!noPopper && (
                                                <Grid item xs={2} sx={{ minHeight: 24, alignItems: 'center', display: 'flex' }}>
                                                    <IconChevronDown
                                                        aria-controls={open ? 'menu-list-grow' : undefined}
                                                        aria-haspopup="true"
                                                    />
                                                </Grid>
                                            )}
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
                                                        <IconBrandTwitter style={{ height: 14 }} /> @{auth.user?.twitter?.username}
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
            ) : (
                publicKey && (
                    <Typography
                        variant="caption"
                        sx={{ ...theme.typography.menuCaption, my: '10px', cursor: 'pointer' }}
                        display="block"
                        gutterBottom
                        onClick={() => navigate(`/account`)}
                    >
                        <Grid
                            container
                            sx={{
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Grid
                                item
                                xs={2}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <Avatar
                                    src={getAvatar()}
                                    sx={{
                                        width: '24px',
                                        height: '24px',
                                        objectFit: 'cover',
                                        cursor: noPopper ? 'inherit' : 'pointer',
                                        backgroundColor: 'transparent'
                                    }}
                                    aria-controls={open ? 'menu-list-grow' : undefined}
                                    aria-haspopup="true"
                                    color="inherit"
                                />
                            </Grid>
                            <Grid
                                item
                                xs={9}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography variant="h5" noWrap>
                                    My Profile
                                </Typography>
                            </Grid>
                        </Grid>
                    </Typography>
                )
            )}
            <Popper
                placement="bottom"
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                style={{
                    zIndex: 3000,
                    position: 'absolute',
                    transform: auth.user?.twitter?.username && auth.user?.discord?.id ? 'translate(0px, 80px)' : 'translate(0px, 60px)',
                    inset: '0px auto auto 0px'
                }}
            >
                {({ TransitionProps }) => <ProfilePopperContext open={open} handleClose={handleClose} TransitionProps={TransitionProps} />}
            </Popper>
        </>
    );
};

export default memo(Profile);
