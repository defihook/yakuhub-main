import { RESTDataSource } from 'apollo-datasource-rest';
import axios from 'axios';

class CoralAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://proxy.yaku.ai/api/cc';
    }

    async getUserProfile(pubkey) {
        const { data } = await axios.post(`${this.baseURL}/wallet/profile`, { pubkey });
        return data;
    }
}

export default CoralAPI;
