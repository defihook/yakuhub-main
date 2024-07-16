import { gql } from 'apollo-server-express';

export default gql`
    scalar Anything
    type AttributeSchema {
        trait_type: String
        value: Anything
    }
    type CreatorSchema {
        address: String
        share: Int
    }
    type Metadata {
        id: ID!
        mint: String
        symbol: String
        name: String
        description: String
        seller_fee_basis_points: Int
        image: String
        external_url: String
        attributes: [AttributeSchema]
        properties: Anything
        project: Anything
    }
    type MetaType {
        model: String
        json: Anything
        jsonLoaded: Boolean
        name: String
        symbol: String
        uri: String
        sellerFeeBasisPoints: Int
        creators: [Anything]
        collection: Anything
        collectionDetails: Anything
        address: Anything
        metadataAddress: Anything
        mint: Anything
    }
    type NFTMetaType {
        mint: String
        metadata: MetaType
    }

    input InputAttribute {
        trait_type: String
        value: Anything
    }

    input InputCreator {
        address: String
        share: Int
    }

    extend type Query {
        getMetadatas(mints: [String]): [Metadata]!
        getMetadata(mint: String!): Metadata
        fetch(mint: [String]): [NFTMetaType]
        getWallet(wallet: String): [NFTMetaType]
    }

    extend type Mutation {
        addMetadata(
            mint: String
            symbol: String
            name: String
            description: String
            seller_fee_basis_points: Int
            image: String
            external_url: String
            attributes: [InputAttribute]
            properties: Anything
            project: Anything
        ): Metadata
        addMetadatas(mints: [Anything]): Boolean
    }
`;
