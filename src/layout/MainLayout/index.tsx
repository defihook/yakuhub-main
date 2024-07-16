/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';

// material-ui
import { styled, useTheme, Theme } from '@mui/material/styles';
import { AppBar, Box, Container, CssBaseline, Toolbar, Typography, useMediaQuery } from '@mui/material';

// dialect on chain chat
import { BottomChat } from '@dialectlabs/react-ui';

// project imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import Header from './Header';
import Sidebar from './Sidebar';
import Cart from './Cart';
import navigation from 'menu-items';
import useConfig from 'hooks/useConfig';
import { drawerWidth, cartWidth, drawerWidthCollapsed } from 'store/constant';
import { activeItem, openDrawer } from 'store/slices/menu';
import { useDispatch, useSelector } from 'store';
// assets
import { useEthPrice, useSolPrice } from 'contexts/CoinGecko';
import { useYakuPrice, useYakuUSDCPrice } from 'contexts/JupitarContext';
import { useTPSValue } from 'contexts/TPSContext';
import { useCartItems } from 'contexts/CartContext';
import { useWallet } from '@solana/wallet-adapter-react';
import useAuth from 'hooks/useAuth';
import useAuthMutation from 'hooks/useAuthMutation';
import { mutations } from '../../graphql/graphql';
import LocalizationSection from './Header/LocalizationSection';
import moment from 'moment';
import { useMeta } from 'contexts/meta/meta';

interface MainStyleProps {
    theme: Theme;
    open: boolean;
    openedcart: boolean;
}

