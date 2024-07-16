import useAuth from './useAuth';
import { useQuery } from '@apollo/client';
import { isEmpty, isNil, isNull, isUndefined } from 'lodash';

const useAuthQuery = (query: any, options: any = {}) => {
    const { token } = useAuth();
    return useQuery(query, {
        ...options,
        skip: isEmpty(token) || isNull(token) || isUndefined(token) || isNil(token) || options.skip,
        context: {
            ...options.context,
            headers: {
                'x-token': token
            }
        }
    });
};

export default useAuthQuery;
