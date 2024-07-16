import _ from 'lodash';

import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import { formatAmount } from 'utils/utils';
import TokenTradingViewAreaChart from 'components/TokenTradingViewAreaChart';

function DefiTvlChartAndStats({ tokenData, tokenId }: any) {
    const chartData = _.map(_.get(tokenData, 'tvl', []), (d) => {
        const time = d.date;
        return {
            time,
            value: d.totalLiquidityUSD
        };
    });
    const { name, currentChainTvls, logo, symbol } = tokenData;
    const totalTvl = _.reduce(
        currentChainTvls,
        (total, tvl, chain) => {
            if (_.includes(chain, 'borrowed')) {
                return total;
            }
            total += tvl;
            return total;
        },
        0
    );

    return (
        <MainCard border={false}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                    <Stack spacing={3}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar src={logo} />
                            <Typography component="h3" fontSize={20} fontWeight={900}>
                                {name}
                            </Typography>
                            <Typography component="h3" fontSize={20} fontWeight={900}>
                                ({symbol})
                            </Typography>
                        </Stack>
                        <Stack>
                            <Typography variant="caption">Total Value Locked</Typography>
                            <Typography component="h3" fontSize={30} fontWeight={900}>
                                ${formatAmount(totalTvl)}
                            </Typography>
                        </Stack>
                        <Stack>
                            <Typography variant="caption" sx={{ mb: 1 }}>
                                Chain Breakdown
                            </Typography>
                            {_.map(currentChainTvls, (tvl, chain) => {
                                if (_.includes(chain, 'borrowed')) {
                                    return null;
                                }
                                return (
                                    <Stack key={`${chain}-tvl`} direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                        <Typography fontWeight={900}>{chain}</Typography>
                                        <Typography fontWeight={900}>${formatAmount(tvl)}</Typography>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </Stack>
                </Grid>
                <Grid item xs={12} md={9}>
                    <TokenTradingViewAreaChart chartId={tokenId} chartData={chartData} />
                </Grid>
            </Grid>
        </MainCard>
    );
}

export default DefiTvlChartAndStats;
