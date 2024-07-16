/* eslint-disable @typescript-eslint/no-unused-vars */
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Commitment, Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
import { toast } from 'react-toastify';
// eslint-disable-next-line import/extensions
import { IDL as idl } from './raffle';

const options: { preflightCommitment: Commitment } = {
    preflightCommitment: 'processed'
};

export const programId = new PublicKey('jbhC29Ej7asccPXXa4Xeso9nACTgN8NKH2peKYPpQ8f');

export const getProgram = (wallet: WalletContextState, connection: Connection) => {
    const provider = new anchor.AnchorProvider(connection, wallet as any, options);
    const program = new Program(idl as unknown as anchor.Idl, programId, provider);
    return program;
};

export const initialize = async (wallet: WalletContextState, connection: Connection, globalName: string, setLoading: Function) => {
    if (wallet.publicKey === null) return;
    const provider = new anchor.AnchorProvider(connection, wallet as any, options);
    const program = new anchor.Program(idl as unknown as anchor.Idl, programId, provider);
    setLoading(true);
    try {
        const [globalAuthority, bump] = await PublicKey.findProgramAddress(
            [Buffer.from(globalName), Buffer.from('global-authority')],
            program.programId
        );
        const tx = program.transaction.initialize(bump, globalName, {
            accounts: {
                admin: wallet.publicKey,
                globalAuthority,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY
            }
        });

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
        toast.error('Fail');
    }
    setLoading(false);
};

export const getGlobalSate = async (connection: Connection, wallet: PublicKey, globalName: string) => {
    const provider = new anchor.AnchorProvider(connection, wallet as any, options);
    const program = new anchor.Program(idl as unknown as anchor.Idl, programId, provider);

    const [globalAuthority] = await PublicKey.findProgramAddress(
        [Buffer.from(globalName), Buffer.from('global-authority')],
        program.programId
    );
    // console.log(globalAuthority.toString());
    const globalData = await program.account.globalPool.fetchNullable(globalAuthority);
    return globalData;
};
