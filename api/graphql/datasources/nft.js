import { RESTDataSource } from 'apollo-datasource-rest';
import axios from 'axios';

class NFTAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://nft.yaku.ai/api/metadata/';
    }

    async list(mint) {
        try {
            const { data } = await axios.post(`${this.baseURL}`, { mint });
            return data;
        } catch (error) {
            console.log(error);
        }
        return undefined;
    }

    async create(mint) {
        try {
            const { data } = await axios.post(`${this.baseURL}/add`, { mint });
            return data;
        } catch (error) {
            console.log(error);
        }
        return undefined;
    }

    async update(mint) {
        try {
            const { data } = await axios.post(`${this.baseURL}/update`, { mint });
            return data;
        } catch (error) {
            console.log(error);
        }
        return undefined;
    }

    async fetch(mint) {
        try {
            const { data } = await axios.post(`${this.baseURL}/fetch`, { mint });
            return data;
        } catch (error) {
            console.log(error);
        }
        return undefined;
    }

    async getWallet(wallet) {
        try {
            const { data } = await axios.post(`${this.baseURL}/wallet`, { wallet });
            return data;
        } catch (error) {
            console.log(error);
        }
        return undefined;
    }
}

export default NFTAPI;
