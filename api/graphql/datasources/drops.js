import { RESTDataSource } from 'apollo-datasource-rest';

class DropsAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://api.howrare.is/v0.1/';
    }

    async fetchDrops() {
        try {
            const data = await this.get(`drops`);
            return data;
        } catch (error) {
            console.log(error);
        }
        return undefined;
    }

    async fetchRanks(symbol) {
        try {
            const data = await this.get(`collections/${symbol}`);
            return data;
        } catch (error) {
            console.log(error);
        }
        return undefined;
    }
}

export default DropsAPI;
