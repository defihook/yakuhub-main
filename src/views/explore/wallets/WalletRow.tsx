import { useEffect, useState } from 'react';
import _ from 'lodash';
import { Grid, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { useNavigate } from 'react-router-dom';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useMeta } from 'contexts/meta/meta';
import useConnections from 'hooks/useConnetions';
import useAuth from 'hooks/useAuth';

import WalletRowSkeleton from './WalletRowSkeleton';

const WalletRow = ({ id, wallet, twitter, isLoading }: any) => {
    const navigate = useNavigate();
    const { connection } = useConnections();
    const { fetchBalance } = useMeta();
    const [solBalance, setSolBalance] = useState('Loading...');
    const auth = useAuth();

    const updateSolBalance = async () => {
        const publicKey = new PublicKey(wallet);
        const balance = await fetchBalance(publicKey, connection);
        setSolBalance(balance.toString());
    };

    useEffect(() => {
        if (auth.token) {
            updateSolBalance();
        }
    }, [auth.token]);

    const twitterUsername = _.get(twitter, 'username', 'n/a');
    return (
        <>
            {!isLoading ? (
                <Grid
                    key={`user-${id}`}
                    item
                    xs={12}
                    sx={{
                        p: { xs: 1, md: 0 },
                        paddingLeft: { xs: 1, md: '0 !important' },
                        paddingTop: { xs: 1, md: '0 !important' }
                    }}
                >
                    <MainCard
                        content={false}
                        border={false}
                        sx={{
                            width: '100%',
                            py: 1,
                            px: 1,
                            borderRadius: 0,
                            '&:hover': {
                                backgroundColor: '#d329ff15'
                            },
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/account/${wallet}`)}
                    >
                        <Grid container sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Grid item xs={4} sx={{ textAlign: 'center', p: 1 }}>
                                <Typography component="p" noWrap>
                                    {wallet}
                                </Typography>
                            </Grid>
                            <Grid item xs={4} sx={{ textAlign: 'center', p: 1 }}>
                                <Typography component="p" noWrap>
                                    {twitterUsername}
                                </Typography>
                            </Grid>
                            <Grid item xs={4} sx={{ textAlign: 'center', p: 1 }}>
                                <Typography component="p" noWrap>
                                    {solBalance}
                                </Typography>
                            </Grid>
                        </Grid>
                    </MainCard>
                </Grid>
            ) : (
                <WalletRowSkeleton />
            )}
        </>
    );
};

export default WalletRow;
