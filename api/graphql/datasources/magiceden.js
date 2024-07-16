/* eslint-disable no-underscore-dangle */
import axios from 'axios';
import { RESTDataSource } from 'apollo-datasource-rest';

class MagicEdenAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://proxy.yaku.ai/api/me/';
    }

    async fetchStats(symbol) {
        const { data } = await axios.post(`${this.baseURL}collections/stats/fetch`, {
            symbol
        });
        return data;
    }

    async syncAllMECollections() {
        const { data } = await axios.post(`${this.baseURL}collections/sync`, {});
        return data;
    }

    // gets all ME Collections
    // Only for batch update database
    async getAllMECollections(page = 1, limit = 1500) {
        const { data } = await axios.post(`${this.baseURL}collections/page`, {
            page,
            limit
        });
        return data;
    }

    // get a single collection data
    async getCollectionStats(symbol) {
        const { data } = await axios.post(`${this.baseURL}collections/stats`, {
            symbol
        });
        return data;
    }

    // get collections by keyword
    // eslint-disable-next-line class-methods-use-this
    async getCollectionsByKeyword(keyword) {
        const { data } = await axios.post(`${this.baseURL}collections/search`, {
            keyword
        });
        return data;
    }

    // gets the ranks of a collection by ME collection symbol
    // eslint-disable-next-line consistent-return
    async getStatsBySymbol(symbol) {
        const { data } = await axios.post(`${this.baseURL}collections/rank`, {
            symbol
        });
        return data;
    }

    async getMETransactionInstructionsForSnipe(
        buyer,
        seller,
        auctionHouse,
        tokenMint,
        tokenAddress,
        price,
        expiry,
        pdaAddress,
        sellerReferral = '',
        buyerCreatorRoyaltyPercent = 0
    ) {
        const { data } = await axios.post(`${this.baseURL}tx/snipe`, {
            buyer,
            seller,
            auctionHouse,
            mint: tokenMint,
            tokenAddress,
            price,
            expiry,
            pdaAddress,
            sellerReferral,
            buyerCreatorRoyaltyPercent
        });
        return data;
    }

    async getTokenMintActivities(mint, offset = 0, limit = 100) {
        const { data } = await axios.post(`${this.baseURL}token/activities`, {
            mint,
            offset,
            limit
        });
        return data;
    }

    async getCollectionActivities(symbol, offset = 0, limit = 100) {
        const { data } = await axios.post(`${this.baseURL}collection/activities`, {
            symbol,
            offset,
            limit
        });
        return data;
    }

    async getTokenByMint(mint) {
        const { data } = await axios.post(`${this.baseURL}token`, {
            mint
        });
        return data;
    }

    async getListingByMint(mint) {
        const { data } = await axios.post(`${this.baseURL}token/listing`, {
            mint
        });
        return data;
    }

    async getListingBySymbol(symbol, offset = 0, limit = 20) {
        const { data } = await axios.post(`${this.baseURL}symbol/listings`, {
            symbol,
            offset,
            limit
        });
        return data;
    }

    async getMETransactionInstructions(buyer, mint) {
        const { data } = await axios.post(`${this.baseURL}tx/buy`, {
            buyer,
            mint
        });
        return data;
    }

    async getMEDelistTransactionInstructions(seller, mint) {
        console.log('getMEDelistTransactionInstructions', seller, mint);
        const { data } = await axios.post(`${this.baseURL}tx/delist`, {
            seller,
            mint
        });
        return data;
    }

    async getMEListTransactionInstructions(seller, mint, price) {
        const { data } = await axios.post(`${this.baseURL}tx/list`, {
            seller,
            mint,
            price
        });
        return data;
    }

    async getWalletTokens(wallet, offset, limit, listedOnly) {
        const { data } = await axios.post(`${this.baseURL}wallet`, {
            wallet,
            offset,
            limit,
            listedOnly
        });
        return data;
    }

    async getWalletAvatar(wallet) {
        const { data } = await axios.post(`${this.baseURL}wallet/avatar`, {
            wallet
        });
        return data;
    }

    async getWalletActivities(wallet, offset, limit) {
        const { data } = await axios.post(`${this.baseURL}wallet/activities`, {
            wallet,
            offset,
            limit
        });
        return data;
    }

    async getMEBidTransactionInstructions(buyer, mint, price) {
        const { data } = await axios.post(`${this.baseURL}tx/bid`, {
            buyer,
            mint,
            price
        });
        return data;
    }

    async getMEAcceptOfferTransactionInstructions(buyer, seller, mint, price, newPrice) {
        const { data } = await axios.post(`${this.baseURL}tx/accept`, {
            buyer,
            seller,
            mint,
            price,
            newPrice
        });
        return data;
    }

    async getMECancelBidTransactionInstructions(buyer, mint, price) {
        const { data } = await axios.post(`${this.baseURL}tx/bid/cancel`, {
            buyer,
            mint,
            price
        });
        return data;
    }

    async getMEChangeBidTransactionInstructions(buyer, mint, price, newPrice) {
        const { data } = await axios.post(`${this.baseURL}tx/bid/change`, {
            buyer,
            mint,
            price,
            newPrice
        });
        return data;
    }

    async getMEDepositTransactionInstructions(buyer, amount) {
        const { data } = await axios.post(`${this.baseURL}tx/deposit`, {
            buyer,
            amount
        });
        return data;
    }

    async getMEWithdrawTransactionInstructions(buyer, amount) {
        const { data } = await axios.post(`${this.baseURL}tx/withdraw`, {
            buyer,
            amount
        });
        return data;
    }

    async getMEEscrowBalance(wallet) {
        const { data } = await axios.post(`${this.baseURL}escrow`, {
            wallet
        });
        return data;
    }

    async getMEOfferMade(wallet, offset = 0, limit = 100) {
        const { data } = await axios.post(`${this.baseURL}wallet/offer/made`, {
            wallet,
            offset,
            limit
        });
        return data;
    }

    async getMEOfferReceived(wallet, offset = 0, limit = 100) {
        const { data } = await axios.post(`${this.baseURL}wallet/offer/received`, {
            wallet,
            offset,
            limit
        });
        return data;
    }

    async getMETokenOfferReceived(mint, offset = 0, limit = 100) {
        const { data } = await axios.post(`${this.baseURL}token/offer/received`, {
            mint,
            offset,
            limit
        });
        return data;
    }
}

export default MagicEdenAPI;