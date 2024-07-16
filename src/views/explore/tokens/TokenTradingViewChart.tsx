import _ from 'lodash';
import { Button, Chip, Grid, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import TokenTradingViewAreaChart from 'components/TokenTradingViewAreaChart';
import { useState } from 'react';
import { minWidth } from '@mui/system';

function TokenTradingViewChart({ tokenData, chartData, tokenId, updateChart }: any) {
    const [selected, setSelected] = useState<Number>(1);

    const tokenCurrentPrice = _.get(tokenData, 'market_data.current_price.usd', 'n/a');
    const tokenPriceChange24hPercent = _.get(tokenData, 'market_data.price_change_percentage_24h', 0);

    const percentageChipLabel = (
        <>
            <Typography
                component="span"
                color={tokenPriceChange24hPercent > 0 ? 'green' : 'red'}
                fontWeight={500}
                sx={{
                    transform: tokenPriceChange24hPercent > 0 ? 'rotate(180deg)' : 'none',
                    display: 'inline-block'
                }}
            >
                ▾
            </Typography>{' '}
            <Typography component="span" color={tokenPriceChange24hPercent > 0 ? 'green' : 'red'}>
                {Number(Math.abs(_.round(tokenPriceChange24hPercent, 1))).toLocaleString()}%
            </Typography>
        </>
    );

    const daysButton = [
        {
            label: '1D',
            days: '1'
        },
        {
            label: '1W',
            days: '7'
        },
        {
            label: '1M',
            days: '30'
        },
        {
            label: '3M',
            days: '90'
        },
        {
            label: '6M',
            days: '180'
        },
        {
            label: '1Y',
            days: '365'
        },
        {
            label: '2Y',
            days: '730'
        },
        {
            label: '5Y',
            days: '1825'
        }
    ];

    const changeDays = async (index: Number, days: String) => {
        setSelected(index);
        await updateChart(days);
    };

    return (
        <MainCard border={false}>
            <Grid container spacing={2}>
                <Grid item sx={{ width: '100%' }}>
                    <Typography fontSize={32} fontWeight={700} mb={0.5}>
                        ${tokenCurrentPrice.toLocaleString()}
                    </Typography>
                    <Grid
                        item
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: { sm: 'space-between' },
                            flexDirection: { xs: 'column', sm: 'row' }
                        }}
                    >
                        <Chip size="small" label={percentageChipLabel} />
                        <Grid
                            item
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                                borderRadius: '25px',
                                height: { xs: '30px', sm: '48px' },
                                display: 'flex',
                                paddingRight: '4px',
                                paddingLeft: '4px',
                                marginTop: { xs: '15px', sm: '0px' }
                            }}
                        >
                            {_.map(daysButton, (days, index) => (
                                <Button
                                    color="secondary"
                                    variant={index === selected ? 'contained' : 'text'}
                                    key={days.label}
                                    onClick={() => changeDays(index, days.days)}
                                    sx={{
                                        borderRadius: { xs: '15px', sm: '25px' },
                                        my: '4px',
                                        px: { xs: '6px', sm: '16px' },
                                        minWidth: { xs: '45px', ms: '64px' }
                                    }}
                                >
                                    {days.label}
                                </Button>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <TokenTradingViewAreaChart chartId={tokenId} chartData={chartData} />
                </Grid>
            </Grid>
        </MainCard>
    );
}

export default TokenTradingViewChart;
