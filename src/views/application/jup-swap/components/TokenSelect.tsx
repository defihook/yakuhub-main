import { useState, useEffect } from 'react';
import { Avatar, Box, Button, Dialog, Grid, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useWallet } from '@solana/wallet-adapter-react';
import { map, orderBy, uniq, groupBy, flatten, filter, sum } from 'lodash';
import { Promise } from 'bluebird';
import SearchInputWrapper from './SearchInputWrapper';
import useAuth from 'hooks/useAuth';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { queries } from '../../../../graphql/graphql';

const TokenSelect = ({ mints, tokenMap, mint, isShowMyToken, setMint }: any) => {
    const auth = useAuth();
    const { publicKey } = useWallet();

    const [openDialog, setOpenDialog] = useState(false);
    const [target, setTarget] = useState('');
    const [tokensListOfUser, setTokensListOfUser] = useState<any[]>([]);

    const [getAccountTokens] = useAuthLazyQuery(queries.GET_ACCOUNT_TOKENS);

    const getTokensListOfUser = async () => {
        try {
            const wallets = uniq([publicKey?.toBase58(), ...(auth.user?.wallets || [])]);
            const tokensBundled: any = groupBy(
                flatten(
                    await Promise.mapSeries(wallets, async (account: string) => {
                        const { data: tokenData } = await getAccountTokens({
                            variables: {
                                account
                            },
                            fetchPolicy: 'network-only'
                        });

                        return tokenData?.getAccountTokens ?? [];
                    })
                ),
                'tokenSymbol'
            );

            if (tokensBundled) {
                const tokensOfUser: any[] = filter(
                    map(Object.keys(tokensBundled), (tokenSymbol) => {
                        const arr = tokensBundled[tokenSymbol];
                        if (!arr || arr.length === 0) {
                            return undefined;
                        }
                        if (arr && arr.length === 1) {
                            return arr[0];
                        }
                        const result = {
                            ...arr[0]
                        };
                        result.tokenAmount.amount = `${sum(map(arr, ({ tokenAmount }) => +tokenAmount.amount))}`;
                        result.tokenAmount.uiAmount = sum(map(arr, ({ tokenAmount }) => tokenAmount.uiAmount));
                        result.tokenAmount.uiAmountString = `${result.tokenAmount.uiAmount}`;
                        return result;
                    }),
                    (v) => !!v
                );

                setTokensListOfUser(tokensOfUser);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (auth.user && publicKey) {
            getTokensListOfUser();
        }
    }, [auth.user, publicKey]);

    return (
        <>
            <Box
                onClick={() => {
                    setOpenDialog(true);
                }}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    p: '12px 16px',
                    cursor: 'pointer'
                }}
            >
                <div className="f-center">
                    <Avatar
                        sx={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: 'transparent'
                        }}
                        src={tokenMap.get(mint.toBase58())?.logoURI}
                    />
                    <Box sx={{ fontWeight: 'bold', marginLeft: '8px' }}>{tokenMap.get(mint.toBase58())?.symbol}</Box>
                </div>
                <ExpandMoreIcon sx={{ marginRight: '-8px' }} />
            </Box>
            <Dialog
                onClose={() => setOpenDialog(false)}
                open={openDialog}
                sx={{
                    '.MuiPaper-root': {
                        backgroundColor: 'rgb(26, 33, 47)',
                        p: 1,
                        borderRadius: '32px',
                        width: '100%',
                        maxHeight: 'calc(100% - 48px)',
                        overflow: 'hidden'
                    }
                }}
            >
                <Box
                    sx={{
                        bgcolor: 'rgb(17, 24, 39)',
                        p: '24px',
                        borderRadius: '30px'
                    }}
                >
                    <Typography sx={{ fontSize: '24px', fontWeight: '500' }}>Select a token</Typography>
                    <Box
                        sx={{
                            py: '18px'
                        }}
                    >
                        <SearchInputWrapper
                            sx={{
                                border: 'none',
                                borderRadius: '16px'
                            }}
                            autoFocus
                            placeholder="Search for a token"
                            fullWidth
                            onChange={(event: any) => {
                                setTarget(event.target.value);
                            }}
                        />
                    </Box>
                    <Typography sx={{ fontSize: '16px', fontWeight: '500' }}>Common tokens</Typography>
                    <Box
                        sx={{
                            maxHeight: '60vh',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                            padding: '16px 0px',
                            '&::-webkit-scrollbar': {
                                width: 0
                            }
                        }}
                    >
                        <Grid className="token-select-box-animation" container spacing={2} sx={{ flexWrap: 'nowrap' }}>
                            {map(
                                [
                                    'So11111111111111111111111111111111111111112', // SOL
                                    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
                                    'NGK3iHqqQkyRZUj4uhJDQqEyKKcZ7mdawWpqwMffM3s', // YAKU
                                    'EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp', // FIDA
                                    'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt', // SRM
                                    '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E', // BTC
                                    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
                                    'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac', // Mango
                                    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
                                    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So' // mSOL
                                ],
                                (tokenMint) => (
                                    <Grid item key={tokenMint}>
                                        <Button
                                            fullWidth
                                            sx={{
                                                display: 'flex',
                                                borderRadius: '32px',
                                                gap: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}
                                            variant="outlined"
                                            onClick={() => {
                                                setMint(tokenMint);
                                                setOpenDialog(false);
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: '20px',
                                                    height: '20px',
                                                    mr: '4px',
                                                    backgroundColor: 'transparent'
                                                }}
                                                src={tokenMap.get(tokenMint)?.logoURI}
                                            />{' '}
                                            {tokenMap.get(tokenMint)?.symbol}
                                        </Button>
                                    </Grid>
                                )
                            )}
                        </Grid>
                    </Box>
                    {isShowMyToken && (
                        <>
                            <Typography sx={{ fontSize: '16px', fontWeight: '500' }}>Your tokens</Typography>
                            <Box sx={{ overflow: 'auto', borderRadius: '16px', maxHeight: '40vh', mt: '16px' }}>
                                {orderBy(
                                    tokensListOfUser.filter(
                                        (token) =>
                                            token?.tokenAmount.uiAmount > 0 &&
                                            ((!target && !!token?.tokenName) ||
                                                (target &&
                                                    (token?.tokenName.toLowerCase().includes(target.toLowerCase()) ||
                                                        (token.tokenAddress === 'So11111111111111111111111111111111111111112' &&
                                                            'Solana'.toLowerCase().includes(target.toLowerCase())) ||
                                                        token?.tokenSymbol.toLowerCase().includes(target.toLowerCase()) ||
                                                        token?.tokenAddress.toLowerCase().includes(target.toLowerCase()))))
                                    ),
                                    (token) => token?.tokenName,
                                    'asc'
                                ).map((tokenMint) => (
                                    <Box
                                        key={tokenMint.tokenSymbol}
                                        sx={{
                                            bgcolor: 'rgb(26, 33, 47)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '10px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: 'rgb(10, 20, 30)'
                                            }
                                        }}
                                        onClick={() => {
                                            setMint(tokenMint.tokenAddress);
                                            setOpenDialog(false);
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: '24px',
                                                height: '24px',
                                                mr: '6px',
                                                backgroundColor: 'transparent'
                                            }}
                                            src={tokenMint?.tokenIcon}
                                        />
                                        <Box
                                            sx={{
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '16px'
                                            }}
                                        >
                                            <Typography>{tokenMint?.tokenSymbol}</Typography>
                                            <Typography color="primary">
                                                {tokenMint?.tokenAddress === 'So11111111111111111111111111111111111111112'
                                                    ? 'Solana'
                                                    : tokenMint?.tokenName}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </>
                    )}
                    {target.length > 0 && !isShowMyToken && (
                        <Box sx={{ overflow: 'auto', borderRadius: '16px', maxHeight: '40vh', mt: '16px' }}>
                            {orderBy(
                                mints.filter(
                                    (tokenMint: string) =>
                                        (!target && !!tokenMap.get(tokenMint)?.name) ||
                                        (target &&
                                            (tokenMap.get(tokenMint)?.name.toLowerCase().includes(target.toLowerCase()) ||
                                                (tokenMint === 'So11111111111111111111111111111111111111112' &&
                                                    'Solana'.toLowerCase().includes(target.toLowerCase())) ||
                                                tokenMap.get(tokenMint)?.symbol.toLowerCase().includes(target.toLowerCase()) ||
                                                tokenMint.toLowerCase().includes(target.toLowerCase())))
                                ),
                                (tokenMint) => tokenMap.get(tokenMint)?.name,
                                'asc'
                            ).map((tokenMint: string) => (
                                <Box
                                    key={tokenMint}
                                    sx={{
                                        bgcolor: 'rgb(26, 33, 47)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '10px',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: 'rgb(10, 20, 30)'
                                        }
                                    }}
                                    onClick={() => {
                                        setMint(tokenMint);
                                        setOpenDialog(false);
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: '24px',
                                            height: '24px',
                                            mr: '6px',
                                            backgroundColor: 'transparent'
                                        }}
                                        src={tokenMap.get(tokenMint)?.logoURI}
                                    />
                                    <Box
                                        sx={{
                                            // width: '150px',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}
                                    >
                                        <Typography>{tokenMap.get(tokenMint)?.symbol}</Typography>
                                        <Typography color="primary">
                                            {tokenMint === 'So11111111111111111111111111111111111111112'
                                                ? 'Solana'
                                                : tokenMap.get(tokenMint)?.name}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Dialog>
        </>
    );
};

export default TokenSelect;
