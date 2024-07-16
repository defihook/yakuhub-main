import gql from 'graphql-tag';

/* eslint-disable import/prefer-default-export */

// API
export const GET_COLLECTION_STATS = gql`
    query GetCollectionStats($symbol: String!) {
        getStats(symbol: $symbol) {
            symbol
            floorPrice
            listedCount
            avgPrice24hr
            volumeAll
        }
    }
`;

export const GET_NFT_ACTIVITIES = gql`
    query GetNFTActivities($mint: String!, $offset: Int, $limit: Int) {
        getActivities(mint: $mint, offset: $offset, limit: $limit) {
            signature
            type
            source
            tokenMint
            collectionSymbol
            slot
            blockTime
            buyerReferral
            seller
            sellerReferral
            price
        }
    }
`;

export const GET_COLLECTION_ACTIVITIES = gql`
    query GetCollectionActivities($symbol: String!, $offset: Int, $limit: Int) {
        getCollectionActivities(symbol: $symbol, offset: $offset, limit: $limit) {
            signature
            type
            source
            tokenMint
            collectionSymbol
            slot
            blockTime
            buyerReferral
            seller
            sellerReferral
            price
        }
    }
`;

export const GET_COLLECTIONS = gql`
    query GetCollections($page: Int, $limit: Int) {
        getAllMECollections(page: $page, limit: $limit) {
            data {
                symbol
                image
                name
                totalItems
                description
            }
            page
            totalPage
        }
    }
`;

export const GET_MECOLLECTION_STATS = gql`
    query GetMECollectionStats($symbol: String!) {
        getCollectionStats(symbol: $symbol) {
            symbol
            floorPrice
            listedCount
            avgPrice24hr
            volumeAll
        }
    }
`;

export const GET_COLLECTIONS_BY_KEYWORD = gql`
    query GetCollectionsByKeyword($keyword: String!) {
        getCollectionsByKeyword(keyword: $keyword) {
            symbol
            image
            name
            totalItems
            description
        }
    }
`;

export const GET_COLLECTION_STATS_AND_RANK = gql`
    query GetCollectionStatsAndRank($symbol: String!) {
        getStatsBySymbol(symbol: $symbol) {
            symbol
            image
            name
            totalItems
            description
            floorPrice
            listedCount
            avgPrice24hr
            volumeAll
            ranking {
                mint
                rank
            }
        }
    }
`;

export const GET_TRANSACTION_INSTRUCTION = gql`
    query GetTransactionInstruction(
        $buyer: String!
        $seller: String!
        $auctionHouse: String!
        $tokenMint: String!
        $tokenAddress: String!
        $price: String!
        $expiry: String!
        $pdaAddress: String!
        $sellerReferral: String
    ) {
        getMETransactionInstructionsForSnipe(
            buyer: $buyer
            seller: $seller
            auctionHouse: $auctionHouse
            tokenMint: $tokenMint
            tokenAddress: $tokenAddress
            price: $price
            expiry: $expiry
            pdaAddress: $pdaAddress
            sellerReferral: $sellerReferral
        ) {
            tx {
                type
                data
            }
            txSigned {
                type
                data
            }
        }
    }
`;

// Drops
export const GET_DROPS = gql`
    query getDrops {
        getDrops
    }
`;

// Spaces / Proposals
export const GET_SPACES = gql`
    query GetSpaces {
        spaces {
            id
            owner
            members
            name
            description
            symbol
            avatar
            discord
            twitter
            website
        }
    }
`;

export const GET_SPACE = gql`
    query GetSpace($symbol: String!) {
        space(symbol: $symbol) {
            id
            owner
            creatorWallet
            members
            name
            description
            symbol
            avatar
            discord
            twitter
            website
            isPartnered
            createdAt
        }
    }
`;

export const GET_PROPOSALS_FOR_SPACE = gql`
    query GetProposalsForSpace($id: ID!) {
        proposalsIn(id: $id) {
            id
            author
            title
            body
            discussion
            state
            choices
            forVotes
            againstVotes
            abstainVotes
            endsAt
            createdAt
        }
    }
`;

export const GET_PROPOSAL = gql`
    query GetProposal($id: ID!) {
        proposal(id: $id) {
            id
            author
            title
            body
            discussion
            state
            choices
            forVotes
            againstVotes
            abstainVotes
            endsAt
            createdAt
        }
    }
`;

