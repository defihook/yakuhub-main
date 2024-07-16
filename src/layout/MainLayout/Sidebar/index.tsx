import { memo, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Drawer, useMediaQuery, Popper, Paper, ClickAwayListener, Divider, Avatar, Button } from '@mui/material';
import { Add, MoreHorizRounded } from '@mui/icons-material';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useWallet } from '@solana/wallet-adapter-react';
import { useDispatch, useSelector } from 'store';

// project imports
import MenuList from './MenuList';
import MenuListCollapsed from './MenuListCollapsed';
import Profile from './Profile';
import Logo from 'components/Logo';
import MainCard from 'components/cards/MainCard';
import SocialSection from './SocialSection';
import { openDrawer } from 'store/slices/menu';
import { drawerWidth, drawerWidthCollapsed } from 'store/constant';

// ==============================|| SIDEBAR DRAWER ||============================== //

interface SidebarProps {
    window?: Window;
    sticky?: boolean;
}

const Sidebar = ({ window, sticky }: SidebarProps) => {
    const showProfile = true;
    const theme = useTheme();
    const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<any>(null);
    const wallet = useWallet();

    const dispatch = useDispatch();
    const { drawerOpen, hasWorkspace } = useSelector((state: any) => state.menu);

    const logo = useMemo(
        () => (
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        p: 2,
                        mx: 'auto'
                    }}
                >
                    <Logo />
                </Box>
            </Box>
        ),
        []
    );

    const drawer = useMemo(
        () => (
            <PerfectScrollbar
                component="div"
                style={{
                    height: !matchUpMd ? 'calc(100vh - 56px - 96px)' : 'calc(100vh - 120px - 86px)',
                    paddingLeft: '16px',
                    paddingRight: '16px'
                }}
            >
                {showProfile && <Profile noPopper />}
                <MenuList />
                <Divider />
                <Link to={hasWorkspace ? '/workspaces' : '/workspaces/create'}>
                    <Button variant="contained" sx={{ backgroundColor: '#f38aff' }} className="w-full my-3 rounded-xl">
                        {hasWorkspace ? (
                            'My WorkSpaces'
                        ) : (
                            <>
                                <Add sx={{ fontSize: 22, marginRight: 1 }} /> Create WorkSpace
                            </>
                        )}
                    </Button>
                </Link>
            </PerfectScrollbar>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [matchUpMd, wallet.publicKey, hasWorkspace]
    );

    const drawerClosed = useMemo(
        () => (
            <PerfectScrollbar
                component="div"
                style={{
                    height: !matchUpMd ? 'calc(100vh - 56px - 56px)' : 'calc(100vh - 120px - 56px)',
                    paddingLeft: '10px',
                    paddingRight: '10px'
                }}
            >
                <MenuListCollapsed />
            </PerfectScrollbar>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [matchUpMd]
    );

    const container = window !== undefined ? () => window.document.body : undefined;

    const handleClose = (event: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    return (
        <Box
            component="nav"
            sx={{
                flexShrink: { md: 0 },
                width: matchUpMd ? drawerWidth : 'auto'
            }}
            aria-label="mailbox folders"
        >
            <Drawer
                container={container}
                variant={matchUpMd ? 'persistent' : 'temporary'}
                anchor="left"
                open={drawerOpen}
                transitionDuration={{
                    enter: 400,
                    exit: 400
                }}
                onClose={() => dispatch(openDrawer(!drawerOpen))}
                sx={{
                    zIndex: 900,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        background: theme.palette.background.default,
                        color: theme.palette.text.primary,
                        borderRight: 'none',
                        [theme.breakpoints.up('md')]: {
                            top: '120px'
                        },
                        marginTop: sticky ? '-30px' : '0px',
                        transition: 'margin-top .2s'
                    },
                    position: 'relative'
                }}
                ModalProps={{ keepMounted: true }}
                color="inherit"
                onMouseLeave={(e) => {
                    e.preventDefault();
                    if (matchUpMd) {
                        setTimeout(() => {
                            dispatch(openDrawer(!drawerOpen));
                            handleClose(e);
                        }, 200);
                    }
                }}
            >
                {drawerOpen && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
                        {logo}
                        {drawer}
                        <Box>
                            <SocialSection />
                        </Box>
                    </Box>
                )}
            </Drawer>

            {matchUpMd && (
                <Drawer
                    container={container}
                    variant={matchUpMd ? 'persistent' : 'temporary'}
                    anchor="left"
                    open={!drawerOpen}
                    transitionDuration={{
                        appear: 400,
                        enter: 200,
                        exit: 200
                    }}
                    onClose={() => dispatch(openDrawer(drawerOpen))}
                    sx={{
                        zIndex: 900,
                        '& .MuiDrawer-paper': {
                            width: drawerWidthCollapsed,
                            background: theme.palette.background.default,
                            color: theme.palette.text.primary,
                            borderRight: 'none',
                            [theme.breakpoints.up('md')]: {
                                top: '120px'
                            },
                            marginTop: sticky ? '-30px' : '0px',
                            transition: 'margin-top .2s',
                            pt: 1
                        }
                    }}
                    ModalProps={{ keepMounted: true }}
                    color="inherit"
                    onMouseEnter={(e) => {
                        e.preventDefault();
                        dispatch(openDrawer(!drawerOpen));
                        setOpen(true);
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
                        <>
                            {drawerOpen && logo}
                            {!drawerOpen && drawerClosed}
                        </>

                        <Avatar
                            sx={{
                                ...theme.typography.largeAvatar,
                                width: 24,
                                height: 24,
                                margin: '10px auto 10px auto !important',
                                cursor: 'pointer',
                                backgroundColor: 'transparent'
                            }}
                        >
                            <MoreHorizRounded htmlColor={theme.palette.mode === 'dark' ? 'white' : 'black'} />{' '}
                        </Avatar>
                    </Box>
                </Drawer>
            )}

            <Popper
                placement="left"
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                style={{ position: 'fixed', top: 95, left: 0, zIndex: 999, width: drawerWidth, borderRadius: 0 }}
                onMouseLeave={handleClose}
            >
                {({ TransitionProps }) => (
                    <ClickAwayListener onClickAway={handleClose}>
                        {/* <Transitions in={open} {...TransitionProps}> */}
                        <Paper style={{ borderRadius: 0 }}>
                            {open && (
                                <MainCard border content={false}>
                                    {!drawerOpen && drawer}
                                </MainCard>
                            )}
                        </Paper>
                        {/* </Transitions> */}
                    </ClickAwayListener>
                )}
            </Popper>
        </Box>
    );
};

export default memo(Sidebar);
