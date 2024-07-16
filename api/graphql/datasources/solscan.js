import { RESTDataSource } from 'apollo-datasource-rest';
import axios from 'axios';
import { filter } from 'lodash';

class SolScanAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://public-api.solscan.io/';
    }

    async fetchAccount(account) {
        this.baseURL = 'https://public-api.solscan.io/';
        const { data } = await axios.get(`${this.baseURL}account/${account}`, { withCredentials: true });
        return data;
    }

    async getAccountTokens(account) {
        this.baseURL = 'https://public-api.solscan.io/';
        const { data } = await axios.get(`${this.baseURL}account/tokens?account=${account}`, { withCredentials: true });
        return filter(data, ({ tokenName }) => !!tokenName);
    }
}

export default SolScanAPI;
