import gql from 'graphql-tag';

// Space Mutations
export const ADD_SPACE = gql`
    # prettier-ignore
    mutation AddSpace($owner: String!, $creatorWallet: String!, $name: String!, $symbol: String!, $avatar: String!, $discord: String, $twitter: String, $website: String) {
        addSpace(owner: $owner, creatorWallet: $creatorWallet, name: $name, symbol: $symbol, avatar: $avatar, discord: $discord, twitter: $twitter, website: $website) {
            id
            owner
            creatorWallet
            name
            symbol
        }
    }
`;

export const JOIN_SPACE = gql`
    # prettier-ignore
    mutation AddMember($_id: ID!, $member: String!) {
        addMember(_id: $_id, member: $member) {
            id
            owner
            creatorWallet
            name
            symbol
        }
    }
`;

export const CREATE_PROPOSAL = gql`
    # prettier-ignore
    mutation CreateProposal($author: String!, $title: String!, $body: String, $discussion: String, $postedIn: ID!, $endsAt: String!) {
        createProposal(author: $author, title: $title, body: $body, discussion: $discussion, postedIn: $postedIn, endsAt: $endsAt) {
            id
            author
            title
            body
            discussion
            state
            choices
            endsAt
            createdAt
        }
    }
`;

export const CLOSE_PROPOSAL = gql`
    mutation CloseProposal($id: ID!) {
        closeProposal(id: $id)
    }
`;

export const DELETE_PROPOSAL = gql`
    mutation DeleteProposal($id: ID!) {
        deleteProposal(id: $id)
    }
`;

export const VOTE_PROPOSAL = gql`
    mutation VoteProposal($id: ID!, $type: String!, $wallet: String!) {
        voteProposal(id: $id, type: $type, wallet: $wallet) {
            id
            author
            title
            description
            discussion
            status
            type
            forVotes
            againstVotes
            abstainVotes
            endsAt
            createdAt
        }
    }
`;

