import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// eslint-disable-next-line import/prefer-default-export
export function useQuerySearch() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}