// Workspace
export const GET_WORKSPACES_COUNT = gql`
    query GetWorkspacesCount($owner: String!) {
        getWorkspacesCount(owner: $owner)
    }
`;

export const GET_ALL_WORKSPACES = gql`
    query GetAllWorkspaces($owner: String!) {
        getAllWorkspaces(owner: $owner) {
            id
            owner
            name
            description
            image
            website
            twitter
            discord
            token
            users {
                address
                role
            }
            balance
        }
    }
`;

export const GET_WORKSPACE_BY_ID = gql`
    query GetWorkspaceById($id: String!) {
        getWorkspaceById(id: $id) {
            id
            owner
            name
            description
            image
            website
            twitter
            discord
            token
            users {
                address
                role
            }
            balance
        }
    }
`;

export const GET_WORKSPACE_BY_NAME = gql`
    query GetWorkspaceByName($owner: String!, $name: String!) {
        getWorkspaceByName(owner: $owner, name: $name) {
            id
            name
        }
    }
`;

// Staff management set
export const GET_TOKEN = gql`
    query getToken($name: String!) {
        getToken(name: $name) {
            mint
            name
            symbol
            logo
            decimal
            value
        }
    }
`;

export const GET_TOKENS = gql`
    query getTokens {
        getTokens {
            mint
            name
            symbol
            decimal
            value
            logo
        }
    }
`;

export const GET_TRANSACTIONS = gql`
    query getTransactions {
        getTransactions {
            wallet
            transactionHash
            from
            to
            fromAmount
            toAmount
            type
        }
    }
`;

export const GET_TRANSACTION = gql`
    query getTransaction($transactionHash: String!) {
        getTransaction(transactionHash: $transactionHash) {
            wallet
            transactionHash
            from
            to
            fromAmount
            toAmount
            type
        }
    }
`;

export const GET_CLAIMER = gql`
    query getClaimer($wallet: String!) {
        getClaimer(wallet: $wallet) {
            project
            method
            name
            employer
            amount
            wallet
            period
            transactionHash {
                date
                txHash
            }
            time
            user
        }
    }
`;

export const GET_CLAIMERS = gql`
    query getClaimers($wallet: String) {
        getClaimers(wallet: $wallet) {
            project
            name
            employer
            method
            amount
            wallet
            period
            transactionHash {
                date
                txHash
            }
            time
            user
        }
    }
`;

export const GET_EMPLOYEES = gql`
    query getEmployees($project: String!, $employer: String!) {
        getEmployees(project: $project, employer: $employer) {
            project
            name
            employer
            method
            amount
            wallet
            period
            transactionHash {
                date
                txHash
            }
            time
            user
        }
    }
`;

export const GET_WALLETS = gql`
    query getWallets($wallet: String!) {
        getWallets(wallet: $wallet) {
            project
        }
    }
`;

export const GET_WALLETPUBKEY = gql`
    query getWalletPubkey($project: String!, $wallet: String!) {
        getWalletPubkey(project: $project, wallet: $wallet) {
            pubkey
        }
    }
`;

export const GET_PROJECTS_STATS = gql`
    query GetProjectStats(
        $projectIds: [String]
        $excludeProjectAttributes: Boolean
        $tags: [String]
        $field_name: String
        $sort_order: SortOrderEnum
        $page_number: Int
        $page_size: Int
        $progressive_load: Boolean
        $chain: String
    ) {
        getProjectStats(
            condition: { projectIds: $projectIds, excludeProjectAttributes: $excludeProjectAttributes, tags: $tags, is_verified: true }
            chain: $chain
            orderBy: { field_name: $field_name, sort_order: $sort_order }
            paginationInfo: { page_number: $page_number, page_size: $page_size, progressive_load: $progressive_load }
        ) {
            project_stats {
                project_id
                market_cap
                volume_7day
                volume_1day_change
                floor_price
                floor_price_1day_change
                average_price
                average_price_1day_change
                twitter_followers
                num_of_token_listed
                num_of_token_holders
                percentage_of_token_listed
                volume_1day
                volume_1hr
                project {
                    supply
                    img_url
                    is_verified
                    display_name
                    me_slug
                    website
                    twitter
                    discord
                    project_attributes {
                        name
                        type
                        values
                    }
                }
            }
            pagination_info {
                current_page_number
                current_page_size
                total_page_number
            }
        }
    }
`;

