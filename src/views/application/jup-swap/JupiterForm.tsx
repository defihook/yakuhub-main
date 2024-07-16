/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { Box, Button, Container, IconButton, List, ListItem, Typography, useTheme } from '@mui/material';

import { useJupiterApiContext } from '../../../contexts/JupiterApiProvider';
import { Def1 } from '@jup-ag/api';
import { INPUT_MINT_ADDRESS, OUTPUT_MINT_ADDRESS, STAKING_REWARD_MINT } from 'config/config';
import MainCard from 'components/MainCard';
import TokenSelect from './components/TokenSelect';
import { NumberInput } from 'components/NumberInput';
import { isNumber, join, last, map, round } from 'lodash';
import { SwapVertOutlined } from '@mui/icons-material';
import useConnections from 'hooks/useConnetions';
import { useToasts } from 'hooks/useToasts';
import { YAKU_DECIMALS, SWAP_FEE_BPS, SWAP_FEE_RECEIVER } from 'config';

import './JupiterForm.css';

interface IJupiterFormProps {}
interface IState {
    amount: number;
    inputMint: PublicKey;
    outputMint: PublicKey;
    slippage: number;
}

const JupiterForm: FunctionComponent<IJupiterFormProps> = (props) => {
    const DEFAULT_AMOUNT = 1;
    const wallet = useWallet();
    const theme = useTheme();
    const { connection } = useConnections();
    const { tokenMap, routeMap, loaded, api } = useJupiterApiContext();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(0);
    const [formValue, setFormValue] = useState<IState>({
        amount: DEFAULT_AMOUNT,
        inputMint: new PublicKey(INPUT_MINT_ADDRESS),
        outputMint: new PublicKey(OUTPUT_MINT_ADDRESS),
        slippage: 1 // 0.1%
    });
    const [routes, setRoutes] = useState<any[]>([]);
    const [inputTokenBalance, setInputTokenBalance] = useState<number>(0);
    const [outputTokenBalance, setOutputTokenBalance] = useState<number>(0);

    const { showErrorToast, showSuccessToast } = useToasts();

    const [inputTokenInfo, outputTokenInfo] = useMemo(
        () => [tokenMap.get(formValue.inputMint?.toBase58() || ''), tokenMap.get(formValue.outputMint?.toBase58() || '')],
        [tokenMap, formValue.inputMint?.toBase58(), formValue.outputMint?.toBase58()]
    );

    const handleSwitch = () => {
        setFormValue((val) => ({ ...val, inputMint: val.outputMint, outputMint: val.inputMint }));
    };

    const getDecimals = (inputMint: PublicKey, defaultVal?: number) => {
        if (inputMint?.toBase58() === STAKING_REWARD_MINT) {
            return round(Math.log(YAKU_DECIMALS) / Math.log(10), 0);
        }
        return defaultVal || 9;
    };

    // Good to add debounce here to avoid multiple calls
    const fetchRoute = useCallback(async () => {
        console.log(isLoading);
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        try {
            const { data } = await api.v3QuoteGet({
                amount: String(round(formValue.amount * Math.pow(10, getDecimals(formValue.inputMint, inputTokenInfo?.decimals)), 0)),
                inputMint: formValue.inputMint.toBase58(),
                outputMint: formValue.outputMint.toBase58(),
                slippageBps: formValue.slippage
                // feeBps: SWAP_FEE_BPS
            });

            if (data) {
                setRoutes(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [api, formValue]);

    const getBalance = async (tokenAddr: PublicKey) => {
        let tokenBalance = 0;
        const solToken = String(new PublicKey(INPUT_MINT_ADDRESS));

        if (wallet.publicKey) {
            if (String(tokenAddr) === solToken) {
                tokenBalance = (await connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL;
            } else {
                const balance = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { mint: tokenAddr });
                tokenBalance = balance.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
            }
        }

        return tokenBalance;
    };

    const handleTokenBalance = async (tokenAddr: PublicKey, inputMode: boolean) => {
        if (wallet.publicKey === null || tokenAddr === null) {
            return;
        }

        const tokenBalance = await getBalance(tokenAddr);

        if (inputMode) {
            setInputTokenBalance(tokenBalance);
        } else {
            setOutputTokenBalance(tokenBalance);
        }
    };

    useEffect(() => {
        fetchRoute();
    }, [formValue]);

    useEffect(() => {
        handleTokenBalance(formValue.inputMint, true);
    }, [formValue.inputMint]);

    useEffect(() => {
        handleTokenBalance(formValue.outputMint, false);
    }, [formValue.outputMint]);

    const validOutputMints = useMemo(
        () => routeMap.get(formValue.inputMint?.toBase58() || '') || [],
        [routeMap, formValue.inputMint?.toBase58()]
    );

    // ensure outputMint can be swapable to inputMint
    useEffect(() => {
        if (formValue.inputMint) {
            const possibleOutputs = routeMap.get(formValue.inputMint.toBase58());

            if (possibleOutputs && !possibleOutputs?.includes(formValue.outputMint?.toBase58() || '')) {
                setFormValue((val: any) => ({
                    ...val,
                    outputMint: new PublicKey(possibleOutputs[0])
                }));
            }
        }
    }, [formValue.inputMint?.toBase58(), formValue.outputMint?.toBase58()]);

    const handleExchange = async () => {
        if (!isSubmitting) {
            if (routes?.[0].inAmount <= 0) {
                showErrorToast('Invalid amount.');
                return;
            }
            const tokenBalance = await getBalance(formValue.inputMint);
            if (formValue.amount > tokenBalance) {
                const symbol = tokenMap.get(routes?.[0]?.marketInfos[0]?.inputMint)?.symbol;
                showErrorToast(`Not enough balances. (only have ${tokenBalance} ${symbol})`);
                return;
            }

            try {
                if (!isLoading && routes?.[0] && wallet.publicKey && wallet.signAllTransactions) {
                    setIsSubmitting(true);

                    const feeReceiver = new PublicKey(SWAP_FEE_RECEIVER);
                    // Fee are in output token
                    const { swapTransaction, setupTransaction, cleanupTransaction } = await api.v3SwapPost({
                        body: {
                            route: routes[selectedRoute] as Def1,
                            userPublicKey: wallet.publicKey.toBase58()
                            // feeAccount: ata
                        }
                    });
                    const transactions = ([setupTransaction, swapTransaction, cleanupTransaction].filter(Boolean) as string[]).map((tx) =>
                        Transaction.from(Buffer.from(tx, 'base64'))
                    );

                    await wallet.signAllTransactions(transactions);

                    let firstAlert = 1;

                    transactions.forEach(async (transaction) => {
                        try {
                            const txId = await connection.sendRawTransaction(transaction.serialize(), {
                                skipPreflight: true,
                                maxRetries: 6
                            });

                            const result = await connection.confirmTransaction(txId);
                            console.log('result', result);

                            console.log(`https://solscan.io/tx/${txId}`);

                            if (result?.value?.err) {
                                showErrorToast('Transaction was failed. Please try again.');
                                setIsSubmitting(false);
                                return;
                            }

                            if (firstAlert === transactions.length) {
                                showSuccessToast('Congratulations! Swap was successful');
                                setIsSubmitting(false);
                            }

                            firstAlert += 1;

                            await handleTokenBalance(formValue.inputMint, true);
                            await handleTokenBalance(formValue.outputMint, false);
                        } catch (e) {
                            console.log('error', e);
                            showErrorToast('Transaction was failed. Please try again.');
                            setIsSubmitting(false);
                        }
                    });
                }
            } catch (e) {
                console.error('e', e);
                const isError = e instanceof Error;
                if (isError && e.message.includes('User rejected the request')) {
                    showErrorToast('User rejected the request');
                } else if (isError && e.message.includes('Requested resource not available')) {
                    showErrorToast('Requested resource not available');
                } else if (isError && e.message.includes('Transaction simulation')) {
                    showErrorToast('Transaction simulation failed');
                } else if (isError && e.message.includes('blockhash')) {
                    showErrorToast('Blockhash not found');
                } else if (isError && e.message.includes('Transaction was not confirmed')) {
                    showErrorToast('Transaction failed to confirm');
                }
                setIsSubmitting(false);
            }
        }
    };

    if (!loaded) {
        return <div>Loading jupiter routeMap...</div>;
    }

    return (
        <Box
            sx={{
                width: '100%'
            }}
        >
            <Container maxWidth="sm" sx={{ backgroundColor: 'rgba(36, 24, 47, 0.85)', p: '8px !important', borderRadius: '30px' }}>
                <Box sx={{ backgroundColor: '#09080d', borderRadius: '24px', p: '16px' }}>
                    <MainCard
                        sx={{
                            backgroundColor: 'rgba(36, 24, 47, 0.85)',
                            border: 'none',
                            borderRadius: '8px',
                            mb: { xs: '15px', sm: '5px' },
                            p: '16px'
                        }}
                    >
                        <div className="f-between">
                            <Typography fontSize={14}>You pay</Typography>
                            <Typography fontSize={14}>Balance: {inputTokenBalance}</Typography>
                        </div>
                        <div className="f-between">
                            <Box
                                className="token-select-box"
                                sx={{
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgb(26, 33, 47)' : '#eee',
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgb(10, 20, 30)' : 'rgb(253, 232, 239)'
                                    }
                                }}
                            >
                                <TokenSelect
                                    mints={Array.from(routeMap.keys())}
                                    tokenMap={tokenMap}
                                    mint={formValue.inputMint}
                                    isShowMyToken
                                    setMint={(mint: string) => {
                                        setFormValue((val: any) => ({
                                            ...val,
                                            inputMint: new PublicKey(mint)
                                        }));
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex' }}>
                                <NumberInput
                                    className="number-control"
                                    name="price"
                                    value={formValue.amount}
                                    step={0.1}
                                    precision={3}
                                    sx={{
                                        background: 'transparent',
                                        paddingRight: '16px',
                                        input: { background: 'transparent', textAlign: 'end', padding: '0px', fontSize: '36px' },
                                        fieldset: { border: 'none' }
                                    }}
                                    onChange={(value?: number) => {
                                        if (isNumber(value) && value >= 0) {
                                            setFormValue((val: any) => ({
                                                ...val,
                                                amount: Math.max(0, value)
                                            }));
                                        }
                                    }}
                                />
                                {inputTokenBalance > 0 && (
                                    <>
                                        <Button
                                            sx={{
                                                bgcolor: 'transparent',
                                                fontSize: '12px',
                                                p: '0px',
                                                border: '2px solid rgb(35 45 66)',
                                                borderTopLeftRadius: '16px',
                                                borderBottomLeftRadius: '16px',
                                                borderRightWidth: '1px'
                                            }}
                                            variant="contained"
                                            onClick={() =>
                                                setFormValue((val: any) => ({
                                                    ...val,
                                                    amount: Math.floor((inputTokenBalance / 2) * 1000) / 1000
                                                }))
                                            }
                                        >
                                            HALF
                                        </Button>
                                        <Button
                                            sx={{
                                                bgcolor: 'transparent',
                                                fontSize: '12px',
                                                p: '0px',
                                                border: '2px solid rgb(35 45 66)',
                                                borderTopRightRadius: '16px',
                                                borderBottomRightRadius: '16px',
                                                borderLeftWidth: '1px'
                                            }}
                                            variant="contained"
                                            onClick={() =>
                                                setFormValue((val: any) => ({
                                                    ...val,
                                                    amount:
                                                        formValue.inputMint?.toBase58() === new PublicKey(INPUT_MINT_ADDRESS)?.toBase58()
                                                            ? Math.floor(inputTokenBalance * 1000) / 1000 - 0.002
                                                            : Math.floor(inputTokenBalance * 1000) / 1000
                                                }))
                                            }
                                        >
                                            MAX
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </div>
                    </MainCard>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16px' }}>
                        <IconButton
                            onClick={handleSwitch}
                            sx={{
                                backgroundColor: '#09080d',
                                borderRadius: '100px',
                                height: '64px',
                                width: '64px',
                                zIndex: '2',
                                ':hover': {
                                    backgroundColor: '#09080d'
                                }
                            }}
                        >
                            <SwapVertOutlined />
                        </IconButton>
                    </Box>
                    <MainCard
                        sx={{
                            backgroundColor: 'rgba(36, 24, 47, 0.85)',
                            border: 'none',
                            borderRadius: '8px',
                            mt: { xs: '15px', sm: '5px' },
                            p: '16px'
                        }}
                    >
                        <div className="f-between">
                            <Typography fontSize={14}>You receive</Typography>
                            <Typography fontSize={14}>Balance: {outputTokenBalance}</Typography>
                        </div>
                        <div className="f-between">
                            <Box
                                className="token-select-box"
                                sx={{
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgb(26, 33, 47)' : '#eee',
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgb(10, 20, 30)' : 'rgb(253, 232, 239)'
                                    }
                                }}
                            >
                                <TokenSelect
                                    mints={validOutputMints}
                                    tokenMap={tokenMap}
                                    mint={formValue.outputMint}
                                    setMint={(mint: string) => {
                                        setFormValue((val: any) => ({
                                            ...val,
                                            outputMint: new PublicKey(mint)
                                        }));
                                    }}
                                />
                            </Box>
                            <Typography fontWeight={500} fontSize={36}>
                                {routes?.[selectedRoute] &&
                                    (() =>
                                        (routes[selectedRoute].outAmount || 0) /
                                        Math.pow(10, getDecimals(formValue.outputMint, outputTokenInfo?.decimals)))()}
                            </Typography>
                        </div>
                    </MainCard>
                    <List>
                        {routes &&
                            routes.length > 0 &&
                            map(routes, (route: any, idx: number) => (
                                <ListItem
                                    sx={{
                                        border: selectedRoute === idx ? '2px solid rgb(29 51 96)' : '2px solid transparent',
                                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(36, 24, 47, 0.85)' : 'primary.light',
                                        my: 2,
                                        borderRadius: '8px',
                                        flexDirection: 'column',
                                        p: 2,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedRoute(idx)}
                                >
                                    <Box
                                        sx={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                color: theme.palette.mode === 'dark' ? 'white' : 'black',
                                                fontWeight: 700
                                            }}
                                        >
                                            {join(
                                                map(route.marketInfos, ({ label }) => label),
                                                ' → '
                                            )}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                color: theme.palette.mode === 'dark' ? 'white' : 'black'
                                            }}
                                        >
                                            {join(
                                                map(
                                                    route.marketInfos,
                                                    ({ inputMint }) => tokenMap !== undefined && tokenMap.get(inputMint)?.symbol
                                                ),
                                                ' → '
                                            )}{' '}
                                            {' → '}{' '}
                                            {tokenMap !== undefined && tokenMap.get((last(route.marketInfos) as any).outputMint)?.symbol}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                color: theme.palette.mode === 'dark' ? 'white' : 'black'
                                            }}
                                        >
                                            Price impact: {round(Number(route.priceImpactPct * 100), 4).toLocaleString()}%
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: theme.palette.mode === 'dark' ? 'white' : 'black'
                                            }}
                                        >
                                            Est. Minimum Amount:{' '}
                                            {(route.otherAmountThreshold || 0) /
                                                Math.pow(10, getDecimals(formValue.outputMint, outputTokenInfo?.decimals))}
                                        </Typography>
                                    </Box>
                                </ListItem>
                            ))}
                    </List>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{
                            mt: 2,
                            borderRadius: '20px',
                            height: '64px',
                            '&:disabled, [disabled]': {
                                bgcolor: '#f38aff',
                                color: 'rgba(0, 0, 0, 0.87)',
                                pointerEvents: 'auto',
                                cursor: 'not-allowed'
                            }
                        }}
                        color="secondary"
                        disabled={isSubmitting}
                        onClick={handleExchange}
                    >
                        {isSubmitting ? 'Swapping...' : 'Swap'}
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default JupiterForm;
