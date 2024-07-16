import useAuth from './useAuth';
import { useMutation } from '@apollo/client';

const useAuthMutation = (mutation: any, options: any = {}) => {
    const { token } = useAuth();
    return useMutation(mutation, {
        ...options,
        context: {
            ...options.context,
            headers: {
                'x-token': token
            }
        }
    });
};

export default useAuthMutation;