// styles
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open, openedcart }: MainStyleProps) => ({
    ...theme.typography.mainContent,
    ...(!open && {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeInOut,
            duration: 400
        }),
        [theme.breakpoints.up('md')]: {
            marginLeft: -drawerWidth + drawerWidthCollapsed,
            marginRight: openedcart && cartWidth,
            width: `calc(100% - ${drawerWidthCollapsed}px - ${openedcart && cartWidth}px)`
        },
        [theme.breakpoints.down('md')]: {
            marginLeft: '20px',
            width: `calc(100% - ${drawerWidthCollapsed}px - ${openedcart && cartWidth}px)`,
            padding: '16px'
        },
        [theme.breakpoints.down('sm')]: {
            marginLeft: '10px',
            width: `calc(100% - ${drawerWidthCollapsed}px - ${openedcart && cartWidth}px)`,
            padding: '16px',
            marginRight: '10px'
        }
    }),
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeInOut,
            duration: 400
        }),
        marginLeft: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        width: `calc(100% - ${drawerWidth}px - ${openedcart && cartWidth}px)`,
        [theme.breakpoints.down('md')]: {
            marginLeft: '20px'
        },
        [theme.breakpoints.down('sm')]: {
            marginLeft: '10px'
        }
    })
}));

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
    const theme = useTheme();
    const auth = useAuth();
    const matchDownMd = useMediaQuery(theme.breakpoints.down('lg'));
    const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));

    const wallet = useWallet();
    const dispatch = useDispatch();
    const solPrice = useSolPrice() || 0;
    const ethPrice = useEthPrice() || 0;
    const yakuPrice = useYakuPrice() || 0;
    const yakuUSDCPrice = useYakuUSDCPrice() || 0;
    const { drawerOpen } = useSelector((state: any) => state.menu);
    const { container } = useConfig();
    const tps = useTPSValue();
    const { sticky } = useMeta();

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [exCode, setExCode] = useState('');
    const [connectDiscord] = useAuthMutation(mutations.DISCORD_AUTH);
    const [connectTwitter] = useAuthMutation(mutations.TWITTER_AUTH);
    const { isOpen } = useCartItems();

    useEffect(() => {
        dispatch(openDrawer(!matchDownMd));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchDownMd]);
    useEffect(() => {
        const code = searchParams?.get('code') || exCode;
        const state = searchParams?.get('state');
        if (code && auth.token) {
            console.log('Wallet is connected, with Code:', code);
            setExCode(code);
            if (state === 'connect-twitter') {
                connectTwitter({
                    variables: {
                        address: wallet?.publicKey?.toBase58(),
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
                        address: wallet?.publicKey?.toBase58(),
                        code,
                        redirectUri: window.location.origin
                    }
                }).then(({ data: resp }) => {
                    if (resp && resp.discordAuth) {
                        auth.setUserData(resp.discordAuth);
                    }
                });
            }
        }
    }, [auth.token]);
    useEffect(() => {
        const code = searchParams?.get('code') || exCode;
        const state = searchParams?.get('state');
        let queryString = '';
        if (code) {
            queryString = `?code=${code}`;
        }
        if (state) {
            queryString = `${queryString}&state=${state}`;
        }
        if (window.location.pathname !== '/') {
            console.log(window.location.pathname);
            navigate(`${window.location.pathname}${queryString}`, { replace: true });
        } else {
            navigate(`home${queryString}`, { replace: true });
        }
    }, [wallet.connected]);
    useEffect(() => {
        if (window.location.pathname && window.location.pathname.includes('home')) {
            dispatch(activeItem(['home']));
        }
    }, [window.location.pathname]);

    const header = useMemo(
        () => (
            <Toolbar sx={{ paddingTop: 0 }}>
                <Header />
            </Toolbar>
        ),
        []
    );

    return (
        <>
            <Box sx={{ display: 'flex', mb: '1rem' }}>
                <CssBaseline />

                {/* header */}
                <AppBar
                    enableColorOnDark
                    position="fixed"
                    color="inherit"
                    elevation={0}
                    sx={{
                        bgcolor: theme.palette.background.default,
                        transition: drawerOpen ? theme.transitions.create('width') : 'none',
                        '.MuiToolbar-root': {
                            paddingLeft: '18px',
                            paddingRight: '18px',
                            paddingTop: '16px',
                            paddingBottom: '16px'
                        }
                    }}
                >
                    <Container
                        maxWidth="xl"
                        sx={{
                            display: 'flex',
                            maxWidth: '100% !important',
                            py: 1,
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(36, 24, 47, 0.85)' : theme.palette.background.default,
                            justifyContent: 'center',
                            gap: 2,
                            marginTop: sticky > 108 ? '-30px' : '0px',
                            transition: 'margin-top .2s'
                        }}
                    >
                        <Typography component="p" fontSize={10}>
                            Solana:{' '}
                            <Typography component="span" color="secondary" fontSize={10}>
                                ${solPrice}
                            </Typography>
                        </Typography>
                        <Typography component="p" sx={{ display: { xs: 'none', sm: 'block' } }} fontSize={10}>
                            Ethereum:{' '}
                            <Typography component="span" color="secondary" fontSize={10}>
                                ${ethPrice}
                            </Typography>
                        </Typography>
                        <Typography component="p" sx={{ display: 'none' }} fontSize={10}>
                            Yaku/Sol:{' '}
                            <Typography component="span" color="secondary" fontSize={10}>
                                {yakuPrice.toFixed(6)} ◎
                            </Typography>
                        </Typography>
                        <Typography component="p" sx={{ display: { xs: 'none', md: 'block' } }} fontSize={10}>
                            Yaku/USDC:{' '}
                            <Typography component="span" color="secondary" fontSize={10}>
                                ${yakuUSDCPrice.toFixed(4)}
                            </Typography>
                        </Typography>
                        <Typography component="p" fontSize={10}>
                            Current Solana TPS:{' '}
                            <Typography component="span" color="secondary" fontSize={10}>
                                {tps}
                            </Typography>
                        </Typography>
                        {matchUpMd && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    right: '18px',
                                    top: 8,
                                    marginTop: sticky > 108 ? '-30px' : '0px',
                                    transition: 'margin-top .2s'
                                }}
                            >
                                <LocalizationSection />
                            </Box>
                        )}
                    </Container>
                    {header}
                </AppBar>

                {/* drawer */}
                <Sidebar sticky={sticky > 108} />

                {/* main content */}
                <Main theme={theme} open={drawerOpen} openedcart={isOpen} className="max-sm:px-4 max-sm:mx-0">
                    {/* breadcrumb */}
                    {container ? (
                        <Container maxWidth="lg">
                            <Breadcrumbs navigation={navigation} title={false} titleBottom={false} card={false} divider={false} />
                            <Outlet />
                        </Container>
                    ) : (
                        <>
                            <Breadcrumbs navigation={navigation} title={false} titleBottom={false} card={false} divider={false} />
                            <Outlet />
                        </>
                    )}
                    {isOpen && <Cart />}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <BottomChat dialectId="dialect-bottom-chat" />
                    </Box>
                </Main>
            </Box>
            <Box sx={{ width: '100%', pb: 2 }}>
                <Typography fontSize={10} sx={{ px: 2, textAlign: 'center', width: '100%' }}>
                    © {moment().get('y')} Yaku. All right reserved.
                </Typography>
            </Box>
        </>
    );
};

export default MainLayout;
