// material-ui
import { useTheme } from '@mui/material/styles';
import { Avatar, Box, useMediaQuery, IconButton } from '@mui/material';
// import { ShoppingCartCheckout } from '@mui/icons-material';
// web3 imports
import { useWallet } from '@solana/wallet-adapter-react';

// project imports
import { useCartItems } from 'contexts/CartContext';
import SearchSection from './SearchSection';
import MobileSection from './MobileSection';
import NotificationSection from './NotificationSection';
import Customization from './Customization';
import { useDispatch, useSelector } from 'store';
import { openDrawer } from 'store/slices/menu';

// assets
import { IconMenu2, IconShoppingCart } from '@tabler/icons';
import LogoSection from '../LogoSection';
import ProfileSection from './ProfileSection';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = () => {
    const theme = useTheme();

    const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
    const { connected } = useWallet();

    const dispatch = useDispatch();
    const { drawerOpen } = useSelector((state) => state.menu);
    const { isOpen, setOpen } = useCartItems();

    return (
        <>
            {/* logo & toggler button */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    [theme.breakpoints.down('md')]: {
                        width: 'auto'
                    }
                }}
            >
                <Box
                    component="span"
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        flexGrow: 1
                    }}
                >
                    <LogoSection />
                </Box>
                {!matchUpMd && (
                    <Avatar
                        variant="rounded"
                        sx={{
                            ...theme.typography.commonAvatar,
                            ...theme.typography.mediumAvatar,
                            overflow: 'hidden',
                            transition: 'all .2s ease-in-out',
                            background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
                            color: theme.palette.mode === 'dark' ? 'white' : theme.palette.secondary.dark,
                            '&:hover': {
                                background: theme.palette.mode === 'dark' ? 'white' : theme.palette.secondary.dark,
                                color: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.light
                            }
                        }}
                        onClick={() => dispatch(openDrawer(!drawerOpen))}
                        color="inherit"
                    >
                        <IconMenu2 stroke={1.5} size="1.3rem" />
                    </Avatar>
                )}
            </Box>

            {/* header search */}
            <SearchSection />
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ flexGrow: 1 }} />

            <Avatar
                variant="rounded"
                sx={{
                    ...theme.typography.commonAvatar,
                    ...theme.typography.mediumAvatar,
                    transition: 'all .2s ease-in-out',
                    background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
                    color: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.secondary.dark,
                    '&[aria-controls="menu-list-grow"],&:hover': {
                        background: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.secondary.dark,
                        color: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.secondary.light
                    }
                }}
                aria-haspopup="true"
                onClick={() => setOpen(!isOpen)}
                color="inherit"
            >
                <IconShoppingCart stroke={1.5} size="1.3rem" />
            </Avatar>
            {/* notification & profile */}
            {connected && <NotificationSection />}

            {/* <Customization /> */}
            <ProfileSection />
            {/* mobile header */}
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <MobileSection />
            </Box>
        </>
    );
};

export default Header;
