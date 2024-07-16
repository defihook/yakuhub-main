import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import { useToasts } from 'hooks/useToasts';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { Promise } from 'bluebird';
import {
    createAssociatedTokenAccountInstruction,
    createCloseAccountInstruction,
    createTransferInstruction,
    getAssociatedTokenAddress,
    createBurnInstruction
} from '@solana/spl-token-v2';
import { LoadingButton } from '@mui/lab';
import { IconFlame, IconSend } from '@tabler/icons';
import useConnections from 'hooks/useConnetions';
import { PublicKey, Transaction } from '@solana/web3.js';
import { toPublicKey } from 'views/tools/utils/to-publickey';
import { sendAndConfirmWithRetry } from '@strata-foundation/spl-utils';
import { getBlockhashWithRetries } from 'views/tools/utils/get-blockhash-with-retries';
import ConfirmDialog from 'components/ConfirmDialog';

const SendAndBurnButton = ({ item, updateView }: any) => {
    const { connection } = useConnections();
    const { publicKey, signAllTransactions } = useWallet();
    const wallet = useWallet();
    const { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } = useToasts();
    const [dstAddress, setDstAddress] = useState('');
    const [openSend, setOpenSend] = useState(false);
    const [openBurn, setOpenBurn] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isBurning, setIsBurning] = useState(false);

    const sendNft = () => {
        setOpenSend(true);
    };

    const burnNft = () => {
        setOpenBurn(true);
    };

    const createAssociatedTokenAccountsForMint = async (mint: PublicKey, destination: string) => {
        if (!publicKey) {
            return;
        }
        const resolvedTokenaccountsWithBalance = {
            mint,
            ata: await getAssociatedTokenAddress(mint, toPublicKey(destination), true),
            balance: await connection.getBalance(await getAssociatedTokenAddress(mint, toPublicKey(destination), true))
        };
        const txs = [];
        if (!resolvedTokenaccountsWithBalance) {
            return;
        }
        const tx = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                publicKey,
                resolvedTokenaccountsWithBalance.ata,
                toPublicKey(destination),
                resolvedTokenaccountsWithBalance.mint
            )
        );
        tx.recentBlockhash = (await getBlockhashWithRetries(connection)).blockhash;
        // @ts-ignore
        tx.feePayer = publicKey;
        txs.push(tx);
        if (txs.length) {
            // @ts-ignore
            await signAllTransactions(txs);
            await Promise.map(txs, (transaction) =>
                sendAndConfirmWithRetry(
                    connection,
                    transaction.serialize(),
                    {
                        maxRetries: 3,
                        skipPreflight: true
                    },
                    'processed'
                )
            );
        }
    };

    const handleSend = async () => {
        if (!publicKey || !item.mint) {
            return;
        }
        setIsSending(true);

        try {
            const mintPubKey = new PublicKey(item.mint);
            await createAssociatedTokenAccountsForMint(mintPubKey, dstAddress);
            const sourceATA = await getAssociatedTokenAddress(mintPubKey, publicKey, true);
            const destATA = await getAssociatedTokenAddress(mintPubKey, toPublicKey(dstAddress), true);
            const tokenAccBalance = +(await connection.getTokenAccountBalance(sourceATA)).value.amount;
            const instruction = createTransferInstruction(sourceATA, destATA, publicKey, tokenAccBalance, []);
            const closeIx = createCloseAccountInstruction(sourceATA, publicKey, publicKey, []);
            const transaction = new Transaction().add(instruction, closeIx);
            transaction.recentBlockhash = (await getBlockhashWithRetries(connection)).blockhash;
            transaction.feePayer = publicKey;
            dismissToast();
            showLoadingToast(`Sending transaction...`);
            const flattenTxs = [transaction];
            // @ts-ignore
            await signAllTransactions(flattenTxs);
            await Promise.mapSeries(flattenTxs, async (tx) => {
                try {
                    const txId = await sendAndConfirmWithRetry(
                        connection,
                        tx.serialize(),
                        {
                            maxRetries: 3,
                            skipPreflight: true
                        },
                        'processed'
                    );
                    dismissToast();
                    showSuccessToast(`Sent NFT!`);
                    return txId;
                } catch (error) {
                    dismissToast();
                    showErrorToast(`Transaction could not be confirmed in time, please check explorer.`);
                }
                return undefined;
            });
        } catch (err: any) {
            console.error(err);
            dismissToast();
            showErrorToast(`Error sending transaction. ${err.message || err.code || err}`);
        } finally {
            // @ts-ignore
            setIsSending(false);
            updateView();
        }
    };

    const handleBurn = async () => {
        if (!publicKey || !item.mint) {
            return;
        }

        try {
            // @ts-ignore
            setIsBurning(true);
            showLoadingToast(`Burning NFT`);
            const txs = [];
            const mintPubKey = new PublicKey(item.mint);
            const mintAssociatedAccountAddress = await getAssociatedTokenAddress(mintPubKey, publicKey, false);
            const instruction = createBurnInstruction(mintAssociatedAccountAddress, mintPubKey, publicKey, 1, []);

            const closeIx = createCloseAccountInstruction(mintAssociatedAccountAddress, publicKey, publicKey, []);
            const transaction = new Transaction().add(instruction, closeIx);
            transaction.recentBlockhash = (await getBlockhashWithRetries(connection)).blockhash;
            transaction.feePayer = publicKey;
            txs.push(transaction);
            // @ts-ignore
            const signedTxs = await signAllTransactions(txs);
            await Promise.all(
                signedTxs.map(async (tx) => {
                    const id = await connection.sendRawTransaction(tx.serialize());
                    await connection.confirmTransaction(id);
                })
            );
        } catch (err) {
            // @ts-ignore
            setIsBurning(false);
        } finally {
            dismissToast();
            updateView();
        }
    };
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            {item.owner === wallet?.publicKey?.toBase58() && !item.listed && !item.staked && (
                <Button sx={{ borderRadius: 30, mt: 2 }} fullWidth color="info" variant="contained" onClick={() => sendNft()}>
                    <IconSend />
                </Button>
            )}
            {item.owner === wallet?.publicKey?.toBase58() && !item.listed && !item.staked && (
                <Button sx={{ borderRadius: 30, mt: 2 }} fullWidth color="error" variant="contained" onClick={() => burnNft()}>
                    <IconFlame />
                </Button>
            )}
            <Dialog open={openSend} onClose={() => setOpenSend(false)}>
                <DialogTitle>Send NFT</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                variant="outlined"
                                value={dstAddress}
                                sx={{
                                    width: '100%',
                                    height: '52px',
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                                disabled={isSending}
                                onChange={(e) => setDstAddress(e.target.value)}
                                label="Destination address"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <LoadingButton
                                fullWidth
                                variant="contained"
                                color="secondary"
                                sx={{ height: '52px', borderRadius: 30000 }}
                                disabled={!dstAddress}
                                onClick={handleSend}
                                loading={isSending}
                                endIcon={<IconSend />}
                            >
                                Send
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>

            <ConfirmDialog title="Confirm to burn this NFT?" open={openBurn} setOpen={setOpenBurn} onConfirm={handleBurn} />
        </Box>
    );
};

export default SendAndBurnButton;
