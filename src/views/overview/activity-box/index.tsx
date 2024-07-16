import { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { Promise } from 'bluebird';
import { get, round } from 'lodash';
import { shortenAddress } from 'utils/utils';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { queries } from '../../../graphql/graphql';
import { IMAGE_PROXY } from 'config/config';
import moment from 'moment';
import '../overview.scss';

const ActivityBox = ({ wallet }: any) => {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [getWalletActivities] = useAuthLazyQuery(queries.GET_WALLET_ACTIVITIES);
    const [getToken] = useAuthLazyQuery(queries.GET_TOKEN_BY_MINT);

    const getTokensData = async (walletHist: any[]) => {
        try {
            const digestedList = await Promise.mapSeries(walletHist, async (item: any) => ({
                ...item,
                ...get(
                    await getToken({
                        variables: {
                            mint: item.tokenMint
                        }
                    }),
                    'data.getTokenByMint',
                    {}
                )
            }));
            setActivities(digestedList);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchWalletActivities = async () => {
        try {
            setLoading(true);
            console.log('WALLET_ACTIVITIES_FETCHING...');
            const { data } = await getWalletActivities({
                variables: {
                    wallet,
                    offset: 0,
                    limit: 10
                }
            });
            console.log('WALLET_ACTIVITIES: ', data.getWalletActivities);
            await getTokensData(data.getWalletActivities);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletActivities();
    }, []);

    const getStatusLabel = (activity: any) => {
        switch (activity.type) {
            case 'bid':
                return 'Placed Bid';
            case 'list':
                return 'Listed';
            case 'buyNow':
                if (activity.buyer === wallet) {
                    return `Bought from ${shortenAddress(activity.seller)}`;
                }
                return `Sold to ${shortenAddress(activity.buyer)}`;
            case 'cancelBid':
                return 'Cancelled Bid';
            case 'delist':
                return 'Delisted';
            default:
                return 'Unknown';
        }
    };

    return (
        <section className="activity-box mid-bg rounded-3xl overflow-hidden shadow-sm">
            <div className="h-full p-4 overflow-auto">
                <h2 className="high-text text-base font-bold">Recent activity</h2>
                {loading ? (
                    <div className="py-8 text-center">
                        <CircularProgress color="secondary" />
                    </div>
                ) : (
                    <>
                        {activities.length === 0 ? (
                            <p className="py-8 text-center">No activities</p>
                        ) : (
                            activities.map((el, idx) => (
                                <div key={idx} className="activity-item mt-4 rounded-3xl shadow-sm">
                                    <div className="flex items-center">
                                        <img
                                            className="h-12 w-12 mr-2 rounded-2xl object-cover"
                                            src={`${IMAGE_PROXY}${el.image}`}
                                            alt={el.name}
                                        />
                                        <div>
                                            <h3 className="high-text mb-1 text-sm font-bold">{el.name}</h3>
                                            <p className="low-text text-sm font-medium">{getStatusLabel(el)}</p>
                                        </div>
                                    </div>

                                    <div className="low-bg flex items-center justify-between mt-3 p-2 rounded-2xl">
                                        <h4 className="ml-2 font-bold">{round(Number(el.price), 3).toLocaleString()} sol</h4>
                                        <p className="low-text">
                                            <span>{moment.unix(el.blockTime).fromNow()}</span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default ActivityBox;
