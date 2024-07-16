/* eslint-disable no-underscore-dangle */
import { RESTDataSource } from 'apollo-datasource-rest';
import axios from 'axios';

class HyperspaceAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://proxy.yaku.ai/api/aggregator';
    }

    async getProjectStats(condition, orderBy, paginationInfo) {
        console.log('getProjectStats', condition, orderBy, paginationInfo);
        const { data } = await axios.post(`${this.baseURL}/project/stats`, {
            condition,
            orderBy,
            paginationInfo
        });
        return data;
    }

    async searchProjectByName(condition) {
        console.log('searchProjectByName', condition);
        const { data } = await axios.post(`${this.baseURL}/project/search`, {
            condition
        });
        return data;
    }

    async getProjectStatHistory(condition) {
        console.log('getProjectStatHistory', condition);
        const { data } = await axios.post(`${this.baseURL}/project/history`, {
            condition
        });
        return data;
    }

    async getMarketplaceSnapshot(condition, orderBy, paginationInfo) {
        console.log('getMarketplaceSnapshot', condition, orderBy, paginationInfo);
        const { data } = await axios.post(`${this.baseURL}/project/mp/snapshot`, {
            condition,
            orderBy,
            paginationInfo
        });
        return data;
    }

    async getMarketplaceActivities(condition, paginationInfo) {
        console.log('getMarketplaceActivities', condition, paginationInfo);
        const { data } = await axios.post(`${this.baseURL}/project/mp/activities`, {
            condition,
            paginationInfo
        });
        return data;
    }

    async getNonMpaProjectHistory(condition, paginationInfo) {
        console.log('getNonMpaProjectHistory', condition, paginationInfo);
        const { data } = await axios.post(`${this.baseURL}/project/activities`, {
            condition,
            paginationInfo
        });
        return data;
    }

    async createBuyTx(buyerAddress, price, tokenAddress, buyerBroker) {
        console.log('createBuyTx', buyerAddress, price, tokenAddress, buyerBroker);
        const { data } = await axios.post(`${this.baseURL}/tx/buy`, { buyerAddress, price, tokenAddress, buyerBroker });
        return data;
    }

    async createDelistTx(sellerAddress, tokenAddress) {
        console.log('createDelistTx', sellerAddress, tokenAddress);
        const { data } = await axios.post(`${this.baseURL}/tx/delist`, { sellerAddress, tokenAddress });
        return data;
    }

    async getTokenState(condition, orderBy, paginationInfo) {
        console.log('getTokenState', condition, orderBy, paginationInfo);
        const { data } = await axios.post(`${this.baseURL}/token/state`, {
            condition,
            orderBy,
            paginationInfo
        });
        return data;
    }

    async getTokenHistory(condition, paginationInfo) {
        console.log('getTokenHistory', condition, paginationInfo);
        const { data } = await axios.post(`${this.baseURL}/token/history`, {
            condition,
            paginationInfo
        });
        return data;
    }

    async getWalletStats(condition, orderBy, paginationInfo) {
        console.log('getWalletStats', condition, orderBy, paginationInfo);
        const { data } = await axios.post(`${this.baseURL}/wallet/stats`, {
            condition,
            orderBy,
            paginationInfo
        });
        return data;
    }

    async getWalletStatsHist(condition) {
        console.log('getWalletStatsHist', condition);
        const { data } = await axios.post(`${this.baseURL}/wallet/history`, {
            condition
        });
        return data;
    }

    async getUserListings(condition, orderBy) {
        console.log('getUserListings', condition, orderBy);
        const { data } = await axios.post(`${this.baseURL}/wallet/listings`, {
            condition,
            orderBy
        });
        return data;
    }
}

export default HyperspaceAPI;