export const GET_YAKU_STATS = gql`
    query GetYakuCollectionsStats {
        getYakuCollectionsStats {
            stats {
                project_id
                market_cap
                volume_7day
                volume_1day_change
                floor_price
                floor_price_1day_change
                average_price
                average_price_1day_change
                twitter_followers
                num_of_token_listed
                num_of_token_holders
                percentage_of_token_listed
                volume_1day
                volume_1hr
                project {
                    supply
                    img_url
                    is_verified
                    display_name
                    me_slug
                    website
                    twitter
                    discord
                    project_attributes {
                        name
                        type
                        values
                    }
                }
            }
        }
    }
`;

// Mints
export const GET_USER_FAVOURITE_MINTS = gql`
    query GetFavouriteMintsByUserId {
        getFavouriteMintsByUserId {
            title
        }
    }
`;

export const GET_USER_MINTS = gql`
    query GetUserMintsByUserId {
        getUserMintsByUserId {
            title
            date
            supply
            logo
        }
    }
`;

export const GET_MINT_COLORS = gql`
    query GetMintColorsByUserId {
        getMintColorsByUserId {
            title
            color
        }
    }
`;

export const GET_MINT_NOTIFICATIONS = gql`
    query GetMintNotificationsByUserId {
        getMintNotificationsByUserId {
            title
            date
        }
    }
`;

export const GET_NOTIFICATIONS = gql`
    query GetNotificationsByUserId {
        getNotificationsByUserId {
            id
            title
            date
            description
            icon
            status
        }
    }
`;

export const GET_TOP_FLOOR_MOVERS = gql`
    query GetTopFloorMovers {
        getProjectStats(
            condition: { is_verified: true }
            chain: "SOL"
            orderBy: { field_name: "floor_price_1day_change", sort_order: DESC }
            paginationInfo: { page_number: 1, page_size: 300 }
        ) {
            project_stats {
                project_id
                volume_1day_change
                floor_price
                floor_price_1day_change
                volume_1day
                volume_1hr
                project {
                    img_url
                    is_verified
                    display_name
                    me_slug
                }
            }
        }
    }
`;

export const GET_TOP_VOL_MOVERS = gql`
    query GetTopVolMovers {
        getProjectStats(
            condition: { is_verified: true }
            chain: "SOL"
            orderBy: { field_name: "volume_1day", sort_order: DESC }
            paginationInfo: { page_number: 1, page_size: 3 }
        ) {
            project_stats {
                project_id
                volume_1day_change
                floor_price
                floor_price_1day_change
                volume_1day
                project {
                    img_url
                    display_name
                    me_slug
                }
            }
        }
    }
`;

export const GET_TOP_SALES = gql`
    query GetTopSales {
        getProjectStats(
            condition: { is_verified: true }
            chain: "SOL"
            orderBy: { field_name: "volume_7day", sort_order: DESC }
            paginationInfo: { page_number: 1, page_size: 3 }
        ) {
            project_stats {
                project_id
                volume_7day
                project {
                    img_url
                    display_name
                    me_slug
                    tags {
                        tag
                    }
                }
            }
        }
    }
`;

export const GET_LEADERBOARDS = gql`
    query GetLeaderboards($condition: GetLeaderboardsCondition) {
        getLeaderboards(condition: $condition) {
            topVolMovers {
                project_id
                volume_1day_change
                floor_price
                floor_price_1day_change
                volume_1day
                project {
                    img_url
                    display_name
                    me_slug
                }
            }
            topSales {
                project_id
                volume_7day
                project {
                    img_url
                    display_name
                    me_slug
                    tags {
                        tag
                    }
                }
            }
            topFloorMovers {
                project_id
                volume_1day_change
                floor_price
                floor_price_1day_change
                volume_1day
                volume_1hr
                project {
                    img_url
                    is_verified
                    display_name
                    me_slug
                }
            }
        }
    }
`;

