/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// web3 imports
import { useWallet } from '@solana/wallet-adapter-react';

// project imports
import { useAccess } from 'hooks/useAccess';
import { useToasts } from 'hooks/useToasts';
import defaultConfig from 'config';
import { GuardProps } from 'types';
import Loader from 'components/Loader';
import { YAKU_COLLECTION_CREATORS } from 'config/config';
import useAuth from 'hooks/useAuth';
import { Dialog, useMediaQuery, useTheme } from '@mui/material';
import WalletLogin from 'views/pages/authentication/auth-components/WalletLogin';

/**
 * Yaku collection guard for routes having a Yaku NFT required to visit
 * @param {PropTypes.node} children children element/node
 */
const YakuGuard = ({ children }: GuardProps) => {
    const theme = useTheme();
    const { showErrorToast } = useToasts();
    const { checkAccess } = useAccess();
    const { pass, signed } = useAuth();
    const { publicKey } = useWallet();
    const navigate = useNavigate();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleClose = () => {
        setOpen(false);
    };
    async function findYakuAuth() {
        if (publicKey) {
            const hasAccess = await checkAccess(publicKey, YAKU_COLLECTION_CREATORS);
            if (!hasAccess) {
                showErrorToast('You do not have access to these routes, purchase a Yaku collection to gain access.');
                navigate(defaultConfig.defaultPath, { replace: true });
            } else {
                pass();
            }
            if (!signed) {
                setOpen(true);
            }
        } else {
            setOpen(true);
        }
    }

    useEffect(() => {
        findYakuAuth().then(() => {
            setIsLoading(false);
        });
    }, [publicKey]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <>
            {signed && children}
            <Dialog open={open} disableEscapeKeyDown fullScreen={fullScreen} sx={{ '.MuiPaper-root': { p: 0 } }}>
                <WalletLogin dismiss={handleClose} requireSign />
            </Dialog>
        </>
    );
};

export default YakuGuard;
