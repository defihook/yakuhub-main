import { RESTDataSource } from 'apollo-datasource-rest';
import axios from 'axios';

class ManagementAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://project.yaku.ai';
    }

    async getClaimers(context, args) {
        try {
            const { data } = await axios.post(`${this.baseURL}/claimers`, {
                context: {
                    req: {
                        ip: context.req.ip
                    },
                    user: context.user
                },
                args
            });
            return data;
        } catch (error) {
            console.error(error);
        }
        return undefined;
    }

    async getClaimer(context, args) {
        try {
            const { data } = await axios.post(`${this.baseURL}/claimer`, {
                context: {
                    req: {
                        ip: context.req.ip
                    },
                    user: context.user
                },
                args
            });
            return data;
        } catch (error) {
            console.error(error);
        }
        return undefined;
    }

    async getEmployees(context, args) {
        try {
            const { data } = await axios.post(`${this.baseURL}/employees`, {
                context: {
                    req: {
                        ip: context.req.ip
                    },
                    user: context.user
                },
                args
            });
            return data;
        } catch (error) {
            console.error(error);
        }
        return undefined;
    }

    async createClaimer(context, args) {
        try {
            const { data } = await axios.post(`${this.baseURL}/claimer/new`, {
                context: {
                    req: {
                        ip: context.req.ip
                    },
                    user: context.user
                },
                args
            });
            return data;
        } catch (error) {
            console.error(error);
        }
        return undefined;
    }

    async deleteClaimer(context, args) {
        try {
            const { data } = await axios.post(`${this.baseURL}/claimer/remove`, {
                context: {
                    req: {
                        ip: context.req.ip
                    },
                    user: context.user
                },
                args
            });
            return data;
        } catch (error) {
            console.error(error);
        }
        return undefined;
    }

    async clickClaim(context, args) {
        try {
            const { data } = await axios.post(`${this.baseURL}/claimer/claim`, {
                context: {
                    req: {
                        ip: context.req.ip
                    },
                    user: context.user
                },
                args
            });
            return data;
        } catch (error) {
            console.error(error);
        }
        return undefined;
    }

    async getWallets(context, args) {
        try {
            const { data } = await axios.post(`${this.baseURL}/project`, {
                context: {
                    req: {
                        ip: context.req.ip
                    },
                    user: context.user
                },
                args
            });
            return data;
        } catch (error) {
            console.error(error);
        }
        return undefined;
    }

    async getWalletPubkey(context, args) {
        try {
            const { data } = await axios.post(`${this.baseURL}/project/pubkey`, {
                context: {
                    req: {
                        ip: context.req.ip
                    },
                    user: context.user
                },
                args
            });
            return data;
        } catch (error) {
            console.error(error);
        }
        return undefined;
    }

    async createWallet(context, args) {
        try {
            const { data } = await axios.post(`${this.baseURL}/project/new`, {
                context: {
                    req: {
                        ip: context.req.ip
                    },
                    user: context.user
                },
                args
            });
            return data;
        } catch (error) {
            console.error(error);
        }
        return undefined;
    }

    async clickWithdraw(context, args) {
        try {
            const { data } = await axios.post(`${this.baseURL}/project/withdraw`, {
                context: {
                    req: {
                        ip: context.req.ip
                    },
                    user: context.user
                },
                args
            });
            return data;
        } catch (error) {
            console.error(error);
        }
        return undefined;
    }
}

export default ManagementAPI;
