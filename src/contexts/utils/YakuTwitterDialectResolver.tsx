/* eslint-disable class-methods-use-this */
import _ from 'lodash';
import { PublicKey } from '@solana/web3.js';
import client from 'config/createApolloClient';
import { queries } from '../../graphql/graphql';
import { Identity, IdentityResolver } from '@dialectlabs/react-ui';

class YakuTwitterDialectIdentityResolver implements IdentityResolver {
    constructor(private readonly token: String | undefined) {}

    get type(): string {
        return 'YAKU_TWITTER';
    }

    async resolve(publicKey: PublicKey): Promise<Identity | null> {
        if (!this.token) {
            return null;
        }
        const { data } = await client.query({
            query: queries.USER,
            variables: { wallet: publicKey },
            context: {
                headers: {
                    'x-token': this.token
                }
            }
        });
        const userTwitterName = _.get(data, 'user.twitter.username');
        if (!userTwitterName) {
            return null;
        }
        return {
            type: this.type,
            publicKey,
            name: userTwitterName,
            additionals: {
                displayName: userTwitterName,
                link: `https://twitter.com/${userTwitterName}`
            }
        };
    }

    async resolveReverse(rawDomainName: string): Promise<Identity | null> {
        if (!this.token) {
            return null;
        }
        let domainName = rawDomainName.trim();
        if (rawDomainName.startsWith('@')) {
            domainName = domainName.slice(1);
        }
        const { data } = await client.query({
            query: queries.GET_USER_BY_TWITTER_HANDLE,
            variables: { twitterHandle: domainName },
            context: {
                headers: {
                    'x-token': this.token
                }
            }
        });
        const userData = _.get(data, 'getUserByTwitterHandle');
        if (!userData) {
            return null;
        }
        return {
            type: this.type,
            name: domainName,
            publicKey: new PublicKey(userData.wallet),
            additionals: {
                displayName: domainName,
                link: `https://twitter.com/${domainName}`
            }
        };
    }
}

export default YakuTwitterDialectIdentityResolver;
