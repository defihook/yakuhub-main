import { RESTDataSource } from 'apollo-datasource-rest';
import axios from 'axios';

class CoinGeckoAPI extends RESTDataSource {
    client;

    constructor() {
        super();
        this.baseURL = 'https://proxy.yaku.ai/api/cg';
    }

    async ping() {
        const { data } = await axios.post(`${this.baseURL}/ping`, {});
        return { success: true, message: '', code: 200, data };
    }

    async global() {
        const { data } = await axios.post(`${this.baseURL}/global`, {});
        return { success: true, message: '', code: 200, data };
    }

    async listCoins(params) {
        const { data } = await axios.post(`${this.baseURL}/coins`, { params });
        return { success: true, message: '', code: 200, data };
    }

    async marketsCoins(params) {
        const { data } = await axios.post(`${this.baseURL}/coins/markets`, { params });
        return { success: true, message: '', code: 200, data };
    }

    async fetchCoin(coinId, params) {
        const { data } = await axios.post(`${this.baseURL}/coin`, { coinId, params });
        return { success: true, message: '', code: 200, data };
    }

    async fetchTickers(coinId, params) {
        const { data } = await axios.post(`${this.baseURL}/coin/tickers`, { coinId, params });
        return { success: true, message: '', code: 200, data };
    }

    async fetchHistory(coinId, params) {
        const { data } = await axios.post(`${this.baseURL}/coin/history`, { coinId, params });
        return { success: true, message: '', code: 200, data };
    }

    async fetchMarketChart(coinId, params) {
        const { data } = await axios.post(`${this.baseURL}/coin/market`, { coinId, params });
        return { success: true, message: '', code: 200, data };
    }

    async fetchMarketRange(coinId, params) {
        const { data } = await axios.post(`${this.baseURL}/coin/market/range`, { coinId, params });
        return { success: true, message: '', code: 200, data };
    }

    async fetchOHLC(coinId, params) {
        const { data } = await axios.post(`${this.baseURL}/coin/ohlc`, { coinId, params });
        return { success: true, message: '', code: 200, data };
    }

    async simplePrice(params) {
        const { data } = await axios.post(`${this.baseURL}/price`, { params });
        return { success: true, message: '', code: 200, data };
    }
}

export default CoinGeckoAPI;