export const GET_MARKETPLACE_SNAPSHOT = gql`
    query GetMarketplaceSnapshot(
        $projects: [ProjectIdWithAttributes]
        $name: StringInputArg
        $tokenAddresses: [String]
        $excludeTokensWithoutMetadata: Boolean
        $includeAttributeInformation: Boolean
        $includeProjectFloorPrice: Boolean
        $onlyListings: Boolean
        $priceFilter: MinMaxFilterValues
        $rankFilter: MinMaxFilterValues
        $field_name: String
        $sort_order: SortOrderEnum
        $page_number: Int
        $page_size: Int
        $progressive_load: Boolean
        $chain: String
    ) {
        getMarketplaceSnapshot(
            condition: {
                projects: $projects
                name: $name
                tokenAddresses: $tokenAddresses
                excludeTokensWithoutMetadata: $excludeTokensWithoutMetadata
                includeAttributeInformation: $includeAttributeInformation
                includeProjectFloorPrice: $includeProjectFloorPrice
                onlyListings: $onlyListings
                priceFilter: $priceFilter
                rankFilter: $rankFilter
            }
            chain: $chain
            orderBy: { field_name: $field_name, sort_order: $sort_order }
            paginationInfo: { page_number: $page_number, page_size: $page_size, progressive_load: $progressive_load }
        ) {
            market_place_snapshots {
                token_address
                project_id
                name
                rank_est
                supply
                meta_data_img
                meta_data_uri
                attributes
                lowest_listing_mpa {
                    user_address
                    price
                    marketplace_program_id
                    marketplace_instance_id
                    broker_referral_address
                    type
                    signature
                    amount
                    block_timestamp
                    escrow_address
                }
            }
            pagination_info {
                current_page_number
                current_page_size
                has_next_page
                total_page_number
            }
        }
    }
`;

export const SEARCH_PROJECT_BY_NAME = gql`
    query SearchProjectByName($condition: SearchProjectCondition) {
        searchProjectByName(condition: $condition) {
            project_stats {
                project_id
                market_cap
                volume_7day
                volume_1day_change
                floor_price
                floor_price_1day_change
                average_price
                average_price_1day_change
                twitter_followers
                num_of_token_listed
                num_of_token_holders
                percentage_of_token_listed
                volume_1day
                volume_1hr
                project {
                    supply
                    img_url
                    is_verified
                    display_name
                }
            }
            pagination_info {
                current_page_number
                current_page_size
                total_page_number
            }
        }
    }
`;

export const GET_MP_ACTIVITIES = gql`
    query GetMPActivities($condition: GetMPActivitiesCondition, $paginationInfo: PaginationConfig) {
        getMarketplaceActivities(condition: $condition, paginationInfo: $paginationInfo) {
            market_place_snapshots {
                name
                token_address
                meta_data_img
                owner
                full_img
                rank_est
                market_place_state {
                    block_timestamp
                    escrow_address
                    signature
                    seller_address
                    buyer_address
                    type
                    marketplace_program_id
                    marketplace_instance_id
                    fee
                    amount
                    seller_referral_fee
                    seller_referral_address
                    buyer_referral_address
                    buyer_referral_fee
                    metadata
                    price
                }
            }
            pagination_info {
                current_page_number
                current_page_size
                total_page_number
            }
        }
    }
`;

export const GET_NMP_ACTIVITIES = gql`
    query GetNonMpaActivities($condition: GetNonMPActivitiesCondition, $paginationInfo: PaginationConfig) {
        getNonMpaProjectHistory(condition: $condition, paginationInfo: $paginationInfo) {
            market_place_snapshots {
                name
                token_address
                meta_data_img
                owner
                full_img
                rank_est
                non_market_place_state {
                    token_address
                    signature
                    source_address
                    destination_address
                    program_id
                    collection_id
                    new_authority
                    price
                    type
                    currency
                    amount
                    decimal
                    destination_token_account
                    source_token_account
                    metadata
                    block_timestamp
                    block_number
                }
            }
            pagination_info {
                current_page_number
                current_page_size
                total_page_number
            }
        }
    }
`;

export const GET_COLLECTION_HISTORY = gql`
    query GetCollectionHistory($condition: GetProjectStatHistCondition) {
        getProjectStatHistory(condition: $condition) {
            project_stat_hist_entries {
                project_id
                timestamp
                volume
                volume_usd
                volume_double
                volume_usd_double
                floor_price
                num_of_sales
                max_price
                twitter_followers
                discord_members
                num_of_token_holders
                num_of_token_listed
            }
            pagination_info {
                current_page_number
                current_page_size
                total_page_number
                has_next_page
            }
        }
    }
`;

