/* eslint-disable no-nested-ternary */
import { useEffect, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Avatar, Badge, Button, IconButton, Popper } from '@mui/material';

// web3 imports
import { useWallet } from '@solana/wallet-adapter-react';

// project imports
import useAuth from 'hooks/useAuth';

// assets
import { DEFAULT_IMAGE_URL, IMAGE_PROXY } from 'config/config';
import ProfilePopperContext from 'components/ProfilePopperContent';
import useWallets from 'hooks/useWallets';
import { useCartItems } from 'contexts/CartContext';

// ==============================|| PROFILE MENU ||============================== //

const ProfileSection = () => {
    const theme = useTheme();
    const auth = useAuth();
    const mainWallet = useWallet();
    const { setOpen: setLoginOpen } = useWallets();
    const { setOpen: setCartOpen } = useCartItems();

    const [open, setOpen] = useState(false);
    const anchorRef = useRef<any>(null);

    const handleToggle = () => {
        setCartOpen(false);
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    const prevOpen = useRef(open);
    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef?.current?.focus();
        }

        prevOpen.current = open;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

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
            {mainWallet.connected ? (
                <Badge badgeContent={0} color="secondary">
                    <IconButton
                        sx={{
                            height: '34px',
                            ml: 1.5,
                            p: 0,
                            alignItems: 'center',
                            borderRadius: 30000,
                            transition: 'all .2s ease-in-out',
                            borderColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.primary.light,
                            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.primary.light,
                            '&[aria-controls="menu-list-grow"], &:hover': {
                                borderColor: theme.palette.primary.main,
                                background: `${theme.palette.primary.main}!important`,
                                color: theme.palette.primary.light,
                                '& svg': {
                                    stroke: theme.palette.primary.light
                                }
                            }
                        }}
                        ref={anchorRef}
                        aria-controls={open ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        onClick={handleToggle}
                    >
                        <Avatar
                            src={getAvatar()}
                            sx={{
                                ...theme.typography.mediumAvatar,
                                margin: '0 !important',
                                cursor: 'pointer',
                                backgroundColor: 'transparent'
                            }}
                            ref={anchorRef}
                            aria-controls={open ? 'menu-list-grow' : undefined}
                            aria-haspopup="true"
                            color="inherit"
                        />
                    </IconButton>
                </Badge>
            ) : (
                <Button
                    sx={{ borderRadius: 30000, marginLeft: 1 }}
                    color="secondary"
                    variant="contained"
                    onClick={() => setLoginOpen(true)}
                >
                    Connect Wallet
                </Button>
            )}

            <Popper
                placement="bottom"
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 14]
                            }
                        }
                    ]
                }}
            >
                {({ TransitionProps }) => (
                    <ProfilePopperContext handleClose={handleClose} showProfile TransitionProps={TransitionProps} open={open} />
                )}
            </Popper>
        </>
    );
};

export default ProfileSection;
