/* eslint-disable @typescript-eslint/no-unused-vars */
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import {
    createAssociatedTokenAccountInstruction,
    createTransferCheckedInstruction,
    getAssociatedTokenAddress,
    getMint
} from '@solana/spl-token-v2';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Commitment, Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
import { toast } from 'react-toastify';
import { IDL as idl } from './staking';

export const options: {
    preflightCommitment: Commitment;
} = {
    preflightCommitment: 'processed'
};

export const programId = new PublicKey('HakYS4S2zDAH54hH9L1dAbfXLhiAS8gEJcdpJcmJ6Uqv');

// eslint-disable-next-line import/prefer-default-export
export const getProgram = (wallet: WalletContextState, connection: Connection) => {
    const provider = new anchor.AnchorProvider(connection, wallet as any, options);
    const program = new Program(idl as unknown as anchor.Idl, programId, provider);
    return program;
};

export const initGlobal = async (
    wallet: WalletContextState,
    connection: Connection,
    decimals: number,
    vaultName: string,
    nftCreator: string,
    rewardTokenMint: PublicKey,
    traitRates: any,
    traitNames: any,
    dailyReward: number,
    durations: any,
    durationRewards: any,
    setLoading: Function
) => {
    if (wallet.publicKey === null) return;
    const provider = new anchor.AnchorProvider(connection, wallet as any, options);
    const program = new anchor.Program(idl as unknown as anchor.Idl, programId, provider);
    try {
        const [globalAuthority, bump] = await PublicKey.findProgramAddress(
            [Buffer.from(vaultName), Buffer.from('global-authority')],
            program.programId
        );

        setLoading(true);

        const tx = new Transaction();
        tx.add(
            program.instruction.initializeGlobal(
                bump,
                vaultName,
                new PublicKey(nftCreator),
                rewardTokenMint,
                traitRates,
                traitNames,
                new anchor.BN(dailyReward * decimals),
                Buffer.from(durations),
                durationRewards.map((reward: number) => new anchor.BN(reward * decimals)),
                {
                    accounts: {
                        admin: wallet.publicKey,
                        globalAuthority,
                        systemProgram: SystemProgram.programId,
                        rent: SYSVAR_RENT_PUBKEY
                    }
                }
            )
        );
        const txSignature = await wallet.sendTransaction(tx, program.provider.connection);
        await program.provider.connection.confirmTransaction(txSignature, 'confirmed');
        toast.success('Success');
        setLoading(false);
    } catch (error) {
        console.log(error);
        toast.error('Fail');
        setLoading(false);
    }
};

export const updateGlobal = async (
    wallet: WalletContextState,
    connection: Connection,
    decimals: number,
    vaultName: string,
    nftCreator: string,
    rewardTokenMint: PublicKey,
    traitRates: any,
    traitNames: any,
    dailyReward: number,
    durations: any,
    durationRewards: any,
    setLoading: Function
) => {
    if (wallet.publicKey === null) return;
    const provider = new anchor.AnchorProvider(connection, wallet as any, options);
    const program = new anchor.Program(idl as unknown as anchor.Idl, programId, provider);
    try {
        const [globalAuthority, bump] = await PublicKey.findProgramAddress(
            [Buffer.from(vaultName), Buffer.from('global-authority')],
            program.programId
        );

        setLoading(true);

        const tx = new Transaction();
        tx.add(
            program.instruction.updateGlobal(
                bump,
                new PublicKey(nftCreator),
                rewardTokenMint,
                traitRates,
                traitNames,
                new anchor.BN(dailyReward * decimals),
                Buffer.from(durations),
                durationRewards.map((reward: number) => new anchor.BN(reward * decimals)),
                {
                    accounts: {
                        admin: wallet.publicKey,
                        globalAuthority
                    }
                }
            )
        );
        const { blockhash } = await provider.connection.getLatestBlockhash('confirmed');
        tx.feePayer = wallet.publicKey as PublicKey;
        tx.recentBlockhash = blockhash;
        if (wallet.signTransaction !== undefined) {
            const signedTx = await wallet.signTransaction(tx);

            const txId = await provider.connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: true,
                maxRetries: 3,
                preflightCommitment: 'confirmed'
            });

            console.log(txId, '==> txId');

            await connection.confirmTransaction(txId, 'finalized');
        }
        toast.success('Success');
        setLoading(false);
    } catch (error) {
        console.log(error);
        toast.error('Fail');
        setLoading(false);
    }
};

export const getGlobalSate = async (connection: Connection, wallet: PublicKey, vaultName: string) => {
    const provider = new anchor.AnchorProvider(connection, wallet as any, options);
    const program = new anchor.Program(idl as unknown as anchor.Idl, programId, provider);
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(vaultName), Buffer.from('global-authority')],
        program.programId
    );
    // console.log(globalAuthority.toString());
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const globalData: any = await program.account.globalPool.fetchNullable(globalAuthority);
    return globalData;
};

export const fund = async (
    wallet: WalletContextState,
    connection: Connection,
    setLoading: Function,
    splAddress: string,
    vaultName: string,
    fundAmount: number,
    decimals: number
) => {
    if (wallet.publicKey === null) return;
    const provider = new anchor.AnchorProvider(connection, wallet as any, options);
    const program = new anchor.Program(idl as unknown as anchor.Idl, programId, provider);
    setLoading(true);
    try {
        const [globalAuthority] = await PublicKey.findProgramAddress(
            [Buffer.from(vaultName), Buffer.from('global-authority')],
            program.programId
        );
        const globalData = await getGlobalSate(connection, wallet.publicKey, vaultName);
        const rewardMint = new PublicKey(splAddress);
        const senderAta = await getAssociatedTokenAddress(rewardMint, wallet.publicKey, false);
        const vaultAta = await getAssociatedTokenAddress(rewardMint, globalAuthority, true);
        const tx = new Transaction();
        const account = await program.provider.connection.getAccountInfo(vaultAta);
        if (!account) {
            tx.add(createAssociatedTokenAccountInstruction(wallet.publicKey, vaultAta, globalAuthority, rewardMint));
        }
        const splMint = await getMint(program.provider.connection, globalData.rewardTokenMint);
        tx.add(
            createTransferCheckedInstruction(senderAta, rewardMint, vaultAta, wallet.publicKey, fundAmount * decimals, splMint.decimals)
        );

        const { blockhash } = await provider.connection.getLatestBlockhash('confirmed');
        tx.feePayer = wallet.publicKey as PublicKey;
        tx.recentBlockhash = blockhash;
        if (wallet.signTransaction !== undefined) {
            const signedTx = await wallet.signTransaction(tx);

            const txId = await provider.connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: true,
                maxRetries: 3,
                preflightCommitment: 'confirmed'
            });

            console.log(txId, '==> txId');

            await connection.confirmTransaction(txId, 'finalized');
        }
        toast.success('Success');
    } catch (error) {
        console.log(error);
    }
    setLoading(false);
};