export const GET_USER_LISTINGS = gql`
    query GetUserListings($condition: GetUserListingsCondition, $orderBy: OrderConfig) {
        getUserListings(condition: $condition, orderBy: $orderBy) {
            market_place_snapshots {
                name
                project_id
                token_address
                meta_data_img
                owner
                full_img
                rank_est
                market_place_state {
                    block_timestamp
                    escrow_address
                    signature
                    seller_address
                    buyer_address
                    type
                    marketplace_program_id
                    marketplace_instance_id
                    fee
                    amount
                    seller_referral_fee
                    seller_referral_address
                    buyer_referral_address
                    buyer_referral_fee
                    metadata
                    price
                }
            }
        }
    }
`;

export const GET_METADATA = gql`
    query GetMetadata($mint: String) {
        getMetadata(mint: $mint) {
            symbol
            name
            description
            image
            mint
            project
            attributes {
                trait_type
                value
            }
        }
    }
`;

export const GET_METADATAS = gql`
    query GetMetadatas($mints: [String]) {
        getMetadatas(mints: $mints) {
            symbol
            name
            description
            image
            mint
            project
            attributes {
                trait_type
                value
            }
        }
    }
`;

export const GET_WALLET_TOKENS = gql`
    query GetWalletTokens($wallet: String!, $offset: Int, $limit: Int, $listedOnly: Boolean) {
        getWalletTokens(wallet: $wallet, offset: $offset, limit: $limit, listedOnly: $listedOnly) {
            mintAddress
            owner
            supply
            delegate
            collection
            collectionName
            name
            updateAuthority
            primarySaleHappened
            sellerFeeBasisPoints
            image
            externalUrl
            attributes {
                trait_type
                value
            }
            properties
            listStatus
        }
    }
`;

export const GET_WALLET_AVATAR = gql`
    query GetWalletAvatar($wallet: String!) {
        getWalletAvatar(wallet: $wallet) {
            displayName
            avatar
        }
    }
`;

export const GET_WALLET_ACTIVITIES = gql`
    query GetWalletActivities($wallet: String!, $offset: Int, $limit: Int) {
        getWalletActivities(wallet: $wallet, offset: $offset, limit: $limit) {
            signature
            type
            source
            tokenMint
            collection
            slot
            blockTime
            buyer
            buyerReferral
            seller
            sellerReferral
            price
        }
    }
`;

export const GET_TOKEN_BY_MINT = gql`
    query GetTokenByMint($mint: String!) {
        getTokenByMint(mint: $mint) {
            mintAddress
            owner
            collection
            name
            updateAuthority
            primarySaleHappened
            sellerFeeBasisPoints
            image
            animationUrl
            externalUrl
            attributes {
                trait_type
                value
            }
            properties
        }
    }
`;

export const GET_PROJECT_NAME = gql`
    query GetProjectStats($projectIds: [String], $chain: String) {
        getProjectStats(condition: { projectIds: $projectIds, is_verified: true }, chain: $chain) {
            project_stats {
                project_id
                project {
                    supply
                    img_url
                    is_verified
                    display_name
                    me_slug
                    project_attributes {
                        name
                        type
                        values
                    }
                }
            }
        }
    }
`;

export const GET_ETH_NFT = gql`
    query GetNFTStats($projectIds: [String], $tokenId: String) {
        getNFTStats(condition: { projectIds: $projectIds, tokenId: $tokenId }) {
            nft_stats {
                contract
                tokenId
                name
                display_name
                description
                image
                media
                kind
                isFlagged
                owner
                price
                marketplace_program_id
                attributes {
                    key
                    value
                    tokenCount
                    onSaleCount
                    floorAskPrice
                    topBidValue
                }
            }
            nft_offers {
                auctionHouse
                buyer
                expiry
                pdaAddress
                price
                tokenMint
                tokenSize
                marketplace_name
                marketplace_icon
            }
            nft_tx_history {
                amount
                block_timestamp
                buyer_address
                buyer_referral_address
                buyer_referral_fee
                escrow_address
                fee
                marketplace_instance_id
                marketplace_program_id
                marketplace_icon
                metadata
                price
                seller_address
                seller_referral_address
                seller_referral_fee
                signature
                type
            }
        }
    }
`;

export const GET_TOKEN_HISTORY = gql`
    query GetTokenHistory($condition: GetTokenHistoryCondition, $paginationInfo: PaginationConfig) {
        getTokenHistory(condition: $condition, paginationInfo: $paginationInfo) {
            token_address
            market_place_actions {
                block_timestamp
                escrow_address
                signature
                seller_address
                buyer_address
                type
                marketplace_program_id
                marketplace_instance_id
                fee
                amount
                seller_referral_fee
                seller_referral_address
                buyer_referral_address
                buyer_referral_fee
                metadata
                price
            }
        }
    }
`;