// Workspace Mutations
export const CREATE_WORKSPACE = gql`
    # prettier-ignore
    mutation CreatWorkspace(
        $owner: String!,
        $name: String!,
        $description: String,
        $image: String,
        $website: String,
        $twitter: String,
        $discord: String,
        $token: String,
        $users: [InputWorkspaceUser]
    ) {
        createWorkspace(
            owner: $owner,
            name: $name,
            description: $description,
            image: $image,
            website: $website,
            twitter: $twitter,
            discord: $discord,
            token: $token,
            users: $users
            balance: 0.03,
        ) {
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

export const ADD_USER = gql`
    # prettier-ignore
    mutation AddUser(
        $id: String!,
        $user: InputWorkspaceUser!
    ) {
        addUser(
            id: $id,
            user: $user
        ) {
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

export const DELETE_USER = gql`
    # prettier-ignore
    mutation DeleteUser(
        $id: String!,
        $address: String!
    ) {
        deleteUser(
            id: $id,
            address: $address
        ) {
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

// User Mutations
export const LOG_IN = gql`
    mutation login($wallet: String, $ethAddress: String) {
        login(wallet: $wallet, ethAddress: $ethAddress) {
            token
            registered
            user {
                id
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
    }
`;

export const SIGN_UP = gql`
    mutation signup($wallet: String, $vanity: String, $ethAddress: String) {
        signup(wallet: $wallet, vanity: $vanity, ethAddress: $ethAddress) {
            token
            user {
                id
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
    }
`;

export const DISCORD_AUTH = gql`
    mutation discordAuth($address: String!, $code: String!, $redirectUri: String) {
        discordAuth(address: $address, code: $code, redirectUri: $redirectUri) {
            id
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

export const GET_DISCORD_LINK = gql`
    mutation getDiscordConnectURL($redirectUri: String) {
        getDiscordConnectURL(redirectUri: $redirectUri)
    }
`;

// Staff management set

export const CREAT_PROJECT = gql`
    mutation createWallet($project: String!, $wallet: String!) {
        createWallet(project: $project, wallet: $wallet) {
            project
        }
    }
`;
export const ADD_CLAIMER = gql`
    mutation createClaimer(
        $project: String!
        $name: String!
        $method: String!
        $amount: String!
        $wallet: String!
        $period: String!
        $time: String!
        $employer: String!
    ) {
        createClaimer(
            project: $project
            name: $name
            method: $method
            amount: $amount
            wallet: $wallet
            period: $period
            time: $time
            employer: $employer
        ) {
            project
            name
            method
            amount
            employer
            wallet
            time
            period
            createdAt
            updatedAt
        }
    }
`;

export const DELETE_CLAIMER = gql`
    mutation deleteClaimer($project: String!, $name: String!, $wallet: String!, $employer: String!) {
        deleteClaimer(project: $project, name: $name, wallet: $wallet, employer: $employer)
    }
`;

export const CLAIM = gql`
    mutation clickClaim($project: String!, $wallet: String!, $method: String!, $employer: String!) {
        clickClaim(project: $project, wallet: $wallet, method: $method, employer: $employer) {
            project
            employer
            name
            amount
            wallet
            period
            time
        }
    }
`;

export const WITHDRAW = gql`
    mutation clickWithdraw($project: String!, $method: String!, $amount: Int!) {
        clickWithdraw(project: $project, method: $method, amount: $amount)
    }
`;

// Mints
export const CREATE_FAVOURITE_MINT = gql`
    mutation CreateFavouriteMint($title: String!) {
        createFavouriteMint(title: $title) {
            userId
            title
        }
    }
`;

export const REMOVE_FAVOURITE_MINT = gql`
    mutation RemoveFavouriteMint($title: String!) {
        removeFavouriteMint(title: $title)
    }
`;

export const CREATE_USER_MINT = gql`
    mutation CreateUserMint($title: String!, $date: String!, $supply: String!, $logo: String!) {
        createUserMint(title: $title, date: $date, supply: $supply, logo: $logo) {
            date
            title
            supply
            logo
        }
    }
`;

export const UPDATE_USER_MINT = gql`
    mutation UpdateUserMint($previousTitle: String!, $title: String!, $date: String!, $supply: String!, $logo: String!) {
        updateUserMint(previousTitle: $previousTitle, title: $title, date: $date, supply: $supply, logo: $logo) {
            date
            title
            supply
            logo
        }
    }
`;

export const REMOVE_USER_MINT = gql`
    mutation RemoveUserMint($title: String!) {
        removeUserMint(title: $title)
    }
`;

export const CREATE_MINT_COLOR = gql`
    mutation CreateMintColor($title: String!, $color: String!) {
        createMintColor(title: $title, color: $color) {
            color
            title
        }
    }
`;
export const REMOVE_MINT_COLOR = gql`
    mutation RemoveMintColor($title: String!) {
        removeMintColor(title: $title)
    }
`;

export const CREATE_MINT_NOTIFICATION = gql`
    mutation CreateMintNotification($title: String!, $date: String!) {
        createMintNotification(title: $title, date: $date) {
            date
            title
        }
    }
`;

export const REMOVE_MINT_NOTIFICATION = gql`
    mutation RemoveMintNotification($title: String!) {
        removeMintNotification(title: $title)
    }
`;

export const CREATE_NOTIFICATION = gql`
    mutation CreateNotification($title: String!, $date: String!, $description: String!, $icon: String!, $status: String!) {
        createNotification(title: $title, date: $date, description: $description, icon: $icon, status: $status) {
            date
            title
            description
            icon
            status
        }
    }
`;

export const UPDATE_NOTIFICATION_STATUS = gql`
    mutation UpdateNotificationStatus($id: String!, $status: String!) {
        updateNotificationStatus(id: $id, status: $status)
    }
`;

export const DELETE_NOTIFICATION = gql`
    mutation DeleteNotification($id: String!) {
        deleteNotification(id: $id)
    }
`;

export const UPDATE_ALL_NOTIFICATIONS_STATUS = gql`
    mutation UpdateAllNotificationsStatus($status: String!) {
        updateAllNotificationsStatus(status: $status)
    }
`;

export const ADD_METADATA = gql`
    mutation AddMetadata(
        $mint: String
        $symbol: String
        $name: String
        $description: String
        $seller_fee_basis_points: Int
        $image: String
        $external_url: String
        $attributes: [InputAttribute]
        $properties: Anything
        $project: Anything
    ) {
        addMetadata(
            mint: $mint
            symbol: $symbol
            name: $name
            description: $description
            seller_fee_basis_points: $seller_fee_basis_points
            image: $image
            external_url: $external_url
            attributes: $attributes
            properties: $properties
            project: $project
        ) {
            id
            mint
        }
    }
`;

export const ADD_METADATAS = gql`
    mutation addMetadatas($mints: [Anything]) {
        addMetadatas(mints: $mints)
    }
`;

export const GET_ME_TRANSACTION_INSTRUCTIONS = gql`
    mutation GetMETransactionInstructions($buyer: String!, $tokenMint: String!) {
        getMETransactionInstructions(buyer: $buyer, tokenMint: $tokenMint) {
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
export const GET_ME_DELIST_TRANSACTION_INSTRUCTIONS = gql`
    mutation GetMEDelistTransactionInstructions($seller: String!, $tokenMint: String!) {
        getMEDelistTransactionInstructions(seller: $seller, tokenMint: $tokenMint) {
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
export const GET_ME_LIST_TRANSACTION_INSTRUCTIONS = gql`
    mutation GetMEListTransactionInstructions($seller: String!, $tokenMint: String!, $price: Float!) {
        getMEListTransactionInstructions(seller: $seller, tokenMint: $tokenMint, price: $price) {
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

export const CREATE_BUY_TX = gql`
    mutation CreateBuyTx(
        $buyerAddress: String!
        $price: Float!
        $tokenAddress: String!
        $buyerBroker: String!
        $tokens: [String]!
        $chain: String!
    ) {
        createBuyTx(
            buyerAddress: $buyerAddress
            price: $price
            tokenAddress: $tokenAddress
            buyerBroker: $buyerBroker
            tokens: $tokens
            chain: $chain
        ) {
            data
            is_required_signers_on
            metadata
            error
            txObj
        }
    }
`;

export const CREATE_DELIST_TX = gql`
    mutation CreateBuyTx($sellerAddress: String!, $tokenAddress: String!) {
        createDelistTx(sellerAddress: $sellerAddress, tokenAddress: $tokenAddress) {
            data
            is_required_signers_on
            metadata
            error
        }
    }
`;

export const LINK_WALLET = gql`
    mutation LinkWallet($user: String!, $wallet: String!) {
        linkWallet(user: $user, wallet: $wallet) {
            user
            wallet
        }
    }
`;
export const UNLINK_WALLET = gql`
    mutation UnlinkWallet($user: String!, $wallet: String!) {
        unlinkWallet(user: $user, wallet: $wallet) {
            user
            wallet
        }
    }
`;

export const FOLLOW_WALLET_TOGGLE = gql`
    mutation FollowWallet($user: String!, $wallet: String!) {
        followWallet(user: $user, wallet: $wallet) {
            result
        }
    }
`;

export const GET_ME_BID_TRANSACTION_INSTRUCTIONS = gql`
    mutation GetMEBidTransactionInstructions($buyer: String!, $tokenMint: String!, $price: Float!) {
        getMEBidTransactionInstructions(buyer: $buyer, tokenMint: $tokenMint, price: $price) {
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

export const GET_ME_CANCEL_BID_TRANSACTION_INSTRUCTIONS = gql`
    mutation GetMECancelBidTransactionInstructions($buyer: String!, $tokenMint: String!, $price: Float!) {
        getMECancelBidTransactionInstructions(buyer: $buyer, tokenMint: $tokenMint, price: $price) {
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

export const GET_ME_ACCEPT_OFFER_TRANSACTION_INSTRUCTIONS = gql`
    mutation GetMEAcceptOfferTransactionInstructions(
        $buyer: String!
        $seller: String!
        $tokenMint: String!
        $price: Float!
        $newPrice: Float!
    ) {
        getMEAcceptOfferTransactionInstructions(buyer: $buyer, seller: $seller, tokenMint: $tokenMint, price: $price, newPrice: $newPrice) {
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

export const GET_ME_CHANGE_BID_TRANSACTION_INSTRUCTIONS = gql`
    mutation GetMEChangeBidTransactionInstructions($buyer: String!, $tokenMint: String!, $price: Float!, $newPrice: Float!) {
        getMEChangeBidTransactionInstructions(buyer: $buyer, tokenMint: $tokenMint, price: $price, newPrice: $newPrice) {
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

export const GET_ME_DEPOSIT_TRANSACTION_INSTRUCTIONS = gql`
    mutation GetMEDepositTransactionInstructions($buyer: String!, $amount: Float!) {
        getMEDepositTransactionInstructions(buyer: $buyer, amount: $amount) {
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

export const GET_ME_WITHDRAW_TRANSACTION_INSTRUCTIONS = gql`
    mutation GetMEWithdrawTransactionInstructions($buyer: String!, $amount: Float!) {
        getMEWithdrawTransactionInstructions(buyer: $buyer, amount: $amount) {
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

export const TWITTER_AUTH = gql`
    mutation linkTwitter($address: String!, $code: String!, $redirectUri: String) {
        linkTwitter(address: $address, code: $code, redirectUri: $redirectUri) {
            id
            wallet
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

export const GET_TWITTER_LINK = gql`
    mutation getTwitterAuth($address: String!, $redirectUri: String) {
        getTwitterAuth(address: $address, redirectUri: $redirectUri)
    }
`;

export const SET_AVATAR = gql`
    mutation setAvatar($imageUrl: String!) {
        setAvatar(imageUrl: $imageUrl)
    }
`;

export const SET_BANNER = gql`
    mutation setBanner($imageUrl: String!) {
        setBanner(imageUrl: $imageUrl)
    }
`;

export const UPDATE_PROFILE = gql`
    mutation updateProfile($profile: Anything) {
        updateProfile(profile: $profile)
    }
`;
