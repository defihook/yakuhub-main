import useAuth from './useAuth';
import { useLazyQuery } from '@apollo/client';

const useAuthLazyQuery = (query: any, options: any = {}) => {
    const { token } = useAuth();
    return useLazyQuery(query, {
        ...options,
        context: {
            ...options.context,
            headers: {
                'x-token': token
            }
        }
    });
};

export default useAuthLazyQuery;
