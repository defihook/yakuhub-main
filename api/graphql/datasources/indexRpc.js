import { RESTDataSource } from 'apollo-datasource-rest';
import axios from 'axios';

class IndexRPCAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://rpc.theindex.io/mainnet-beta/e9321fbe-9f09-4b02-a4a5-42cad71a2062';
    }

    async getNFTsByOwner(wallets, id = 1) {
        try {
            const { data } = await axios.post(this.baseURL, {
                method: 'getNFTsByOwner',
                jsonrpc: '2.0',
                params: wallets,
                id
            });
            return data;
        } catch (error) {
            console.log(error);
        }
        return undefined;
    }
}

export default IndexRPCAPI;