export const GET_TOKEN_STATE = gql`
    query GetTokenState($condition: GetTokenStateCondition, $paginationInfo: PaginationConfig) {
        getTokenState(condition: $condition, paginationInfo: $paginationInfo) {
            token_address
            market_place_states {
                name
                token_address
                meta_data_img
                owner
                full_img
                rank_est
                project_id
                market_place_state {
                    block_timestamp
                    escrow_address
                    signature
                    seller_address
                    buyer_address
                    type
                    marketplace_program_id
                    marketplace_instance_id
                    fee
                    amount
                    seller_referral_fee
                    seller_referral_address
                    buyer_referral_address
                    buyer_referral_fee
                    metadata
                    price
                }
            }
        }
    }
`;

export const GET_WALLET_STATS = gql`
    query GetWalletStats($condition: GetWalletStatsCondition, $orderBy: OrderConfig, $paginationInfo: PaginationConfig) {
        getWalletStats(condition: $condition, orderBy: $orderBy, paginationInfo: $paginationInfo) {
            wallet_stats {
                address
                listed_nfts
                owned_nfts
                portfolio_value
                sol_name
                twitter
                num_sold_1day
                volume_sold_1day
                num_bought_1day
                volume_bought_1day
                num_bids_1day
                bids_made_amount_1day
                max_purchase_1day
                max_sale_1day
                num_minted_1day
                minted_amount_1day
                wallet_score_1day
                max_purchase_item_1day
                max_sale_item_1day
                num_sold
                volume_sold
                num_bought
                volume_bought
                num_bids
                bids_made_amount
                max_purchase
                max_sale
                num_minted
                minted_amount
                wallet_score
                max_purchase_item
                max_sale_item
                rank
            }
            pagination_info {
                current_page_number
                current_page_size
                total_page_number
            }
        }
    }
`;

export const GET_WALLET_HIST = gql`
    query GetWalletStatsHist($condition: GetWalletStatsHistCondition) {
        getWalletStatsHist(condition: $condition) {
            wallet_stats_history {
                timestamp
                portfolio_value
                owned_nfts
            }
        }
    }
`;

export const USER = gql`
    query User($wallet: String, $ethAddress: String) {
        user(wallet: $wallet, ethAddress: $ethAddress) {
            wallet
            ethAddress
            vanity
            registered
            isStaff
            createdAt
            updatedAt
            discord {
                id
                name
                discriminator
                avatar
                membership
            }
            twitter
            avatar
            banner
            bio
            location
        }
    }
`;

export const USERS = gql`
    query Users($wallets: [String]) {
        users(wallets: $wallets) {
            wallet
            ethAddress
            vanity
            discord {
                name
                discriminator
                avatar
            }
            twitter
            avatar
        }
    }
`;

export const GET_SITE_STATS = gql`
    query GetSiteStats {
        getSiteStats {
            total
            activeCount
            twitterCount
            discordCount
            ethCount
        }
    }
`;

export const GET_COIN_HISTORY = gql`
    query FetchHistory($coinId: String!, $params: FetchHistoryParams) {
        fetchHistory(coinId: $coinId, params: $params) {
            success
            message
            code
            data
        }
    }
`;

export const GET_ACCOUNT_TOKENS = gql`
    query GetAccountTokens($account: String!) {
        getAccountTokens(account: $account) {
            tokenAddress
            tokenAmount {
                amount
                decimals
                uiAmount
                uiAmountString
            }
            tokenAccount
            tokenName
            tokenIcon
            rentEpoch
            lamports
            tokenSymbol
        }
    }
`;

export const GET_COINS_MARKET_CHART = gql`
    query GetCoinsMarketChart($coinId: String!, $params: FetchMarketChartParams) {
        fetchMarketChart(coinId: $coinId, params: $params) {
            success
            message
            code
            data
        }
    }
`;

export const GET_MARKET_COINS = gql`
    query GetMarketCoins($params: MarketsCoinsParams) {
        marketsCoins(params: $params) {
            success
            message
            code
            data
        }
    }
`;

