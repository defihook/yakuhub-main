import { gql } from 'apollo-server-express';

export default gql`
    enum SortOrderEnum {
        ASC
        DESC
    }
    enum MarketPlaceTxErrorEnum {
        ALREADY_OWNED_NFT
        BASIS_POINTS_MISMATCH
        BID_NOT_FOUND
        BID_STATE_ALREADY_EXISTS
        BROKER_MISMATCH
        BUYER_HAS_INSUFFICIENT_FUNDS
        ESCROW_WITHDRAW_AMOUNT_ERROR
        INTERNAL_SERVER_ERROR
        INVALID_INPUT_ERROR
        INVALID_TOKEN_ADDRESS
        INVALID_USER_BALANCE
        ITEM_LISTING_NOT_FOUND
        ITEM_NO_LONGER_AVAILABLE
        MARKETPLACE_BUYING_IS_DISABLED
        MARKETPLACE_OPERATION_IS_DISABLED
        PRICE_HAS_UPDATED_TO_BE_HIGHER
        PRICE_HAS_UPDATED_TO_BE_LOWER
        PRICE_MISMATCH
        RPC_ERROR
        SELLER_OWNER_MISMATCH
    }
    enum AttributeTypeEnum {
        CATEGORY
        NUMERIC
        RANGE
    }
    enum TimeGranularityEnum {
        PER_HOUR
        PER_DAY
    }
    enum StringInputOperationEnum {
        EXACT
        FUZZY
    }
    enum MarketplaceActionEnums {
        BID
        DELISTING
        LISTING
        TRANSACTION
        UPDATELISTING
        UPDATEBID
        CANCELBID
        bid
        ask
        transfer
        sale
        mint
        bid_cancel
        ask_cancel
    }
    enum NonMarketplaceActionEnums {
        MINT
    }
    enum TimePeriodEnum {
        ALL
        ONE_DAY
    }
    enum DayLookbackEnum {
        SEVEN_DAY
        ONE_DAY
        MONTH
    }

    type PaginationInfoResponseType {
        current_page_number: Int
        current_page_size: Int
        has_next_page: Boolean
        total_page_number: Int
    }
    type ProjectAttributes {
        name: String!
        type: AttributeTypeEnum
        values: [String]
        counts: [Int]
        floor_prices: [Float]
    }
    type ProjectTags {
        tag: String
    }
    type Project {
        project_id: String!
        supply: Int
        website: String
        twitter: String
        discord: String
        img_url: String
        is_verified: Boolean
        display_name: String
        project_slug: String
        me_slug: String
        project_attributes: [ProjectAttributes]
        tags: [ProjectTags]
    }
    type ProjectStat {
        project_id: String!
        market_cap: Float
        volume_7day: Float
        volume_1day_change: Float
        floor_price: Float
        floor_price_1day_change: Float
        average_price: Float
        average_price_1day_change: Float
        max_price: Float
        twitter_followers: Int
        num_of_token_listed: Int
        num_of_token_holders: Int
        percentage_of_token_listed: Float
        volume_1day: Float
        volume_1hr: Float
        rank: Int
        project: Project
    }
    type ProjectStats {
        project_stats: [ProjectStat]
        pagination_info: PaginationInfoResponseType
    }
    type ProjectStatHistEntry {
        project_id: String!
        timestamp: Int
        volume: Float
        volume_usd: Float
        volume_double: Float
        volume_usd_double: Float
        floor_price: Float
        num_of_sales: Int
        max_price: Float
        twitter_followers: Int
        discord_members: Int
        num_of_token_holders: Int
        num_of_token_listed: Int
    }
    type ProjectStatHistEntries {
        project_stat_hist_entries: [ProjectStatHistEntry]
        pagination_info: PaginationInfoResponseType
    }
    type ProjectAttribute {
        name: String
        counts: [Int]
        type: String
        values: [String]
    }
    type MetaData {
        expiry_bytes: [Int]
        has_approve: Boolean
        has_set_authority: Boolean
        isRSOListing: Boolean
        marketplace_instance_id: String
        marketplace_program_id: String
        type: String
    }
    type LowestListingMpa {
        user_address: String
        price: Float
        marketplace_program_id: String
        type: String
        signature: String
        amount: Float
        broker_referral_address: String
        block_timestamp: Int
        broker_referral_fee: Float
        escrow_address: String
        fee: Float
        marketplace_fee_address: String
        marketplace_instance_id: String
        metadata: MetaData
    }
    type MarketplaceSnapshot {
        token_address: String
        project_id: String
        name: String
        rank_est: Int
        supply: Int
        attributes: Anything
        full_img: String
        meta_data_img: String
        meta_data_uri: String
        floor_price: Float
        project_name: String
        project_image: String
        is_project_verified: Boolean
        project_attributes: [ProjectAttribute]
        lowest_listing_mpa: LowestListingMpa
    }
    type MPState {
        block_timestamp: Int
        escrow_address: String
        signature: String
        seller_address: String
        buyer_address: String
        type: MarketplaceActionEnums
        marketplace_program_id: String
        marketplace_instance_id: String
        fee: Float
        amount: Float
        seller_referral_fee: Float
        seller_referral_address: String
        buyer_referral_address: String
        buyer_referral_fee: Float
        metadata: Anything
        price: Float
    }
    type NonMPState {
        token_address: String
        signature: String
        source_address: String
        destination_address: String
        program_id: String
        collection_id: String
        new_authority: String
        price: Float
        type: NonMarketplaceActionEnums
        currency: String
        amount: Float
        decimal: Int
        destination_token_account: String
        source_token_account: String
        metadata: Anything
        block_timestamp: Int
        block_number: Int
    }
    type MPActivity {
        name: String
        token_address: String
        meta_data_img: String
        owner: String
        project_id: String
        project_name: String
        full_img: String
        rank_est: Int
        market_place_state: MPState
    }
    type NonMPActivity {
        name: String
        token_address: String
        meta_data_img: String
        owner: String
        full_img: String
        rank_est: Int
        non_market_place_state: NonMPState
    }
    type MarketplaceSnapshots {
        market_place_snapshots: [MarketplaceSnapshot]
        pagination_info: PaginationInfoResponseType
    }
    type MPActivities {
        market_place_snapshots: [MPActivity]
        pagination_info: PaginationInfoResponseType
    }
    type NonMPActivities {
        market_place_snapshots: [NonMPActivity]
        pagination_info: PaginationInfoResponseType
    }
    type BuyTx {
        data: [Int]
        is_required_signers_on: Boolean
        metadata: Anything
        error: Anything
        txObj: Anything
    }
    type DelistTx {
        data: [Int]
        is_required_signers_on: Boolean
        metadata: Anything
        error: Anything
    }
    type MPAction {
        block_timestamp: Int
        escrow_address: String
        signature: String
        seller_address: String
        buyer_address: String
        type: MarketplaceActionEnums
        marketplace_program_id: String
        marketplace_instance_id: String
        fee: Float
        amount: Float
        seller_referral_fee: Float
        seller_referral_address: String
        buyer_referral_address: String
        buyer_referral_fee: Float
        metadata: Anything
        price: Float
    }
    type TokenHistories {
        token_address: String
        market_place_actions: [MPAction]
    }
    type TokenState {
        token_address: String
        market_place_states: [MPActivity]
    }
    type WalletStat {
        address: String
        listed_nfts: Int
        owned_nfts: Int
        portfolio_value: Float
        sol_name: String
        twitter: String
        num_sold_1day: Int
        volume_sold_1day: Float
        num_bought_1day: Int
        volume_bought_1day: Float
        num_bids_1day: Int
        bids_made_amount_1day: Float
        max_purchase_1day: Float
        max_sale_1day: Float
        num_minted_1day: Int
        minted_amount_1day: Float
        wallet_score_1day: Float
        max_purchase_item_1day: Anything
        max_sale_item_1day: Anything
        num_sold: Int
        volume_sold: Float
        num_bought: Int
        volume_bought: Float
        num_bids: Int
        bids_made_amount: Float
        max_purchase: Float
        max_sale: Float
        num_minted: Int
        minted_amount: Float
        wallet_score: Float
        max_purchase_item: Anything
        max_sale_item: Anything
        rank: Int
    }
    type WalletStats {
        wallet_stats: [WalletStat]
        pagination_info: PaginationInfoResponseType
    }
    type WalletStatsHistory {
        timestamp: Int
        portfolio_value: Float
        owned_nfts: Int
    }
    type WalletStatsHistories {
        wallet_stats_history: [WalletStatsHistory]
    }
    type UserListings {
        market_place_snapshots: [MPActivity]
    }
    type Leaderboard {
        topVolMovers: [ProjectStat]
        topSales: [ProjectStat]
        topFloorMovers: [ProjectStat]
    }
    type YakuStats {
        stats: [ProjectStat]
    }

    input ProjectIdWithAttributes {
        attributes: [Attributes]
        project_id: String
    }
    input Attributes {
        name: String
        type: String
        values: [String]
    }
    input GetProjectsCondition {
        projectIds: [String]
        excludeProjectAttributes: Boolean
        is_verified: Boolean
        tags: [String]
    }
    input OrderConfig {
        field_name: String
        sort_order: SortOrderEnum
    }
    input PaginationConfig {
        page_number: Int
        page_size: Int
        progressive_load: Boolean
    }
    input StringInputArg {
        operation: StringInputOperationEnum
        value: String
    }
    input SearchProjectCondition {
        name: String
        matchName: StringInputArg
        twitter: StringInputArg
        meSlug: StringInputArg
        excludeAttributes: Boolean
        tag: String
    }
    input GetProjectStatHistCondition {
        projects: [String]!
        startTimestamp: Int
        endTimestamp: Int
        timeGranularity: TimeGranularityEnum
        paginationInfo: PaginationConfig
    }
    input MinMaxFilterValues {
        min: Float
        max: Float
    }
    input GetMarketplaceCondition {
        projects: [ProjectIdWithAttributes]
        name: StringInputArg
        tokenAddresses: [String]
        excludeTokensWithoutMetadata: Boolean
        includeAttributeInformation: Boolean
        includeProjectFloorPrice: Boolean
        onlyListings: Boolean
        priceFilter: MinMaxFilterValues
        rankFilter: MinMaxFilterValues
    }
    input GetMPActivitiesCondition {
        projects: [ProjectIdWithAttributes]
        actionTypes: [MarketplaceActionEnums]
    }
    input GetNonMPActivitiesCondition {
        projects: [ProjectIdWithAttributes]
        nonMpaActionTypes: [NonMarketplaceActionEnums]
    }
    input MarketPlaceIdentifier {
        marketplace_instance_id: String
        marketplace_program_id: String
    }
    input GetTokenHistoryCondition {
        tokenAddresses: [String]
        actionType: MarketplaceActionEnums
        marketPlaceIdentifiers: [MarketPlaceIdentifier]
    }
    input GetTokenStateCondition {
        tokenAddresses: [String]
        actionType: MarketplaceActionEnums
        buyerAddress: String
        sellerAddress: String
        marketPlaceIdentifiers: [MarketPlaceIdentifier]
    }
    input GetWalletStatsCondition {
        searchAddress: String
        timePeriod: TimePeriodEnum
        includeUserRank: Boolean
    }
    input GetWalletStatsHistCondition {
        searchAddress: String
        dayLookback: DayLookbackEnum
    }
    input GetUserListingsCondition {
        userAddress: String!
        marketPlaceIdentifiers: [MarketPlaceIdentifier]
    }
    input GetLeaderboardsCondition {
        volume_1day: Int
        volume_1hr: Int
    }
    extend type Query {
        searchProjectByName(condition: SearchProjectCondition): ProjectStats @isAuthenticated
        getProjectStats(
            condition: GetProjectsCondition
            chain: String
            orderBy: OrderConfig
            paginationInfo: PaginationConfig
        ): ProjectStats
        getLeaderboards(condition: GetLeaderboardsCondition): Leaderboard
        getYakuCollectionsStats: YakuStats
        getProjectStatHistory(condition: GetProjectStatHistCondition): ProjectStatHistEntries @isAuthenticated
        getMarketplaceSnapshot(
            condition: GetMarketplaceCondition
            chain: String
            orderBy: OrderConfig
            paginationInfo: PaginationConfig
        ): MarketplaceSnapshots @isAuthenticated
        getMarketplaceActivities(condition: GetMPActivitiesCondition, chain: String, paginationInfo: PaginationConfig): MPActivities
            @isAuthenticated
        getNonMpaProjectHistory(condition: GetNonMPActivitiesCondition, paginationInfo: PaginationConfig): NonMPActivities @isAuthenticated
        getTokenHistory(condition: GetTokenHistoryCondition, paginationInfo: PaginationConfig): [TokenHistories] @isAuthenticated
        getTokenState(condition: GetTokenStateCondition, orderBy: OrderConfig, paginationInfo: PaginationConfig): [TokenState]
            @isAuthenticated
        getWalletStats(condition: GetWalletStatsCondition, orderBy: OrderConfig, paginationInfo: PaginationConfig): WalletStats
            @isAuthenticated
        getWalletStatsHist(condition: GetWalletStatsHistCondition): WalletStatsHistories @isAuthenticated
        getUserListings(condition: GetUserListingsCondition, orderBy: OrderConfig): UserListings @isAuthenticated
    }

    extend type Mutation {
        createBuyTx(
            buyerAddress: String!
            price: Float!
            tokenAddress: String!
            buyerBroker: String!
            tokens: [String]!
            chain: String!
        ): BuyTx
        createDelistTx(sellerAddress: String!, tokenAddress: String!): DelistTx
    }
`;
