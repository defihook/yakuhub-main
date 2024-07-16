/* eslint-disable consistent-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Grid,
    Button,
    TextField,
    IconButton,
    Typography,
    Dialog,
    Box,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    LinearProgress,
    FormControl,
    Select,
    MenuItem,
    Tooltip,
    useTheme
} from '@mui/material';
import { useEffect, useState } from 'react';

import { mutations, queries } from '../../../../../../graphql/graphql';

import { useToasts } from 'hooks/useToasts';
import { AddOutlined, RefreshOutlined } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { useMeta } from 'contexts/meta/meta';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { AccountLayout, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token-v2';
import { DEFAULT_RPC, USDCMINT } from 'config/config';
import { Promise } from 'bluebird';
import { map, round, sortBy, sumBy } from 'lodash';
import ProjectCard from './ProjectCard';
import { FormattedMessage } from 'react-intl';
import { NumberInput } from 'components/NumberInput';
import { getOrCreateAssociatedTokenAccount } from 'actions/project';
import { LoadingButton } from '@mui/lab';
import useAuthQuery from 'hooks/useAuthQuery';
import useAuthMutation from 'hooks/useAuthMutation';
import { web3 } from '@project-serum/anchor';
import useConnections from 'hooks/useConnetions';
import base58 from 'bs58';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export default function ShowProjects({
    notifyProjects,
    selectedProject,
    setSelectedProject,
    setNumberOfProject,
    setTotalSolBal,
    setTotalUSDCBal,
    admin
}: any) {
    const { connection } = useConnections();
    const theme = useTheme();
    const [clickWithdraw] = useAuthMutation(mutations.WITHDRAW);
    const [project, setProject] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
    const [showDepositDialog, setShowDepositDialog] = useState(false);
    const [depositAmt, setDepositAmt] = useState(0);
    const [depositCurrency, setDepositCurrency] = useState('SOL');
    const [depositWallet, setDepositWallet] = useState<string>();
    const [isDepositing, setIsDepositing] = useState(false);
    const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
    const [withdrawAmt, setWithdrawAmt] = useState(0);
    const [withdrawCurrency, setWithdrawCurrency] = useState('SOL');
    const [withdrawProject, setWithdrawProject] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [maxBalance, setMaxBalance] = useState<any>({});
    const wallet = useWallet();

    const [createWallet] = useAuthMutation(mutations.CREAT_PROJECT);

    const { data, refetch } = useAuthQuery(queries.GET_WALLETS, { variables: { wallet: admin || wallet.publicKey?.toBase58() } });
    const { data: projectWallet, refetch: refetchProjectWallet } = useAuthQuery(queries.GET_WALLETPUBKEY, {
        variables: { project: '', wallet: admin || wallet.publicKey?.toBase58() }
    });
    const [data1, setData1] = useState<any[]>([]);

    const { showInfoToast, showSuccessToast, showErrorToast } = useToasts();
    const { startLoading, stopLoading } = useMeta();

    const getBalance = async (pubKey: string) => {
        const fromWindowsWallet = new PublicKey(pubKey);
        const getBal = await connection.getBalance(fromWindowsWallet);
        const tokenAccount = await connection.getParsedTokenAccountsByOwner(fromWindowsWallet, {
            mint: new PublicKey(USDCMINT)
        });
        const usdcBal = tokenAccount?.value[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;

        return {
            solBalance: getBal / LAMPORTS_PER_SOL,
            balance: usdcBal
        };
    };

    const getProjects = async () => {
        const { data: projectsData } = await refetch();
        const projects = projectsData.getWallets;
        const records: any[] = [];
        await Promise.map(projects, async (proj: any) => {
            const { data: projectData } = await refetchProjectWallet({
                project: proj.project,
                wallet: admin || wallet.publicKey?.toBase58()
            });
            const pubKey = projectData.getWalletPubkey.pubkey;
            const { solBalance, balance } = await getBalance(pubKey);
            const result = {
                project: proj.project,
                pubKey,
                solBalance,
                balance
            };
            records.push(result);
        });
        setNumberOfProject(records.length);
        setTotalSolBal(sumBy(records, 'solBalance'));
        setTotalUSDCBal(sumBy(records, 'balance'));
        return records;
    };

    const onGenerate = async () => {
        if (!project) {
            showErrorToast('Project field required.');
            return;
        }
        if (!wallet || !wallet.publicKey) {
            showErrorToast('Please connect wallet.');
            return;
        }
        startLoading();
        setIsLoading(true);
        try {
            await createWallet({ variables: { project, wallet: wallet.publicKey?.toBase58() } });
            updatePage();
            showSuccessToast('New project has been created successfully.');
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            stopLoading();
            setShowNewProjectDialog(false);
            setSelectedProject(project);
            setProject('');
        }
    };

    const handleProjectNameChange = ({ target: { value } }: any) => {
        setProject(value);
    };

    const depositSol = async () => {
        const amount = depositAmt;
        const toPubkey = depositWallet;
        if (!wallet || !wallet.publicKey || !amount || !toPubkey) {
            return;
        }
        try {
            setIsDepositing(true);
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: new PublicKey(toPubkey),
                    lamports: LAMPORTS_PER_SOL * amount
                })
            );
            transaction.feePayer = wallet.publicKey;
            const anyTransaction: any = transaction;
            const conn = new web3.Connection(DEFAULT_RPC, {
                confirmTransactionInitialTimeout: 10 * 1000, // 60 Seconds
                commitment: 'confirmed'
            });
            const latestBlockHash = await conn.getLatestBlockhash();
            anyTransaction.recentBlockhash = latestBlockHash.blockhash;
            // Sign transaction, broadcast, and confirm
            const signature = await wallet.sendTransaction(transaction, conn, {});
            await conn.confirmTransaction(
                {
                    blockhash: latestBlockHash.blockhash,
                    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                    signature
                },
                'processed'
            );
            console.log('SIGNATURE', signature);
            showSuccessToast(`You have successfully deposit ${amount.toFixed(2)} SOL.`);
        } catch (error) {
            console.log(error);
            showErrorToast('There are some issues with the transaction. It may due to Solana congestion.');
        } finally {
            setShowDepositDialog(false);
            setIsDepositing(false);
            await updatePage();
        }
    };
    const depositUSDC = async () => {
        const amount = depositAmt;
        const toPubkey = depositWallet;
        if (!wallet || !wallet.publicKey || !amount || !wallet.signTransaction || !toPubkey) {
            return;
        }
        try {
            setIsDepositing(true);
            const USDCTokenMintPk = new PublicKey(USDCMINT);
            const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                wallet.publicKey,
                USDCTokenMintPk,
                wallet.publicKey,
                wallet.signTransaction
            );

            const toTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                wallet.publicKey,
                USDCTokenMintPk,
                new PublicKey(toPubkey),
                wallet.signTransaction
            );

            const transaction = new Transaction().add(
                createTransferInstruction(
                    fromTokenAccount.address,
                    toTokenAccount.address,
                    wallet.publicKey,
                    amount * 1_000_000,
                    [],
                    TOKEN_PROGRAM_ID
                )
            );

            const anyTransaction: any = transaction;

            const conn = new web3.Connection(DEFAULT_RPC, {
                confirmTransactionInitialTimeout: 10 * 1000, // 60 Seconds
                commitment: 'confirmed'
            });
            const latestBlockHash = await conn.getLatestBlockhash();
            anyTransaction.recentBlockhash = latestBlockHash.blockhash;

            const signature = await wallet.sendTransaction(transaction, conn);

            const response = await conn.confirmTransaction(
                {
                    blockhash: latestBlockHash.blockhash,
                    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                    signature
                },
                'processed'
            );
            console.log('response', response);
            showSuccessToast(`You have successfully deposit ${amount.toFixed(2)} USDC.`);
        } catch (error) {
            showErrorToast('There are some issues with the transaction. It may due to Solana congestion.');
        } finally {
            setShowDepositDialog(false);
            setIsDepositing(false);
            await updatePage();
        }
    };

    const withdraw = async () => {
        const amount = withdrawAmt;
        try {
            setIsWithdrawing(true);
            const { data: withdrawRes } = await clickWithdraw({
                variables: {
                    project: withdrawProject,
                    method: withdrawCurrency,
                    amount: round(withdrawCurrency === 'SOL' ? (amount - 0.00095) * LAMPORTS_PER_SOL : amount * 1_000_000, 0)
                }
            });
            const txHash = withdrawRes.clickWithdraw;
            if (!txHash) {
                throw new Error('There are some issues with the transaction. It may due to Solana congestion.');
            }
            showSuccessToast(`You have successfully withdraw ${amount.toFixed(2)} ${withdrawCurrency}. Transaction: ${txHash}`);
        } catch (err: any) {
            showErrorToast(err.message || err);
        } finally {
            setShowWithdrawDialog(false);
            setIsWithdrawing(false);
            await updatePage();
        }
    };

    const handleDeposit = (address: string) => {
        setDepositAmt(0);
        setDepositWallet(address);
        setShowDepositDialog(true);
    };
    const handleWithdraw = (proj: string, maxBal: any) => {
        setMaxBalance(maxBal);
        setWithdrawCurrency(maxBal.solBalance > 0 ? 'SOL' : 'USDC');
        setWithdrawAmt(maxBal.solBalance > 0 ? maxBal.solBalance : maxBal.balance);
        setWithdrawProject(proj);
        setShowWithdrawDialog(true);
    };

    const updatePage = async () => {
        try {
            setIsLoading(true);
            const records = await getProjects();
            setData1(sortBy(records, 'project'));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        updatePage();

        if (!wallet || wallet.publicKey === null) {
            return;
        }

        let timerId = 0;
        const queryProjectsBalance = async () => {
            if (data1 && data1.length) {
                const newData1 = await Promise.map(data1, async ({ project: proj, pubKey }: any) => {
                    const { solBalance, balance } = await getBalance(pubKey);
                    return {
                        project: proj,
                        pubKey,
                        solBalance,
                        balance
                    };
                });
                setData1(newData1);
            }

            startTimer();
        };

        const startTimer = () => {
            timerId = window.setTimeout(async () => {
                await queryProjectsBalance();
            }, 4000);
        };

        queryProjectsBalance();
        return () => {
            clearTimeout(timerId);
        };
    }, []);

    const ProjectListCard = ({ children, sx }: any) => (
        <MainCard
            border={false}
            divider={false}
            title={<FormattedMessage id="projects" />}
            contentSX={sx}
            secondary={
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Create new project">
                        <IconButton
                            sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : theme.palette.primary.light }}
                            onClick={() => {
                                setSelectedProject('');
                                setProject('');
                                setShowNewProjectDialog(true);
                            }}
                        >
                            <AddOutlined />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh">
                        <IconButton
                            onClick={() => updatePage()}
                            sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : theme.palette.primary.light }}
                        >
                            <RefreshOutlined />
                        </IconButton>
                    </Tooltip>
                </Box>
            }
            sx={{
                width: '100%',
                '.MuiCardContent-root:last-child': {
                    pb: { md: 0 }
                }
            }}
        >
            <Box sx={{ display: 'flex', gap: 1, px: 2, pb: 2 }}>
                <ExclamationCircleOutlined />
                <Typography fontSize={10}>
                    Please ensure to have enough sol to cover transaction fees. E.g. If you are paying 10 sol, please have 10.1 sol
                    deposited, if you are paying 100 USDC, please also at least deposit 0.1 sol.
                </Typography>
            </Box>
            {children}
        </MainCard>
    );

    return (
        <>
            <Box sx={{ width: '100%', mb: 2 }}>
                <ProjectListCard sx={{ p: 0 }}>
                    {!isLoading ? (
                        <>
                            {data && data1.length > 0 ? (
                                <Grid container spacing={2} sx={{ px: 2, pb: 2 }}>
                                    {map(data1, (item: any, i: number) => (
                                        <Grid item xs={12} sm={6} md={4} xl={3}>
                                            <ProjectCard
                                                key={i}
                                                index={i}
                                                {...item}
                                                selectedProject={selectedProject}
                                                notifyProjects={notifyProjects}
                                                handleDeposit={handleDeposit}
                                                handleWithdraw={handleWithdraw}
                                                setSelectProject={(proj: string) => setSelectedProject(proj)}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Grid item sx={{ p: 2 }}>
                                    <Typography component="h2" sx={{ textAlign: 'center' }}>
                                        <FormattedMessage id="no-projects-found" />
                                    </Typography>
                                </Grid>
                            )}
                        </>
                    ) : (
                        <Grid item sx={{ p: 2 }}>
                            <LinearProgress color="secondary" />
                        </Grid>
                    )}
                </ProjectListCard>
            </Box>
            <Dialog
                open={showNewProjectDialog}
                onClose={() => {
                    setShowNewProjectDialog(false);
                }}
            >
                <DialogTitle>
                    <FormattedMessage id="create-a-new-project" />
                </DialogTitle>
                <DialogContent>
                    <Grid container sx={{ py: 2, alignItems: 'center', flex: 1, justifyContent: 'flex-start' }}>
                        <Grid item xs={12}>
                            <Typography component="h2" sx={{ py: 2, textAlign: 'start' }}>
                                <FormattedMessage id="create-project-desc" />
                            </Typography>
                            <FormattedMessage id="new-project-name">
                                {(msg) => (
                                    <TextField
                                        fullWidth
                                        id="standard-basic"
                                        value={project}
                                        label={`${msg}`}
                                        variant="outlined"
                                        onChange={(e) => handleProjectNameChange(e)}
                                    />
                                )}
                            </FormattedMessage>
                        </Grid>
                    </Grid>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ pt: 3, px: 2 }}>
                    <Button variant="outlined" color="primary" onClick={() => setShowNewProjectDialog(false)}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button variant="contained" color="secondary" onClick={onGenerate}>
                        <FormattedMessage id="create-a-new-project" />
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={showDepositDialog}
                onClose={() => {
                    setShowDepositDialog(false);
                }}
            >
                <DialogTitle>
                    <FormattedMessage id="deposit-to-project-wallet" />
                </DialogTitle>
                <DialogContent>
                    <Grid container sx={{ py: 2, alignItems: 'center', flex: 1, justifyContent: 'flex-start' }}>
                        <Grid item xs={12}>
                            <Typography component="h2" sx={{ py: 2, textAlign: 'start' }}>
                                <FormattedMessage id="amount-to-be-deposit" />
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <FormattedMessage id="deposit-amount-placeholder">
                                    {(msg) => (
                                        <NumberInput
                                            className="number-control"
                                            name="depositAmount"
                                            value={depositAmt}
                                            min={0.01}
                                            step={0.01}
                                            precision={2}
                                            onChange={(value?: number) => {
                                                if (!value) return;
                                                if (value >= 0.01) {
                                                    setDepositAmt(value);
                                                }
                                            }}
                                            placeholder={`${msg}`}
                                        />
                                    )}
                                </FormattedMessage>

                                <FormControl>
                                    <Select value={depositCurrency} defaultValue="SOL" onChange={(e) => setDepositCurrency(e.target.value)}>
                                        <MenuItem value="SOL">SOL</MenuItem>
                                        <MenuItem value="USDC">USDC</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ pt: 3, px: 2 }}>
                    <Button variant="outlined" color="primary" onClick={() => setShowDepositDialog(false)}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <LoadingButton
                        variant="contained"
                        color="secondary"
                        loading={isDepositing}
                        onClick={async () => {
                            if (depositCurrency === 'SOL') {
                                await depositSol();
                            } else {
                                await depositUSDC();
                            }
                        }}
                    >
                        <FormattedMessage id="deposit" />
                    </LoadingButton>
                </DialogActions>
            </Dialog>
            <Dialog
                open={showWithdrawDialog}
                onClose={() => {
                    setShowWithdrawDialog(false);
                }}
            >
                <DialogTitle>
                    <FormattedMessage id="withdraw-from-project-wallet" />
                </DialogTitle>
                <DialogContent>
                    <Grid container sx={{ py: 2, alignItems: 'center', flex: 1, justifyContent: 'flex-start' }}>
                        <Grid item xs={12}>
                            <Typography component="h2" sx={{ py: 2, textAlign: 'start' }}>
                                <FormattedMessage id="amount-to-be-withdraw" />
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <FormattedMessage id="withdraw-amount-placeholder">
                                    {(msg) => (
                                        <NumberInput
                                            className="number-control"
                                            name="withdrawAmount"
                                            value={withdrawAmt}
                                            min={0.000001}
                                            step={0.01}
                                            precision={10}
                                            onChange={(value?: number) => {
                                                if (!value) return;
                                                if (value >= 0.000001) {
                                                    setWithdrawAmt(value);
                                                }
                                            }}
                                            placeholder={`${msg}`}
                                        />
                                    )}
                                </FormattedMessage>

                                <FormControl>
                                    <Select
                                        value={withdrawCurrency}
                                        defaultValue="SOL"
                                        onChange={(e) => {
                                            setWithdrawCurrency(e.target.value);
                                            setWithdrawAmt(e.target.value === 'SOL' ? maxBalance.solBalance : maxBalance.balance);
                                        }}
                                    >
                                        <MenuItem value="SOL">SOL</MenuItem>
                                        <MenuItem value="USDC">USDC</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ pt: 3, px: 2 }}>
                    <Button variant="outlined" color="primary" onClick={() => setShowWithdrawDialog(false)}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <LoadingButton
                        variant="contained"
                        color="secondary"
                        loading={isWithdrawing}
                        onClick={async () => {
                            await withdraw();
                        }}
                    >
                        <FormattedMessage id="withdraw" />
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
}
