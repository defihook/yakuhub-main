import { RESTDataSource } from 'apollo-datasource-rest';
import axios from 'axios';

class GemsAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURLGem = 'https://gem-public-api.herokuapp.com';
        this.baseURLReservoir = 'https://api.reservoir.tools';
        this.reservoirApiKey = process.env.RESERVOIR_API_KEY;
        this.gemsApiKey = process.env.GEM_API_KEY;
    }

    async getAttributesOfCollection(projectId) {
        try {
            let attr;
            await axios
                .request({
                    method: 'GET',
                    url: `${this.baseURLReservoir}/collections/${projectId}/attributes/all/v2`,
                    headers: { accept: '*/*', 'x-api-key': this.reservoirApiKey }
                })
                .then(async (response) => {
                    attr = await response.data.attributes.map((attribute) => ({
                        name: attribute.key,
                        type: 'CATEGORY',
                        values: attribute.values.map((value) => value.value)
                    }));
                })
                .catch((error) => {
                    console.error('error', error);
                });
            return attr;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getProjectStats(condition, orderBy, paginationInfo) {
        try {
            console.log('getProjectStatsETH', condition, orderBy, paginationInfo);
            // // Reservoir API maximum collections count is 10000
            // // Reservoir API maximum limit count is 20
            const maxLimit = 20;
            // const totalPageNumber = 10000 / maxLimit;
            let attr = [];
            let params = {};

            if (condition.projectIds) {
                params = {
                    id: condition.projectIds[0],
                    includeTopBid: 'false',
                    sortBy: orderBy.field_name,
                    limit: maxLimit
                };

                attr = await this.getAttributesOfCollection(condition.projectIds[0]);
            } else {
                params = {
                    includeTopBid: 'false',
                    sortBy: orderBy.field_name,
                    limit: maxLimit
                };
            }

            const options = {
                method: 'GET',
                url: `${this.baseURLReservoir}/collections/v5`,
                params,
                headers: { accept: '*/*', 'x-api-key': this.reservoirApiKey }
            };

            let resp = {};
            await axios
                .request(options)
                .then((response) => {
                    resp = response.data?.collections.map((collection) => ({
                        project_id: collection.id,
                        project: {
                            display_name: collection.name,
                            supply: collection.tokenCount,
                            img_url: collection.image,
                            project_attributes: attr
                        },
                        floor_price: collection.floorAsk?.price?.amount?.native || 0,
                        floor_price_1day_change: collection.floorSaleChange['1day'] / 100,
                        average_price: collection.floorSale['1day'], // check again
                        average_price_1day_change: collection.floorSaleChange['1day'] / 100, // check again
                        volume_1day: collection.volume['1day'],
                        volume_1day_change: collection.volumeChange['1day'] / 100,
                        volume_7day: collection.volume['7day'],
                        volume_7day_change: collection.volume['7day'] / 100,
                        num_of_token_listed: collection.onSaleCount,
                        percentage_of_token_listed: collection.onSaleCount / collection.tokenCount,
                        market_cap: collection.tokenCount * collection.floorAsk?.price?.amount?.usd || 0
                    }));
                })
                .catch((error) => {
                    console.error('error', error);
                });
            return {
                pagination_info: {
                    current_page_number: 1,
                    current_page_size: 20,
                    total_page_number: 1,
                    // "has_next_page": paginationInfo.page_number < totalPageNumber,
                    __typename: 'PaginationInfoResponseType'
                },
                project_stats: resp
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getNFTStats(condition) {
        try {
            let options = {
                method: 'GET',
                url: `${this.baseURLReservoir}/tokens/v5`,
                params: {
                    tokens: `${condition.projectIds}:${condition.tokenId}`,
                    sortBy: 'floorAskPrice',
                    limit: '100',
                    includeTopBid: 'false',
                    includeAttributes: 'true'
                },
                headers: { accept: '*/*', 'x-api-key': this.reservoirApiKey }
            };
            let resp = {};
            await axios
                .request(options)
                .then((response) => {
                    resp = response.data.tokens.map((collection) => ({
                        contract: collection.token.contract,
                        tokenId: collection.token.tokenId,
                        name: collection.token.name || collection.token.collection.name,
                        description: collection.token.description,
                        image: collection.token.image,
                        display_name: collection.token.collection.name,
                        media: collection.token.media,
                        kind: collection.token.kind,
                        owner: collection.token.owner,
                        price: collection.market.floorAsk?.price?.amount?.native,
                        marketplace_program_id: collection.market.floorAsk?.id,
                        attributes: collection.token.attributes
                    }));
                })
                .catch((error) => {
                    console.error(error);
                });

            options = {
                method: 'GET',
                url: `${this.baseURLReservoir}/orders/bids/v4`,
                params: {
                    token: `${condition.projectIds}:${condition.tokenId}`,
                    includeMetadata: 'false',
                    includeRawData: 'false',
                    sortBy: 'createdAt',
                    limit: '50'
                },
                headers: { accept: '*/*', 'x-api-key': this.reservoirApiKey }
            };
            let respOffers = {};
            await axios
                .request(options)
                .then((response) => {
                    // eslint-disable-next-line array-callback-return, consistent-return
                    respOffers = response.data.orders.map((order) => {
                        if (order.status === 'active')
                            return {
                                auctionHouse: order.source?.name,
                                buyer: order.maker,
                                expiry: order.expiration,
                                pdaAddress: order.id,
                                price: order.price.amount?.native || 0,
                                // tokenMint:
                                // tokenSize
                                marketplace_name: order.source?.name,
                                marketplace_icon: order.source?.icon
                            };
                    });
                })
                .catch((error) => {
                    console.error(error);
                });

            options = {
                method: 'GET',
                url: `${this.baseURLReservoir}/tokens/${condition.projectIds}:${condition.tokenId}/activity/v2`,
                params: {
                    sortBy: 'eventTimestamp',
                    limit: '20'
                },
                headers: { accept: '*/*', 'x-api-key': this.reservoirApiKey }
            };
            let respHistory = {};
            await axios
                .request(options)
                .then((response) => {
                    respHistory = response.data.activities.map((activity) => ({
                        amount: activity.amount,
                        block_timestamp: activity.timestamp,
                        buyer_address: activity.toAddress,
                        buyer_referral_address: activity.toAddress,
                        // buyer_referral_fee: ,
                        // escrow_address,
                        // fee,
                        // marketplace_instance_id,
                        marketplace_program_id: activity.source?.name,
                        marketplace_icon: activity.source?.icon,
                        // metadata,
                        price: activity.price,
                        seller_address: activity.fromAddress,
                        seller_referral_address: activity.fromAddress,
                        seller_referral_fee: activity.fromAddress,
                        signature: activity.txHash,
                        type: activity.type
                    }));
                })
                .catch((error) => {
                    console.error(error);
                });
            return {
                nft_stats: resp,
                nft_offers: respOffers,
                nft_tx_history: respHistory
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getMarketplaceSnapshot(condition, orderBy, paginationInfo) {
        try {
            console.log('getMarketplaceSnapshotETH', condition, orderBy, paginationInfo);
            // attributes filter
            const attributes = {};
            if (condition.projects[0]?.attributes?.length > 0) {
                condition.projects[0].attributes.map((att) => {
                    attributes[`attributes[${att.name}]`] = att.values[att.values.length - 1];
                });
            }

            const options = {
                method: 'GET',
                url: `${this.baseURLReservoir}/tokens/v5`,
                params: {
                    collection: condition.projects[0].project_id,
                    sortBy: 'floorAskPrice',
                    limit: '100',
                    includeTopBid: 'false',
                    includeAttributes: 'false',
                    ...attributes
                },
                headers: { accept: '*/*', 'x-api-key': this.reservoirApiKey }
            };
            let resp = {};
            await axios
                .request(options)
                .then((response) => {
                    resp = response.data.tokens.map((collection) => ({
                        token_address: collection.token.tokenId,
                        project_id: collection.token.contract,
                        name: collection.token.name || `${collection.token.collection.name} #${collection.token.tokenId}`,
                        rank_est: collection.token.rarityRank,
                        meta_data_img: collection.token.image,
                        meta_data_uri: collection.token.image, // check again
                        project_name: collection.token.collection.name,
                        project_image: collection.token.collection.image,
                        project_slug: collection.token.collection.slug,
                        project_description: collection.token.description, // check again
                        is_project_verified: collection.token.isFlagged,
                        // project_attributes:
                        lowest_listing_mpa: {
                            price: collection.market?.floorAsk?.price?.amount?.native || 0
                        }
                    }));
                })
                .catch((error) => {
                    console.error(error);
                });
            return {
                pagination_info: {
                    current_page_number: 1,
                    current_page_size: resp.length,
                    total_page_number: 1,
                    has_next_page: resp.length === 100,
                    __typename: 'PaginationInfoResponseType'
                },
                market_place_snapshots: resp
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getMarketplaceActivities(condition, paginationInfo) {
        try {
            console.log('getMarketplaceActivitiesETH', condition, paginationInfo);
            const options = {
                method: 'GET',
                url: `${this.baseURLReservoir}/collections/${condition.projects[0].project_id}/activity/v2`,
                params: {
                    sortBy: 'eventTimestamp',
                    limit: '20',
                    includeMetadata: 'true'
                },
                headers: { accept: '*/*', 'x-api-key': this.reservoirApiKey }
            };
            let resp = {};
            await axios
                .request(options)
                .then((response) => {
                    resp = response.data.activities.map((activity) => ({
                        name: activity.token?.tokenName,
                        token_address: activity.collection?.collectionId,
                        meta_data_img: activity.token?.tokenImage,
                        owner: activity.fromAddress,
                        full_img: activity.token?.tokenImage,
                        // rank_est:
                        market_place_state: {
                            block_timestamp: activity.timestamp,
                            // escrow_address
                            signature: activity.txHash,
                            seller_address: activity.fromAddress,
                            buyer_address: activity.toAddress,
                            type: activity.type,
                            marketplace_program_id: activity.source?.name,
                            marketplace_instance_id: activity.source?.icon,
                            // fee
                            amount: activity.amount,
                            // seller_referral_fee
                            // seller_referral_address
                            // buyer_referral_address
                            // buyer_referral_fee
                            // metadata
                            price: activity.price
                        }
                    }));
                })
                .catch((error) => {
                    console.error(error);
                });
            return {
                market_place_snapshots: resp
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async createBuyTx(buyerAddress, tokens) {
        try {
            console.log('createBuyTx - ETH NFT', buyerAddress, tokens);
            const options = {
                method: 'POST',
                url: `${this.baseURLReservoir}/execute/buy/v4`,
                data: {
                    tokens,
                    onlyPath: false,
                    currency: '0x0000000000000000000000000000000000000000', // ETH
                    partial: false,
                    skipErrors: false,
                    skipBalanceCheck: false,
                    taker: buyerAddress
                },
                headers: { accept: '*/*', 'content-type': 'application/json', 'x-api-key': this.reservoirApiKey }
            };
            let resp = {};
            await axios
                .request(options)
                .then((response) => {
                    console.log('res', response.data);
                    resp = response.data;
                })
                .catch((error) => {
                    console.error(error);
                });
            return {
                txObj: resp?.steps[1]?.items[0]?.data,
                error: resp?.message
            };
        } catch (error) {
            console.log('error', error);
            throw error;
        }
    }

    async createBidTx(buyerAddress, token, price) {
        try {
            console.log('createBidTx - ETH NFT', buyerAddress, token);
            const options = {
                method: 'POST',
                url: `${this.baseURLReservoir}/execute/bid/v4`,
                data: {
                    maker: buyerAddress,
                    params: [
                        {
                            orderKind: 'seaport',
                            orderbook: 'reservoir',
                            automatedRoyalties: true,
                            excludeFlaggedTokens: false,
                            token,
                            weiPrice: price
                        }
                    ]
                },
                headers: { accept: '*/*', 'content-type': 'application/json', 'x-api-key': this.reservoirApiKey }
            };
            let resp = {};
            await axios
                .request(options)
                .then((response) => {
                    resp = response.data;
                })
                .catch((error) => {
                    console.error(error);
                });
            console.log('resp', resp);
            return {
                data: resp?.steps.filter((item) => item?.items[0].status === 'incomplete'),
                error: resp?.message
            };
        } catch (error) {
            console.log('error', error);
            throw error;
        }
    }
}

export default GemsAPI;
