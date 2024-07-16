import { useState, useEffect } from 'react';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { LinearProgress, Grid } from '@mui/material';
import { useLazyQuery } from '@apollo/client';

import TokenDetailHeader from './TokenDetailHeader';
import DefiTokenInformation from './DefiTokenInformation';
import TokenTradingViewChart from './TokenTradingViewChart';
import TokenPriceStatistics from './TokenPriceStatistics';
import { queries } from '../../../graphql/graphql';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';

function TokenDetailView() {
    const { tokenId } = useParams();
    const [loading, setLoading] = useState(true);
    const [tokenData, setTokenData] = useState<any>({});
    const [chartData, setChartData] = useState<any>([]);
    const [getCoinInfo] = useLazyQuery(queries.GET_COIN_INFO);
    const [getTokenChart] = useAuthLazyQuery(queries.GET_COINS_MARKET_CHART);

    const updatePage = async () => {
        setLoading(true);
        const result = await getCoinInfo({
            variables: {
                coinId: tokenId
            }
        });
        const responseCode = _.get(result, 'data.fetchCoin.code');
        const data = _.get(result, 'data.fetchCoin.data', {});
        if (responseCode === 200) {
            setTokenData(data);
        }
        setLoading(false);
    };

    const updateChart = async (days = '7') => {
        const { data: chartResult } = await getTokenChart({
            variables: {
                coinId: tokenId,
                params: {
                    vs_currency: 'usd',
                    days
                }
            }
        });
        const chartResponseCode = _.get(chartResult, 'fetchMarketChart.code');
        const priceChart = _.get(chartResult, 'fetchMarketChart.data.prices', []);
        if (chartResponseCode === 200 && priceChart.length > 1) {
            const result = _.map(priceChart, (d) => {
                const time = Math.trunc(d[0] / 1000);
                return {
                    time,
                    value: d[1]
                };
            });

            setChartData(result);
        }
    };

    useEffect(() => {
        setLoading(true);
        updatePage();
        updateChart();
        // eslint-disable-next-line
    }, [tokenId]);

    if (loading || _.isEmpty(tokenData)) {
        return <LinearProgress color="secondary" />;
    }

    return (
        <>
            <TokenDetailHeader tokenData={tokenData} />
            <Grid container sx={{ my: { md: 2, sm: 0, sx: 0 } }} spacing={2}>
                <Grid item xs={12}>
                    <TokenPriceStatistics tokenData={tokenData} />
                </Grid>
                <Grid item xs={12}>
                    <TokenTradingViewChart tokenData={tokenData} chartData={chartData} tokenId={tokenId} updateChart={updateChart} />
                </Grid>
                <Grid item xs={12}>
                    <DefiTokenInformation tokenData={tokenData} />
                </Grid>
            </Grid>
        </>
    );
}

export default TokenDetailView;
