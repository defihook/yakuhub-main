import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache } from '@apollo/client';

function createLink(uri = '/api/graphql') {
    const httpLink = createHttpLink({ uri, credentials: 'include' });
    return ApolloLink.from([httpLink]);
}
const client: any = new ApolloClient({
    cache: new InMemoryCache(),
    link: createLink(process.env.REACT_APP_ENV === 'development' ? 'http://localhost:8080/api/graphql' : '/api/graphql')
});

export default client;
