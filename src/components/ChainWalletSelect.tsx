import { Box, Button, Divider, Grid, Stack, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet, Wallet } from '@solana/wallet-adapter-react';
import useConfig from 'hooks/useConfig';
import { useMemo } from 'react';
import { isMobile } from 'react-device-detect';
import MetaMaskLogo from 'assets/images/icons/metamask.png';

const WalletButton = styled(Button)({
    gap: '5px'
});

const ChainWalletSelect = ({ setIsConnecting, handleClick, handleEtherLogin }: any) => {
    const theme = useTheme();
    const wallet = useWallet();
    const { wallets } = wallet;
    const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
    const { borderRadius } = useConfig();

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
    return (
        <>
            <Grid item xs={12}>
                <Grid container direction={matchDownSM ? 'column-reverse' : 'row'} alignItems="center" justifyContent="center">
                    <Grid item>
                        <Stack alignItems="center" justifyContent="center" spacing={1}>
                            <Typography variant="caption" fontSize="16px" textAlign="center">
                                Please connect your wallet which has access to the Yaku Hub
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={12}>
                <Grid item xs={12}>
                    <Box sx={{ alignItems: 'center', display: 'flex' }}>
                        <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />

                        <Button
                            variant="outlined"
                            sx={{
                                cursor: 'unset',
                                m: 2,
                                py: 0.5,
                                px: 7,
                                borderColor:
                                    theme.palette.mode === 'dark'
                                        ? `${theme.palette.dark.light + 20} !important`
                                        : `${theme.palette.grey[100]} !important`,
                                color: `${theme.palette.grey[900]}!important`,
                                fontWeight: 500,
                                borderRadius: `${borderRadius}px`
                            }}
                            disableRipple
                            disabled
                        >
                            SOLANA
                        </Button>

                        <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
                    </Box>
                </Grid>

                {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
                {listWallets.map((wallet, index) => (
                    <WalletButton
                        key={index}
                        sx={{ mb: 1 }}
                        variant="contained"
                        color="secondary"
                        onClick={() => handleClick(wallet.adapter)}
                        fullWidth
                    >
                        {/* eslint-disable-next-line */}
                        <img src={wallet.adapter.icon} alt="Wallet Image" width={24} height={24} />
                        {wallet.adapter.name}
                    </WalletButton>
                ))}

                {/* ETH WALLETS */}
                {/* <Grid item xs={12}>
                    <Box sx={{ alignItems: 'center', display: 'flex' }}>
                        <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />

                        <Button
                            variant="outlined"
                            sx={{
                                cursor: 'unset',
                                m: 2,
                                py: 0.5,
                                px: 7,
                                borderColor:
                                    theme.palette.mode === 'dark'
                                        ? `${theme.palette.dark.light + 20} !important`
                                        : `${theme.palette.grey[100]} !important`,
                                color: `${theme.palette.grey[900]}!important`,
                                fontWeight: 500,
                                borderRadius: `${borderRadius}px`
                            }}
                            disableRipple
                            disabled
                        >
                            ETHEREUM
                        </Button>

                        <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
                    </Box>
                </Grid>

                <WalletButton variant="contained" color="secondary" onClick={() => handleEtherLogin()} fullWidth>
                    <img src={MetaMaskLogo} alt="MetaMask" width={24} height={24} />
                    MetaMask
                </WalletButton> */}
            </Grid>
        </>
    );
};

export default ChainWalletSelect;
