/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { queries } from '../../../graphql/graphql';
import useAuthQuery from 'hooks/useAuthQuery';
import moment from 'moment';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { get, isEmpty, map } from 'lodash';
import { Box, Grid, IconButton, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import MainCard from 'components/MainCard';
import { RefreshOutlined } from '@mui/icons-material';

const DaysButtons = ({ days }: any) => [
    ...map(days, (day) => (
        <ToggleButton value={day} sx={{ px: 2 }}>
            {day}
        </ToggleButton>
    ))
];
const MPAnalysticsView = ({ project_id, refresh }: any) => {
    const datebacks: Record<string, number> = {
        '1D': -1,
        '7D': -7,
        '30D': -30,
        'All Time': -180
    };
    const pageSize: Record<string, number> = {
        '1D': 24,
        '7D': 7,
        '30D': 30,
        'All Time': 180
    };
    const theme = useTheme();
    const [chartData, setChartData] = useState<any>({});
    const [chart2Data, setChart2Data] = useState<any>({});
    const [chart3Data, setChart3Data] = useState<any>({});
    const [chart1SelectedDay, setChart1SelectedDay] = useState('7D');
    const [chart2SelectedDay, setChart2SelectedDay] = useState('7D');
    const [chart3SelectedDay, setChart3SelectedDay] = useState('7D');
    const condition = {
        projects: [project_id],
        startTimestamp: moment().add(-7, 'd').unix(),
        endTimestamp: moment().unix(),
        timeGranularity: 'PER_DAY',
        paginationInfo: {
            page_number: 1,
            page_size: 7
        }
    };
    const { refetch } = useAuthQuery(queries.GET_COLLECTION_HISTORY, {
        variables: {
            condition
        }
    });

    const { refetch: refetchMpAct } = useAuthQuery(queries.GET_MP_ACTIVITIES, {
        variables: {
            condition: {
                projects: [{ project_id }],
                actionTypes: ['TRANSACTION']
            },
            paginationInfo: {
                page_number: 1,
                page_size: 50
            }
        }
    });

    const prepareChart1 = (newData: any[]) => {
        setChartData({
            series: [
                {
                    name: 'Floor Price',
                    type: 'line',
                    data: map(newData, ({ floor_price }) => floor_price)
                },
                {
                    name: 'Volume',
                    type: 'line',
                    data: map(newData, ({ volume }) => volume)
                },
                {
                    name: 'Listing',
                    type: 'line',
                    data: map(newData, ({ num_of_token_listed }) => num_of_token_listed)
                }
            ],
            options: {
                chart: {
                    background: 'transparent',
                    zoom: {
                        enabled: false
                    },
                    toolbar: {
                        show: false
                    },
                    height: 350,
                    type: 'line',
                    stacked: false
                },
                grid: {
                    borderColor: theme.palette.mode === 'dark' ? '#333333' : '#cccccc'
                },
                stroke: {
                    width: [2, 2, 2],
                    curve: 'smooth'
                },
                plotOptions: {
                    bar: {
                        columnWidth: '50%'
                    }
                },
                fill: {
                    opacity: [1, 1, 1],
                    gradient: {
                        inverseColors: false,
                        shade: 'light',
                        type: 'vertical',
                        opacityFrom: 0.85,
                        opacityTo: 0.55,
                        stops: [0, 100, 100, 100]
                    }
                },
                colors: ['#17c13e', '#f38aff', '#f0ad4e'],
                labels: map(newData, ({ timestamp }) => moment.unix(timestamp).toISOString()) || [],
                markers: {
                    size: 0
                },
                xaxis: {
                    type: 'datetime'
                },
                yaxis: [
                    {
                        seriesName: 'Floor Price',
                        show: false
                    },
                    {
                        seriesName: 'Volume',
                        title: {
                            text: 'Volume (SOL)'
                        },
                        labels: {
                            formatter: (value: number) => `${value.toFixed(2)}`
                        },
                        min: 0
                    },
                    {
                        seriesName: 'Listing',
                        opposite: true,
                        title: {
                            text: 'Listing'
                        },
                        labels: {
                            formatter: (value: number) => `${value.toLocaleString()}`
                        }
                    }
                ],
                theme: { mode: theme.palette.mode },
                tooltip: {
                    shared: true,
                    intersect: false,
                    theme: theme.palette.mode,
                    y: {
                        formatter: (y: number, { series, seriesIndex, dataPointIndex, w }: any) => {
                            if (typeof y !== 'undefined') {
                                return `${y.toLocaleString()} ${seriesIndex < 2 ? 'SOL' : ''}`;
                            }
                            return y;
                        }
                    }
                }
            }
        });
    };
    const prepareChart2 = (newData: any[]) => {
        setChart2Data({
            series: [
                {
                    name: 'Discord Members',
                    type: 'line',
                    data: map(newData, ({ discord_members }) => discord_members)
                },
                {
                    name: 'Twitter Followers',
                    type: 'line',
                    data: map(newData, ({ twitter_followers }) => twitter_followers)
                },
                {
                    name: 'Unique Holders',
                    type: 'line',
                    data: map(newData, ({ num_of_token_holders }) => num_of_token_holders)
                }
            ],
            options: {
                chart: {
                    background: 'transparent',
                    zoom: {
                        enabled: false
                    },
                    toolbar: {
                        show: false
                    },
                    height: 350,
                    type: 'line',
                    stacked: false
                },
                grid: {
                    borderColor: theme.palette.mode === 'dark' ? '#333333' : '#cccccc'
                },
                stroke: {
                    width: [2, 2, 2],
                    curve: 'smooth'
                },
                plotOptions: {
                    bar: {
                        columnWidth: '50%'
                    }
                },
                colors: ['#17c13e', '#f38aff', '#f0ad4e'],
                fill: {
                    opacity: [1, 1, 1],
                    gradient: {
                        inverseColors: false,
                        shade: 'light',
                        type: 'vertical',
                        opacityFrom: 0.85,
                        opacityTo: 0.55,
                        stops: [0, 100, 100, 100]
                    }
                },
                labels: map(newData, ({ timestamp }) => moment.unix(timestamp).toISOString()) || [],
                markers: {
                    size: 0
                },
                theme: { mode: theme.palette.mode },
                xaxis: {
                    type: 'datetime'
                },
                yaxis: [
                    {
                        seriesName: 'Discord Members',
                        show: false
                    },
                    {
                        seriesName: 'Twitter Followers',
                        title: {
                            text: 'Followers'
                        }
                    },
                    {
                        seriesName: 'Unique Holders',
                        opposite: true,
                        title: {
                            text: 'Unique Holders'
                        }
                    }
                ],
                tooltip: {
                    shared: true,
                    intersect: false,
                    theme: theme.palette.mode,
                    y: {
                        formatter: (y: number) => {
                            if (typeof y !== 'undefined') {
                                return `${y.toLocaleString()}`;
                            }
                            return y;
                        }
                    }
                }
            }
        });
    };
    const prepareChart3 = (newData: any[]) => {
        setChart3Data({
            series: [
                {
                    name: 'Sold',
                    data: map(newData, ({ market_place_state }) => [market_place_state.block_timestamp, market_place_state.price])
                }
            ],
            options: {
                chart: {
                    background: 'transparent',
                    zoom: {
                        enabled: false
                    },
                    toolbar: {
                        show: false
                    },
                    height: 350,
                    type: 'scatter'
                },
                grid: {
                    borderColor: theme.palette.mode === 'dark' ? '#333333' : '#cccccc'
                },
                dataLabels: {
                    enabled: false
                },
                xaxis: {
                    type: 'datetime',

                    labels: {
                        formatter: (value: number) => moment.unix(value).format('MMM DD')
                    }
                },
                yaxis: {
                    seriesName: 'Price',
                    title: {
                        text: 'SOL'
                    },
                    labels: {
                        formatter: (value: number) => `${value.toFixed(2)}`
                    },
                    min: 0
                },
                colors: ['#17c13e'],
                theme: { mode: theme.palette.mode },
                tooltip: {
                    theme: theme.palette.mode,
                    y: {
                        formatter: (y: number) => {
                            if (typeof y !== 'undefined') {
                                return `${y.toLocaleString()} SOL`;
                            }
                            return y;
                        }
                    }
                }
            }
        });
    };

    const updateChartTheme = () => {
        setChartData({
            ...chartData,
            options: {
                ...get(chartData, 'options'),
                theme: { mode: theme.palette.mode },
                tooltip: {
                    ...get(chartData, 'options.tooltip'),
                    theme: theme.palette.mode
                }
            }
        });
        setChart2Data({
            ...chart2Data,
            options: {
                ...get(chart2Data, 'options'),
                theme: { mode: theme.palette.mode },
                tooltip: {
                    ...get(chart2Data, 'options.tooltip'),
                    theme: theme.palette.mode
                }
            }
        });
        setChart3Data({
            ...chart3Data,
            options: {
                ...get(chart3Data, 'options'),
                theme: { mode: theme.palette.mode },
                tooltip: {
                    ...get(chart3Data, 'options.tooltip'),
                    theme: theme.palette.mode
                }
            }
        });
    };

    const updateChart = async (params: any, type: string) => {
        if (type !== 'chart3') {
            const { data: history } = await refetch({
                condition: {
                    ...condition,
                    ...params
                }
            });
            const newData = history?.getProjectStatHistory?.project_stat_hist_entries || [];
            if (isEmpty(newData)) {
                return;
            }
            switch (type) {
                case 'all':
                    prepareChart1(newData);
                    prepareChart2(newData);
                    break;
                case 'chart1':
                    prepareChart1(newData);
                    return;
                case 'chart2':
                    prepareChart2(newData);
                    return;
            }
        }
        const { data: sales } = await refetchMpAct();
        const newSales = sales?.getMarketplaceActivities?.market_place_snapshots;
        console.log(newSales);
        prepareChart3(newSales);
    };

    useEffect(() => {
        if (!isEmpty(chartData) && !isEmpty(chart2Data) && !isEmpty(chart3Data)) {
            updateChartTheme();
        }
    }, [theme.palette.mode]);

    useEffect(() => {
        setChartData({});
        setChart2Data({});
        setChart3Data({});
        updateChart({}, 'all');
    }, [project_id]);

    useEffect(() => {
        updateChart({}, 'all');
    }, [refresh]);

    useEffect(() => {
        updateChart({}, 'all');
    }, []);
    return (
        <>
            <Box>
                <Typography component="h4" fontSize={20} fontWeight={700}>
                    Market Overview
                </Typography>
                <MainCard sx={{ border: 'none', mt: 2 }} divider={false}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            '& > *': {
                                m: 1
                            }
                        }}
                    >
                        <ToggleButtonGroup
                            value={chart1SelectedDay}
                            size="small"
                            exclusive
                            color="info"
                            sx={{
                                '.MuiToggleButton-root': {
                                    borderRadius: 30,
                                    border: 'none',
                                    backgroundColor:
                                        theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light
                                }
                            }}
                            onChange={(e: any, day: string) => {
                                if (day !== null) {
                                    setChart1SelectedDay(day);
                                    updateChart(
                                        {
                                            startTimestamp: moment().add(datebacks[day], 'd').unix(),
                                            timeGranularity: day !== '1D' ? 'PER_DAY' : 'PER_HOUR',
                                            paginationInfo: {
                                                page_number: 1,
                                                page_size: pageSize[day]
                                            }
                                        },
                                        'chart1'
                                    );
                                }
                            }}
                        >
                            {DaysButtons({
                                days: ['1D', '7D', '30D', 'All Time']
                            })}
                        </ToggleButtonGroup>
                    </Box>
                    <div id="chart1">
                        {!isEmpty(chartData) && (
                            <ReactApexChart options={chartData.options} series={chartData.series} type="line" height={350} />
                        )}
                    </div>
                </MainCard>
            </Box>
            <Grid container columnSpacing={2}>
                <Grid item xs={12} lg={6}>
                    <Box sx={{ mt: 4 }}>
                        <Typography component="h4" fontSize={20} fontWeight={700}>
                            Community
                        </Typography>
                        <MainCard sx={{ border: 'none', mt: 2 }} divider={false}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    '& > *': {
                                        m: 1
                                    }
                                }}
                            >
                                <ToggleButtonGroup
                                    value={chart2SelectedDay}
                                    size="small"
                                    exclusive
                                    color="info"
                                    sx={{
                                        '.MuiToggleButton-root': {
                                            borderRadius: 30,
                                            border: 'none',
                                            backgroundColor:
                                                theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light
                                        }
                                    }}
                                    onChange={(e: any, day: string) => {
                                        if (day !== null) {
                                            setChart2SelectedDay(day);
                                            updateChart(
                                                {
                                                    startTimestamp: moment().add(datebacks[day], 'd').unix(),
                                                    timeGranularity: day !== '1D' ? 'PER_DAY' : 'PER_HOUR',
                                                    paginationInfo: {
                                                        page_number: 1,
                                                        page_size: pageSize[day]
                                                    }
                                                },
                                                'chart2'
                                            );
                                        }
                                    }}
                                >
                                    {DaysButtons({
                                        days: ['7D', '30D', 'All Time']
                                    })}
                                </ToggleButtonGroup>
                            </Box>
                            <div id="chart2">
                                {!isEmpty(chart2Data) && (
                                    <ReactApexChart options={chart2Data.options} series={chart2Data.series} type="line" height={350} />
                                )}
                            </div>
                        </MainCard>
                    </Box>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Box sx={{ mt: 4 }}>
                        <Typography component="h4" fontSize={20} fontWeight={700}>
                            Trade
                        </Typography>
                        <MainCard sx={{ border: 'none', mt: 2 }} divider={false}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    '& > *': {
                                        m: 1
                                    }
                                }}
                            >
                                <ToggleButtonGroup
                                    value={chart3SelectedDay}
                                    size="small"
                                    exclusive
                                    color="info"
                                    sx={{
                                        '.MuiToggleButton-root': {
                                            borderRadius: 30,
                                            border: 'none',
                                            backgroundColor:
                                                theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light
                                        }
                                    }}
                                    onChange={(e: any, day: string) => {
                                        if (day !== null) {
                                            setChart3SelectedDay(day);
                                            updateChart({}, 'chart3');
                                        }
                                    }}
                                >
                                    {DaysButtons({
                                        days: ['All Time']
                                    })}
                                </ToggleButtonGroup>
                                <IconButton onClick={() => updateChart({}, 'chart3')}>
                                    <RefreshOutlined />
                                </IconButton>
                            </Box>
                            <div id="chart3">
                                {!isEmpty(chart3Data) && (
                                    <ReactApexChart options={chart3Data.options} series={chart3Data.series} type="scatter" height={350} />
                                )}
                            </div>
                        </MainCard>
                    </Box>
                </Grid>
            </Grid>
        </>
    );
};
export default MPAnalysticsView;
