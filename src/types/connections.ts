import { web3 } from '@project-serum/anchor';

export type ConnectionsContextType = {
    connection: web3.Connection;
    selectFastest: (omit?: web3.Connection) => Promise<web3.Connection>;
};
