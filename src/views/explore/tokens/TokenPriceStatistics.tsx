import { get, isNumber, round } from 'lodash';
import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { numberFormatter } from 'utils/utils';

function TokenPriceStatistics({ tokenData }: any) {
    const tradingVolume = get(tokenData, 'market_data.total_volume.usd', 0);
    const marketCap = get(tokenData, 'market_data.market_cap.usd', 0);
    const maxSupply = get(tokenData, 'market_data.max_supply', 'n/a');
    const circulatingSupply = get(tokenData, 'market_data.circulating_supply', 'n/a');
    const priceChange7D = get(tokenData, 'market_data.price_change_percentage_7d', 'n/a');
    const symbol = get(tokenData, 'symbol', '');

    const toLocalStr = (val: number | string) => (isNumber(val) ? val.toLocaleString() : val);
    const toUpperStr = (val: string) => (val ? val.toUpperCase() : '');

    const statistics = [
        { label: `Market Cap`, value: `$${toLocalStr(marketCap)}` },
        { label: `Trading Volume (24H)`, value: `$${toLocalStr(tradingVolume)}` },
        { label: `Circulating Supply`, value: `${toLocalStr(circulatingSupply)} ${toUpperStr(symbol)}` },
        { label: `Max Supply`, value: `${maxSupply ? toLocalStr(maxSupply) : 'N/A'} ${toUpperStr(symbol)}` }
        // { label: `Price change (7D)`, value: `${toLocalStr(priceChange7D)}` }
    ];

    const statisticsFormated = [
        { label: `Market Cap`, value: `$${numberFormatter(marketCap, 2)}` },
        { label: `Trading Volume (24H)`, value: `$${numberFormatter(tradingVolume, 2)}` },
        { label: `Circulating Supply`, value: `${numberFormatter(circulatingSupply, 2)} ${toUpperStr(symbol)}` },
        { label: `Max Supply`, value: `${maxSupply ? numberFormatter(maxSupply, 2) : 'N/A'} ${toUpperStr(symbol)}` }
        // { label: `Price change (7D)`, value: `${toLocalStr(priceChange7D)}` }
    ];

    const percentageChipLabel = (
        <>
            <Typography
                component="span"
                color={priceChange7D > 0 ? 'green' : 'red'}
                fontWeight={500}
                sx={{
                    transform: priceChange7D > 0 ? 'rotate(180deg)' : 'none',
                    display: 'inline-block'
                }}
            >
                ▾
            </Typography>{' '}
            <Typography component="span" color={priceChange7D > 0 ? 'green' : 'red'} fontWeight={700}>
                {Number(Math.abs(round(priceChange7D, 1))).toLocaleString()}%
            </Typography>
        </>
    );

    return (
        <Box sx={{ background: { lg: '#120c18', md: '#120c18', sm: 'transparent', sx: 'transparent' }, borderRadius: 0.5, py: 1.5 }}>
            <Grid container spacing={0} sx={{ flexWrap: 'wrap' }}>
                <Grid
                    item
                    sx={{
                        p: { lg: '0 0 0 20px', md: 1, sm: 1, xs: 1 },
                        borderRadius: 1,
                        m: { lg: 0, md: 0, sm: 1, xs: 1 },
                        background: { sm: '#120c18', xs: '#120c18', md: 'transparent', lg: 'transparent' },
                        width: { lg: 'calc(20% - 4px)', md: 'calc(20% - 4px)', sm: 'calc(33.3% - 36px)', xs: 'calc(50% - 16px)' },
                        textAlign: { md: 'left', sm: 'center', xs: 'center' }
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '12px',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            color: '#c4c5c9'
                        }}
                    >
                        {statistics[0].label}
                    </Typography>
                    <Typography sx={{ fontSize: { md: 16, sm: 15, xs: 14 }, fontWeight: '700' }}>{statistics[0].value}</Typography>
                </Grid>

                <Grid
                    item
                    sx={{
                        p: { lg: '0 0 0 20px', md: 1, sm: 1, xs: 1 },
                        borderLeft: '2px solid rgba(51, 39, 63, 1)',
                        width: { lg: 'calc(20% - 4px)', md: 'calc(20% - 4px)', sm: 'calc(33.3% - 36px)', xs: 'calc(50% - 16px)' },

                        m: { lg: 0, md: 0, sm: 1, xs: 1 },
                        background: { sm: '#120c18', xs: '#120c18', md: 'transparent', lg: 'transparent' },
                        textAlign: { md: 'left', sm: 'center', xs: 'center' }
                    }}
                    className="max-md:border-0"
                >
                    <Typography
                        sx={{
                            fontSize: '12px',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            color: '#c4c5c9'
                        }}
                    >
                        {statistics[1].label}
                    </Typography>
                    <Typography sx={{ fontSize: { md: 16, sm: 15, xs: 14 }, fontWeight: '700' }}>{statistics[1].value}</Typography>
                </Grid>

                <Grid
                    item
                    sx={{
                        p: { lg: '0 0 0 20px', md: 1, sm: 1, xs: 1 },
                        borderLeft: '2px solid rgba(51, 39, 63, 1)',
                        width: { lg: 'calc(20% - 4px)', md: 'calc(20% - 4px)', sm: 'calc(33.3% - 36px)', xs: 'calc(50% - 16px)' },
                        m: { lg: 0, md: 0, sm: 1, xs: 1 },
                        background: { sm: '#120c18', xs: '#120c18', md: 'transparent', lg: 'transparent' },
                        textAlign: { md: 'left', sm: 'center', xs: 'center' }
                    }}
                    className="max-md:border-0"
                >
                    <Typography
                        sx={{
                            fontSize: '12px',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            color: '#c4c5c9'
                        }}
                    >
                        {statistics[2].label}
                    </Typography>
                    <Typography sx={{ fontSize: { md: 16, sm: 15, xs: 14 }, fontWeight: '700' }}>{statistics[2].value}</Typography>
                </Grid>

                <Grid
                    item
                    sx={{
                        p: { lg: '0 0 0 20px', md: 1, sm: 1, xs: 1 },
                        borderLeft: '2px solid rgba(51, 39, 63, 1)',
                        width: { lg: 'calc(20% - 4px)', md: 'calc(20% - 4px)', sm: 'calc(33.3% - 36px)', xs: 'calc(50% - 16px)' },
                        m: { lg: 0, md: 0, sm: 1, xs: 1 },
                        background: { sm: '#120c18', xs: '#120c18', md: 'transparent', lg: 'transparent' },
                        textAlign: { md: 'left', sm: 'center', xs: 'center' }
                    }}
                    className="max-md:border-0"
                >
                    <Typography
                        sx={{
                            fontSize: '12px',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            color: '#c4c5c9'
                        }}
                    >
                        {statistics[3].label}
                    </Typography>
                    <Typography sx={{ fontSize: { md: 16, sm: 15, xs: 14 }, fontWeight: '700' }}>{statistics[3].value}</Typography>
                </Grid>
                <Grid
                    item
                    sx={{
                        paddingLeft: { lg: '24px', md: '16px', sm: '8px', xs: '20px' },
                        p: { lg: '0 0 0 20px', md: 1, sm: 1, xs: 1 },
                        borderLeft: '2px solid rgba(51, 39, 63, 1)',
                        m: { lg: 0, md: 0, sm: 1, xs: 1 },
                        background: { sm: '#120c18', xs: '#120c18', md: 'transparent', lg: 'transparent' },
                        width: { md: 'calc(20% - 4px)', sm: 'calc(33.3% - 36px)', xs: 'calc(100% - 4px)' },
                        textAlign: { md: 'left', sm: 'center', xs: 'center' }
                    }}
                    className="max-md:border-0"
                >
                    <Typography sx={{ fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', color: '#c4c5c9' }}>
                        Price change (7D)
                    </Typography>
                    <Typography sx={{ fontSize: { md: 16, sm: 15, xs: 14 }, fontWeight: '700' }}>{percentageChipLabel}</Typography>
                </Grid>
            </Grid>
        </Box>
    );
}

export default TokenPriceStatistics;
