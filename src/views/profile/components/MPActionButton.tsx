import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';
import { mutations } from '../../../graphql/graphql';
import useAuthMutation from 'hooks/useAuthMutation';
import { useMeta } from 'contexts/meta/meta';
import { useEthcontext } from 'contexts/EthWalletProvider';
import { Message, Transaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToasts } from 'hooks/useToasts';
import { isNumber, isObject } from 'lodash';
import { NumberInput } from 'components/NumberInput';
import { useState } from 'react';
import useConnections from 'hooks/useConnetions';
import { DEFAULT_BUYER_BROKER, USE_ME_API_FOR_COLLECTION_BUY } from 'config/config';

const MPActionButton = ({
    staked,
    listed,
    myBid,
    noListing,
    price,
    owner,
    broker_referral_address,
    marketplace_program_id,
    tokenMint,
    name,
    floor_price,
    updateView,
    projectId = '',
    tokenAddress = '',
    chain = 'SOL'
}: any) => {
    const { connection } = useConnections();
    const { startLoading, stopLoading } = useMeta();
    const [getMETransactionInstructions] = useAuthMutation(mutations.GET_ME_TRANSACTION_INSTRUCTIONS);
    const [getMEDelistTransactionInstructions] = useAuthMutation(mutations.GET_ME_DELIST_TRANSACTION_INSTRUCTIONS);
    const [getMEListTransactionInstructions] = useAuthMutation(mutations.GET_ME_LIST_TRANSACTION_INSTRUCTIONS);
    const [getMEBidTransactionInstructions] = useAuthMutation(mutations.GET_ME_BID_TRANSACTION_INSTRUCTIONS);
    const [getMECancelBidTransactionInstructions] = useAuthMutation(mutations.GET_ME_CANCEL_BID_TRANSACTION_INSTRUCTIONS);
    const [getMEChangeBidTransactionInstructions] = useAuthMutation(mutations.GET_ME_CHANGE_BID_TRANSACTION_INSTRUCTIONS);
    const [createBuyTx] = useAuthMutation(mutations.CREATE_BUY_TX);
    const [creatDelistTx] = useAuthMutation(mutations.CREATE_DELIST_TX);
    const wallet = useWallet();
    const { ethAddress, ethConnect, ethConnected, ethBalance, sendTransaction } = useEthcontext();
    const { showSuccessToast, showErrorToast } = useToasts();
    const [listPrice, setListPrice] = useState(floor_price || 0);
    const [bidPrice, setBidPrice] = useState(0);
    const [newBidPrice, setNewBidPrice] = useState(0);
    const [showListDialog, setShowListDialog] = useState(false);
    const [showBidDialog, setShowBidDialog] = useState(false);
    const [showChangeBidDialog, setShowChangeBidDialog] = useState(false);

    const buyNowInSOL = async () => {
        if (!wallet || !wallet.publicKey) {
            return;
        }
        try {
            startLoading();
            let instructions;
            let response;
            const isME = marketplace_program_id === 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K';
            if (isME && USE_ME_API_FOR_COLLECTION_BUY) {
                ({ data: instructions } = await getMETransactionInstructions({
                    variables: {
                        buyer: wallet.publicKey.toBase58(),
                        tokenMint
                    }
                }));
                ({ getMETransactionInstructions: response } = instructions);
            } else {
                ({ data: instructions } = await createBuyTx({
                    variables: {
                        buyerAddress: wallet.publicKey.toBase58(),
                        price,
                        tokenAddress: tokenMint,
                        buyerBroker: broker_referral_address || DEFAULT_BUYER_BROKER || process.env.SOLANA_FEE_ACCOUNT,
                        tokens: [],
                        chain
                    }
                }));
                ({ createBuyTx: response } = instructions);
            }

            if ((response && response.data) || Object.keys(response).length > 0) {
                let transaction;
                if (isME) {
                    transaction = Transaction.from(Buffer.from(response.txSigned));
                } else {
                    transaction = Transaction.populate(Message.from(Buffer.from(response.data)));
                }
                const res = await wallet.sendTransaction(transaction, connection);
                await connection.confirmTransaction(res);
                const getTransResp = await connection.getTransaction(res, { commitment: 'confirmed' });
                if (isObject(getTransResp) && getTransResp?.meta?.err === null) {
                    showSuccessToast(
                        <Typography
                            component="a"
                            sx={{ color: '#fff' }}
                            href={`https://solscan.io/tx/${res}`}
                            target="_blank"
                            rel="noreferrer"
                            className="m-auto"
                        >
                            Successfully bought {name}.
                        </Typography>
                    );
                } else {
                    showErrorToast('Fail to purchase.');
                }
            }
        } catch (error) {
            console.error(error);
            showErrorToast('There are some errors, please try again later.');
        } finally {
            stopLoading();
            updateView();
        }
    };

    const buyNowInETH = async () => {
        if (!ethConnected || !ethAddress) {
            ethConnect();
        }
        try {
            startLoading();

            if (ethBalance < price) {
                showErrorToast('You have insufficient funds to buy this token.');
                return;
            }

            const { data: instructions } = await createBuyTx({
                variables: {
                    buyerAddress: ethAddress, // required field
                    tokens: [`${projectId}:${tokenAddress}`], // required field
                    chain, // required field
                    price,
                    tokenAddress: projectId,
                    buyerBroker: ''
                }
            });

            const { createBuyTx: response } = instructions;

            if ((response && response.data) || Object.keys(response).length > 0) {
                if (response.error) {
                    showErrorToast(response.error);
                    return;
                }
                const result = await sendTransaction(response?.txObj);
                if (result.success) {
                    showSuccessToast(result.message);
                } else {
                    showErrorToast(result.message);
                }
            }
        } catch (error) {
            console.error(error);
            showErrorToast('There are some errors, please try again later.');
        } finally {
            stopLoading();
            updateView();
        }
    };

    const delistInSOL = async () => {
        if (!wallet || !wallet.publicKey) {
            return;
        }

        try {
            startLoading();
            let instructions;
            let response;
            let isME = false;
            if (marketplace_program_id === 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K') {
                ({ data: instructions } = await getMEDelistTransactionInstructions({
                    variables: {
                        seller: wallet.publicKey.toBase58(),
                        tokenMint
                    }
                }));
                isME = true;
                ({ getMEDelistTransactionInstructions: response } = instructions);
            } else {
                ({ data: instructions } = await creatDelistTx({
                    variables: {
                        sellerAddress: wallet.publicKey.toBase58(),
                        tokenAddress: tokenMint
                    }
                }));
                ({ createDelistTx: response } = instructions);
            }

            if ((response && response.data) || Object.keys(response).length > 0) {
                let transaction;
                if (isME) {
                    transaction = Transaction.from(Buffer.from(response.txSigned));
                } else {
                    transaction = Transaction.populate(Message.from(Buffer.from(response.data)));
                }
                const res = await wallet.sendTransaction(transaction, connection);
                await connection.confirmTransaction(res);
                const getTransResp = await connection.getTransaction(res, { commitment: 'confirmed' });
                if (isObject(getTransResp) && getTransResp?.meta?.err === null) {
                    showSuccessToast(
                        <Typography
                            component="a"
                            sx={{ color: '#fff' }}
                            href={`https://solscan.io/tx/${res}`}
                            target="_blank"
                            rel="noreferrer"
                            className="m-auto"
                        >
                            Successfully Delist {name}.
                        </Typography>
                    );
                } else {
                    showErrorToast('Fail to delist.');
                }
            }
        } catch (error) {
            console.error(error);
            showErrorToast('There are some errors, please try again later.');
        } finally {
            stopLoading();
            updateView();
        }
    };

    const delistInETH = async () => {
        try {
            // TODO: delist ETH nft
        } catch (error) {
            console.error(error);
            showErrorToast('There are some errors, please try again later.');
        } finally {
            stopLoading();
            updateView();
        }
    };

    const listInSOL = async () => {
        if (!wallet || !wallet.publicKey || listPrice <= 0) {
            return;
        }

        try {
            startLoading();
            const { data: instructions } = await getMEListTransactionInstructions({
                variables: {
                    seller: wallet.publicKey.toBase58(),
                    tokenMint,
                    price: listPrice
                }
            });
            const { getMEListTransactionInstructions: response } = instructions;

            if ((response && response.data) || Object.keys(response).length > 0) {
                const transaction = Transaction.from(Buffer.from(response.txSigned));
                const res = await wallet.sendTransaction(transaction, connection);
                await connection.confirmTransaction(res);
                const getTransResp = await connection.getTransaction(res, { commitment: 'confirmed' });
                if (isObject(getTransResp) && getTransResp?.meta?.err === null) {
                    showSuccessToast(
                        <Typography
                            component="a"
                            sx={{ color: '#fff' }}
                            href={`https://solscan.io/tx/${res}`}
                            target="_blank"
                            rel="noreferrer"
                            className="m-auto"
                        >
                            Successfully list {name}.
                        </Typography>
                    );
                } else {
                    showErrorToast('Fail to list.');
                }
            }
        } catch (error) {
            console.error(error);
            showErrorToast('There are some errors, please try again later.');
        } finally {
            stopLoading();
            setShowListDialog(false);
            updateView();
        }
    };

    const listInETH = async () => {
        try {
            // TODO: list ETH nft
        } catch (error) {
            console.error(error);
            showErrorToast('There are some errors, please try again later.');
        } finally {
            stopLoading();
            updateView();
        }
    };

    const bidInSOL = async () => {
        if (!wallet || !wallet.publicKey || bidPrice <= 0) {
            return;
        }

        try {
            startLoading();
            const { data: instructions } = await getMEBidTransactionInstructions({
                variables: {
                    buyer: wallet.publicKey.toBase58(),
                    tokenMint,
                    price: bidPrice
                }
            });
            const { getMEBidTransactionInstructions: response } = instructions;

            if ((response && response.data) || Object.keys(response).length > 0) {
                const transaction = Transaction.from(Buffer.from(response.txSigned));
                const res = await wallet.sendTransaction(transaction, connection);
                await connection.confirmTransaction(res);
                const getTransResp = await connection.getTransaction(res, { commitment: 'confirmed' });
                if (isObject(getTransResp) && getTransResp?.meta?.err === null) {
                    showSuccessToast(
                        <Typography
                            component="a"
                            sx={{ color: '#fff' }}
                            href={`https://solscan.io/tx/${res}`}
                            target="_blank"
                            rel="noreferrer"
                            className="m-auto"
                        >
                            Successfully bid {name} with {bidPrice} SOL.
                        </Typography>
                    );
                } else {
                    showErrorToast('Fail to bid.');
                }
            }
        } catch (error) {
            console.error(error);
            showErrorToast('There are some errors, please try again later.');
        } finally {
            stopLoading();
            setShowBidDialog(false);
            updateView();
        }
    };

    const bidInETH = async () => {
        try {
            // TODO: bid ETH nft
        } catch (error) {
            console.error(error);
            showErrorToast('There are some errors, please try again later.');
        } finally {
            stopLoading();
            updateView();
        }
    };

    const changeBid = async () => {
        if (!wallet || !wallet.publicKey || newBidPrice <= 0) {
            return;
        }

        try {
            startLoading();
            const { data: instructions } = await getMEChangeBidTransactionInstructions({
                variables: {
                    buyer: wallet.publicKey.toBase58(),
                    tokenMint,
                    price: myBid.price,
                    newPrice: newBidPrice
                }
            });
            const { getMEChangeBidTransactionInstructions: response } = instructions;

            if ((response && response.data) || Object.keys(response).length > 0) {
                const transaction = Transaction.from(Buffer.from(response.txSigned));
                const res = await wallet.sendTransaction(transaction, connection);
                await connection.confirmTransaction(res);
                const getTransResp = await connection.getTransaction(res, { commitment: 'confirmed' });
                if (isObject(getTransResp) && getTransResp?.meta?.err === null) {
                    showSuccessToast(
                        <Typography
                            component="a"
                            sx={{ color: '#fff' }}
                            href={`https://solscan.io/tx/${res}`}
                            target="_blank"
                            rel="noreferrer"
                            className="m-auto"
                        >
                            Successfully bid {name} with {newBidPrice} SOL.
                        </Typography>
                    );
                } else {
                    showErrorToast('Fail to bid.');
                }
            }
        } catch (error) {
            console.error(error);
            showErrorToast('There are some errors, please try again later.');
        } finally {
            stopLoading();
            setShowChangeBidDialog(false);
            updateView();
        }
    };

    const cancelBid = async () => {
        if (!wallet || !wallet.publicKey) {
            return;
        }

        try {
            startLoading();
            const { data: instructions } = await getMECancelBidTransactionInstructions({
                variables: {
                    buyer: wallet.publicKey.toBase58(),
                    tokenMint,
                    price: myBid?.price
                }
            });
            const { getMECancelBidTransactionInstructions: response } = instructions;

            if ((response && response.data) || Object.keys(response).length > 0) {
                const transaction = Transaction.from(Buffer.from(response.txSigned));
                const res = await wallet.sendTransaction(transaction, connection);
                await connection.confirmTransaction(res);
                const getTransResp = await connection.getTransaction(res, { commitment: 'confirmed' });
                if (isObject(getTransResp) && getTransResp?.meta?.err === null) {
                    showSuccessToast(
                        <Typography
                            component="a"
                            sx={{ color: '#fff' }}
                            href={`https://solscan.io/tx/${res}`}
                            target="_blank"
                            rel="noreferrer"
                            className="m-auto"
                        >
                            Successfully cancel bid on {name}.
                        </Typography>
                    );
                } else {
                    showErrorToast('Fail to bid.');
                }
            }
        } catch (error) {
            console.error(error);
            showErrorToast('There are some errors, please try again later.');
        } finally {
            stopLoading();
            updateView();
        }
    };

    const isOwner = chain === 'SOL' ? owner === wallet?.publicKey?.toBase58() : owner === ethAddress;

    if (!staked) {
        return (
            <>
                {listed ? (
                    <>
                        {!isOwner ? (
                            <Button
                                sx={{ borderRadius: 30, mt: 2 }}
                                fullWidth
                                color="secondary"
                                variant="contained"
                                onClick={() => (chain === 'SOL' ? buyNowInSOL() : buyNowInETH())}
                            >
                                <Typography component="p" fontSize={20} noWrap>
                                    Buy Now
                                </Typography>
                            </Button>
                        ) : (
                            <Button
                                sx={{ borderRadius: 30, mt: 2 }}
                                fullWidth
                                color="secondary"
                                variant="contained"
                                onClick={() => (chain === 'SOL' ? delistInSOL() : delistInETH())}
                            >
                                <Typography component="p" fontSize={20} noWrap>
                                    Delist
                                </Typography>
                            </Button>
                        )}
                    </>
                ) : (
                    <>
                        {!noListing ? (
                            <>
                                {!isOwner ? (
                                    <Typography component="p" color="primary">
                                        Not Listed
                                    </Typography>
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
                                        <Button
                                            sx={{ borderRadius: 30, minWidth: 120 }}
                                            color="secondary"
                                            variant="contained"
                                            onClick={() => (chain === 'SOL' ? listInSOL() : listInETH())}
                                        >
                                            <Typography component="p" fontSize={20} noWrap>
                                                List
                                            </Typography>
                                        </Button>
                                        <NumberInput
                                            value={listPrice}
                                            min={0}
                                            step={0.001}
                                            precision={3}
                                            placeholder={`List Price (${chain})"`}
                                            onChange={(value?: number) => {
                                                if (value && isNumber(value) && value > 0) {
                                                    setListPrice(value);
                                                }
                                            }}
                                        />
                                        <Typography component="p" fontSize={16} noWrap>
                                            {chain}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        ) : (
                            <>
                                {isOwner && (
                                    <Button
                                        sx={{ borderRadius: 30, mt: 2 }}
                                        fullWidth
                                        color="secondary"
                                        variant="contained"
                                        onClick={() => setShowListDialog(true)}
                                    >
                                        <Typography component="p" fontSize={20} noWrap>
                                            List
                                        </Typography>
                                    </Button>
                                )}
                            </>
                        )}
                    </>
                )}

                {!noListing &&
                    (!myBid ? (
                        <Button
                            sx={{ borderRadius: 30, mt: 2 }}
                            fullWidth
                            color="secondary"
                            variant="outlined"
                            onClick={() => setShowBidDialog(true)}
                        >
                            <Typography component="p" fontSize={20} noWrap>
                                Make an offer
                            </Typography>
                        </Button>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Button
                                sx={{ borderRadius: 30, mt: 2 }}
                                fullWidth
                                color="secondary"
                                variant="outlined"
                                onClick={() => setShowChangeBidDialog(true)}
                            >
                                <Typography component="p" fontSize={20} noWrap>
                                    Change offered price
                                </Typography>
                            </Button>
                            <Button sx={{ borderRadius: 30, mt: 2 }} fullWidth color="error" variant="outlined" onClick={() => cancelBid()}>
                                <Typography component="p" fontSize={20} noWrap>
                                    Cancel offer
                                </Typography>
                            </Button>
                        </Box>
                    ))}
                <Dialog open={showListDialog} onClose={() => setShowListDialog(false)}>
                    <DialogContent>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
                            <Button
                                sx={{ borderRadius: 30, minWidth: 120 }}
                                color="secondary"
                                variant="contained"
                                onClick={() => (chain === 'SOL' ? listInSOL() : listInETH())}
                            >
                                <Typography component="p" fontSize={20} noWrap>
                                    List
                                </Typography>
                            </Button>
                            <NumberInput
                                value={listPrice}
                                min={0}
                                step={0.001}
                                precision={3}
                                placeholder={`List Price (${chain})`}
                                onChange={(value?: number) => {
                                    if (value && isNumber(value) && value > 0) {
                                        setListPrice(value);
                                    }
                                }}
                            />
                            <Typography component="p" fontSize={16} noWrap>
                                {chain}
                            </Typography>
                        </Box>
                    </DialogContent>
                </Dialog>
                <Dialog open={showBidDialog} onClose={() => setShowBidDialog(false)}>
                    <DialogContent>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
                            <Button
                                sx={{ borderRadius: 30, minWidth: 120 }}
                                color="secondary"
                                variant="contained"
                                onClick={() => (chain === 'SOL' ? bidInSOL() : bidInETH())}
                            >
                                <Typography component="p" fontSize={20} noWrap>
                                    Make an offer
                                </Typography>
                            </Button>
                            <NumberInput
                                value={bidPrice}
                                min={0}
                                step={0.001}
                                precision={3}
                                placeholder={`Offer Price (${chain})`}
                                onChange={(value?: number) => {
                                    if (value && isNumber(value) && value > 0) {
                                        setBidPrice(value);
                                    }
                                }}
                            />
                            <Typography component="p" fontSize={16} noWrap>
                                {chain}
                            </Typography>
                        </Box>
                    </DialogContent>
                </Dialog>
                <Dialog open={showChangeBidDialog} onClose={() => setShowChangeBidDialog(false)}>
                    <DialogContent>
                        <Typography component="p" noWrap>
                            Original bid price: {myBid?.price}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
                            <Button
                                sx={{ borderRadius: 30, minWidth: 120 }}
                                color="secondary"
                                variant="contained"
                                onClick={() => changeBid()}
                            >
                                <Typography component="p" fontSize={20} noWrap>
                                    Change offered price
                                </Typography>
                            </Button>
                            <NumberInput
                                value={newBidPrice}
                                min={0}
                                step={0.001}
                                precision={3}
                                placeholder={`New Offer Price (${chain})`}
                                onChange={(value?: number) => {
                                    if (value && isNumber(value) && value > 0) {
                                        setNewBidPrice(value);
                                    }
                                }}
                            />
                            <Typography component="p" fontSize={16} noWrap>
                                {chain}
                            </Typography>
                        </Box>
                    </DialogContent>
                </Dialog>
            </>
        );
    }
    return <></>;
};

export default MPActionButton;
