import { gql } from 'apollo-server-express';

export default gql`
    type CoinGeckoResp {
        success: Boolean
        message: String
        code: Int
        data: Anything
    }

    input AllCoinsParams {
        order: String
        per_page: Int
        page: Int
        localization: Boolean
        sparkline: Boolean
    }
    input ListCoinsParams {
        include_platform: Boolean
    }
    input MarketsCoinsParams {
        vs_currency: String
        ids: [String]
        category: String
        order: String
        per_page: Int
        page: Int
        sparkline: Boolean
        price_change_percentage: String
    }
    input FetchCoinParams {
        tickers: Boolean
        market_data: Boolean
        community_data: Boolean
        developer_data: Boolean
        localization: Boolean
        sparkline: Boolean
    }
    input FetchTickersParams {
        page: Int
        exchange_ids: [String]
        order: String
    }
    input FetchHistoryParams {
        date: String
        localization: Boolean
    }
    input FetchMarketChartParams {
        vs_currency: String
        days: String
    }

    input SimplePriceParams {
        ids: [String]
        vs_currencies: [String]
        include_24hr_vol: Boolean
        include_last_updated_at: Boolean
    }

    extend type Query {
        ping: CoinGeckoResp
        global: CoinGeckoResp
        listCoins(params: ListCoinsParams): CoinGeckoResp
        marketsCoins(params: MarketsCoinsParams): CoinGeckoResp
        fetchCoin(coinId: String!, params: FetchCoinParams): CoinGeckoResp
        fetchTickers(coinId: String!, params: FetchTickersParams): CoinGeckoResp
        fetchHistory(coinId: String!, params: FetchHistoryParams): CoinGeckoResp
        fetchMarketChart(coinId: String!, params: FetchMarketChartParams): CoinGeckoResp
        simplePrice(params: SimplePriceParams): CoinGeckoResp
    }
`;
