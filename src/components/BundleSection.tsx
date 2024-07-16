/* eslint-disable react-hooks/exhaustive-deps */
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, List, ListItem, Tooltip, Typography } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { mutations, queries } from '../graphql/graphql';
import useAuthMutation from 'hooks/useAuthMutation';
import { useEffect, useState } from 'react';
import useAuth from 'hooks/useAuth';
import { map } from 'lodash';
import MainCard from './MainCard';
import SearchBox from './SearchBox';
import { PublicKey } from '@solana/web3.js';
import { IconX } from '@tabler/icons';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { LockOutlined } from '@mui/icons-material';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useToasts } from 'hooks/useToasts';

const BundleSection = ({ open, onClose }: any) => {
    const navigate = useNavigate();
    const wallet = useWallet();
    const auth = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isUnlinking, setIsUnlinking] = useState(false);
    const [dstAddress, setDstAddress] = useState('');
    const [bundleWallets, setBundleWallets] = useState<any[]>([]);
    const [linkWallet] = useAuthMutation(mutations.LINK_WALLET);
    const [unlinkWallet] = useAuthMutation(mutations.UNLINK_WALLET);
    const [getSubwallet] = useAuthLazyQuery(queries.GET_ALL_SUBWALLET);

    const { showErrorToast } = useToasts();

    const isPublicKey = (str: string) =>
        new Promise((resolve, reject) => {
            try {
                const result = PublicKey.isOnCurve(str);
                resolve(result);
            } catch (err) {
                resolve(false);
            }
        });
    const searchForAddress = async (addr: string) => {
        setDstAddress(addr);
        const isKey = await isPublicKey(addr);
        if (isKey && !auth.user?.wallets?.includes(addr) && addr !== auth.user.wallet) {
            await handleLinkWallet(addr);
        } else {
            showErrorToast(`Address ${addr} is not valid to be linked.`);
            setDstAddress('');
        }
    };
    const handleLinkWallet = async (addr: string) => {
        if (!addr) {
            return;
        }

        try {
            if (wallet.publicKey && addr) {
                setIsLoading(true);
                await linkWallet({
                    variables: {
                        user: auth.user?.id,
                        wallet: addr
                    }
                });
                setDstAddress('');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            updateSubWallets();
        }
    };

    const handleUnlinkWallet = async (addr: string) => {
        if (!addr) {
            return;
        }
        try {
            setIsUnlinking(true);
            await unlinkWallet({
                variables: {
                    user: auth.user?.id,
                    wallet: addr
                }
            });
        } catch (error) {
            console.error(error);
        } finally {
            await updateSubWallets();
            setIsUnlinking(false);
        }
    };

    const updateSubWallets = async () => {
        if (auth.user.id) {
            const { data: subwallets } = await getSubwallet({ variables: { user: auth.user.id }, fetchPolicy: 'network-only' });
            console.log(subwallets);
            if (subwallets && subwallets.getAllLinkedWallet) {
                auth.setUserData({
                    ...auth.user,
                    wallets: map(subwallets.getAllLinkedWallet, ({ wallet: address }: any) => address)
                });
                setBundleWallets([auth.user.wallet, ...map(subwallets.getAllLinkedWallet, ({ wallet: address }: any) => address)]);
            }
        }
    };

    useEffect(() => {
        updateSubWallets();
    }, [auth.user?.id]);

    return (
        <Dialog
            sx={{
                width: '100%',
                p: 2
            }}
            open={open}
            onClose={onClose}
        >
            <DialogContent>
                <DialogTitle>
                    <Typography fontSize={18} fontWeight={700}>
                        Manage Bundle
                    </Typography>
                    <Typography fontSize={14} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        Your bundle is private <LockOutlined sx={{ width: 16 }} />
                    </Typography>
                </DialogTitle>
                <SearchBox
                    sx={{ ml: 0, mb: 2 }}
                    placeholder="Search for address"
                    value={dstAddress}
                    params={{ onChange: (e: any) => searchForAddress(e.target.value) }}
                />
                <Box sx={{ display: 'flex', gap: 1, alignitems: 'center', my: 2 }}>
                    {isLoading && <Typography>Processing...</Typography>}
                    {isUnlinking && <Typography>Unlinking...</Typography>}
                    {(isLoading || isUnlinking) && <CircularProgress color="secondary" />}
                </Box>
                <MainCard border={false} sx={{ p: 1, backgroundColor: '#09080d' }}>
                    <Typography fontSize={16} fontWeight={700}>
                        Linked Wallet
                    </Typography>
                    <List>
                        {map(bundleWallets, (w, i) => (
                            <ListItem key={i} sx={{ justifyContent: 'space-between', p: 0, width: '100%' }}>
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
                                    <Tooltip title="View Wallet">
                                        <IconButton onClick={() => navigate(`/account/${w}`)}>
                                            <EyeOutlined />
                                        </IconButton>
                                    </Tooltip>
                                    {w}
                                </Box>
                                {i > 0 && (
                                    <IconButton onClick={() => handleUnlinkWallet(w)}>
                                        <IconX />
                                    </IconButton>
                                )}
                            </ListItem>
                        ))}
                    </List>
                </MainCard>
            </DialogContent>
        </Dialog>
    );
};

export default BundleSection;
