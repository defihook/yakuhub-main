export interface BonfidaFetched {
    name: string;
    owner?: string;
    registered: boolean;
    fixedPrice: boolean;
    tokenized: boolean;
    auction: boolean;
    content?: string;
}
