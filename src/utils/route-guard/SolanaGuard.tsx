/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';

// web3 imports
import { useWallet } from '@solana/wallet-adapter-react';

// project imports
import { GuardProps } from 'types';
import Loader from 'components/Loader';
import { Dialog, useMediaQuery, useTheme } from '@mui/material';
import WalletLogin from 'views/pages/authentication/auth-components/WalletLogin';

/**
 * Yaku collection guard for routes having a Yaku NFT required to visit
 * @param {PropTypes.node} children children element/node
 */
const SolanaGuard = ({ children }: GuardProps) => {
    const theme = useTheme();
    const { publicKey } = useWallet();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <>
            {publicKey && children}
            <Dialog open={!publicKey} disableEscapeKeyDown fullScreen={fullScreen} sx={{ '.MuiPaper-root': { p: 0 } }}>
                <WalletLogin />
            </Dialog>
        </>
    );
};

export default SolanaGuard;