export const GET_COIN_INFO = gql`
    query GetCoinInfo($coinId: String!, $params: FetchCoinParams) {
        fetchCoin(coinId: $coinId, params: $params) {
            success
            message
            code
            data
        }
    }
`;

export const GET_SIMPLE_PRICE = gql`
    query GetSimplePrice($params: SimplePriceParams) {
        simplePrice(params: $params) {
            success
            message
            code
            data
        }
    }
`;

export const GET_LISTING_BY_SYMBOL = gql`
    query GetListingBySymbol($symbol: String!, $offset: Int, $limit: Int) {
        getListingBySymbol(symbol: $symbol, offset: $offset, limit: $limit) {
            pdaAddress
            auctionHouse
            tokenAddress
            tokenMint
            seller
            tokenSize
            price
            rarity
        }
    }
`;

export const GET_ALL_USERS = gql`
    query GetAllUsers {
        users {
            id
            wallet
            twitter
        }
    }
`;

export const GET_ALL_SUBWALLET = gql`
    query GetAllLinkedWallet($user: String!) {
        getAllLinkedWallet(user: $user) {
            user
            wallet
        }
    }
`;

export const IS_FOLLOWED = gql`
    query IsFollowed($user: String!, $wallet: String!) {
        isFollowed(user: $user, wallet: $wallet)
    }
`;

export const GET_USER_FOLLOWINGS = gql`
    query GetUserFollowings($wallet: String!) {
        getUserFollowings(wallet: $wallet) {
            wallet
        }
    }
`;

export const GET_USER_FOLLOWERS = gql`
    query GetUserFollowers($wallet: String!) {
        getUserFollowers(wallet: $wallet) {
            id
            vanity
            wallet
            discord {
                id
                name
                discriminator
                avatar
                membership
            }
            twitter
            avatar
            banner
            bio
            location
        }
    }
`;

export const GET_USER_BY_TWITTER_HANDLE = gql`
    query GetUserByTwitterHandle($twitterHandle: String!) {
        getUserByTwitterHandle(twitterHandle: $twitterHandle) {
            id
            wallet
            twitter
        }
    }
`;

export const GET_ME_ESCROW_BALANCE = gql`
    query GetMEEscrowBalance($wallet: String!) {
        getMEEscrowBalance(wallet: $wallet) {
            buyerEscrow
            balance
        }
    }
`;

export const GET_ME_OFFER_MADE = gql`
    query GetMEOfferMade($wallet: String!, $offset: Int, $limit: Int) {
        getMEOfferMade(wallet: $wallet, offset: $offset, limit: $limit) {
            pdaAddress
            tokenMint
            auctionHouse
            buyer
            price
            tokenSize
            expiry
        }
    }
`;

export const GET_ME_OFFER_RECEIVED = gql`
    query GetMEOfferReceived($wallet: String!, $offset: Int, $limit: Int) {
        getMEOfferReceived(wallet: $wallet, offset: $offset, limit: $limit) {
            pdaAddress
            tokenMint
            auctionHouse
            buyer
            price
            tokenSize
            expiry
        }
    }
`;

export const GET_ME_TOKEN_OFFER_RECEIVED = gql`
    query GetMETokenOfferReceived($mint: String!, $offset: Int, $limit: Int) {
        getMETokenOfferReceived(mint: $mint, offset: $offset, limit: $limit) {
            pdaAddress
            tokenMint
            auctionHouse
            buyer
            price
            tokenSize
            expiry
        }
    }
`;

export const GET_NFTS_BY_OWNER = gql`
    query GetNFTsByOwner($wallets: [String]!) {
        getNFTsByOwner(wallets: $wallets)
    }
`;

export const GET_CORAL_USER_PROFILE = gql`
    query GetUserProfile($pubkey: String!) {
        getUserProfile(pubkey: $pubkey)
    }
`;

export const GET_NFTS_BY_MINT = gql`
    query fetch($mint: [String]) {
        fetch(mint: $mint) {
            mint
            metadata {
                json
                jsonLoaded
                name
                symbol
                uri
                creators
                collection
                collectionDetails
                address
                metadataAddress
            }
        }
    }
`;

export const GET_NFTS_BY_WALLET = gql`
    query getWallet($wallet: String) {
        getWallet(wallet: $wallet) {
            mint
            metadata {
                json
                jsonLoaded
                name
                symbol
                uri
                creators
                collection
                collectionDetails
                address
                metadataAddress
            }
        }
    }
`;
