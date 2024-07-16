/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { LinearProgress } from '@mui/material';
import { queries } from '../../../graphql/graphql';
import useAuthQuery from 'hooks/useAuthQuery';
import { useEffect, useState } from 'react';
import ActivitiesList from './components/ActivitiesList';
import { map } from 'lodash';

const MPActivitiesView = ({ project_id, me_slug, supply, filters, refresh, chain }: any) => {
    const attributes = map(Object.keys(filters), (n) => ({
        name: n,
        ...filters[n]
    }));
    const [listData, setListData] = useState<any>([]);
    const { data: mpActivities, refetch: refetchMpAct } = useAuthQuery(queries.GET_MP_ACTIVITIES, {
        variables: {
            condition: {
                projects: [
                    {
                        project_id,
                        attributes
                    }
                ],
                actionTypes: ['TRANSACTION', 'BID', 'CANCELBID', 'LISTING', 'DELISTING'],
                chain
            },
            paginationInfo: {
                page_number: 1,
                page_size: 30
            }
        }
    });

    const updateView = async () => {
        const { data: newData } = await refetchMpAct();
        setListData(newData?.getMarketplaceActivities?.market_place_snapshots);
    };

    useEffect(() => {
        updateView();
    }, [project_id, refresh, attributes]);

    useEffect(() => {
        updateView();
    }, []);

    return (
        <>
            {!listData?.length ? (
                <LinearProgress color="secondary" />
            ) : (
                <ActivitiesList listData={listData} supply={supply} chain={chain} />
            )}
        </>
    );
};

export default MPActivitiesView;
