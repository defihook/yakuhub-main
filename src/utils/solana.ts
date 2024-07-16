import { PublicKey } from '@solana/web3.js';

import nacl from 'tweetnacl';
import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';

export async function getOrCreateAssociatedTokenAddressInstruction(
    mint: PublicKey,
    owner: PublicKey,
    connection: anchor.web3.Connection,
    payer?: PublicKey
) {
    const address = await getAssociatedTokenAddressResult(mint, owner);
    const tokenAccount = await connection.getAccountInfo(address);

    const instructions: anchor.web3.TransactionInstruction[] = [];
    if (!tokenAccount) {
        instructions.push(
            Token.createAssociatedTokenAccountInstruction(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint,
                address,
                owner,
                payer ?? owner
            )
        );
    }

    return { address, instructions };
}

export async function getAssociatedTokenAddressResult(mint: PublicKey, owner: PublicKey) {
    return Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, owner);
}

// export async function getTokenAccount(connection: Connection, mint: PublicKey, user: PublicKey) {
//     const userTokenAccounts = await connection.getParsedTokenAccountsByOwner(user, { mint: mint });
//     if (userTokenAccounts.value.length === 0) return null;
//     return (userTokenAccounts.value.find(
//         (t) => t.account.data.parsed.info.tokenAmount.uiAmount
//     ) ?? userTokenAccounts.value[0]) as ParsedTokenAccount);
// }

// export async function getNftWithMetadata(mint: PublicKey) {
//     let [pda] = await anchor.web3.PublicKey.findProgramAddress(
//         [
//             Buffer.from('metadata'),
//             TOKEN_METADATA_PROGRAM_ID.toBuffer(),
//             new anchor.web3.PublicKey(mint).toBuffer(),
//         ],
//         TOKEN_METADATA_PROGRAM_ID
//     )

//     const accountInfo: any = await connection.getParsedAccountInfo(pda);
//     const chainMetadata = new Metadata(mint.toString(), accountInfo.value);
//     const metadataRes = await axios.get(chainMetadata.data.data.uri);

//     return { ...chainMetadata, ...metadataRes.data } as NftMetadata;
// }

// export async function getRoleOfNft(nft: PublicKey, user?: PublicKey, connection?: Connection) {
//     const nftMetadata = await getNftWithMetadata(nft);
//     const role = (nftMetadata as any)?.attributes?.find(
//         (a: any) => a.trait_type === 'Role'
//     )?.value! as string

//     if (casRoles.includes(role)) return NftRole.CosmicRoles;
//     return NftRole.OneOfOne;
// }

// export async function getRawRoleOfNft(nft: PublicKey, user: PublicKey, connection: Connection) {
//     const nftMetadata = await getNftWithMetadata(nft)

//     const role = (nftMetadata as any)?.attributes?.find(
//         (a: any) => a.trait_type === 'Role'
//     ).value! as string

//     return role
// }

export function verifySignature(address: string, signature: number[]) {
    const wallet = new anchor.web3.PublicKey(address);
    const message = new TextEncoder().encode('whitelisted');

    const res = nacl.sign.detached.verify(message, Uint8Array.from(signature), wallet.toBytes());

    return res;
}
