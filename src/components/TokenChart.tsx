/* eslint-disable react-hooks/exhaustive-deps */
import { queries } from '../graphql/graphql';
import { useEffect, useState } from 'react';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { useTheme } from '@mui/material';
import { isEmpty } from 'lodash';
import ReactApexChart from 'react-apexcharts';

const TokenChart = ({ coinId }: { coinId: String }) => {
    const theme = useTheme();
    const [chartData, setChartData] = useState<any>({});
    const [getTokenChart] = useAuthLazyQuery(queries.GET_COINS_MARKET_CHART);

    const prepareChart = (newData: any) => {
        setChartData({
            series: [
                {
                    name: 'Price',
                    type: 'area',
                    data: newData.prices
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
                    height: 60,
                    type: 'area',
                    stacked: false,
                    sparkline: {
                        enabled: true
                    }
                },
                stroke: {
                    width: [2],
                    curve: 'smooth'
                },
                plotOptions: {
                    bar: {
                        columnWidth: '50%'
                    }
                },
                colors: ['#f38aff'],
                fill: {
                    type: 'gradient',
                    gradient: {
                        shade: 'light',
                        type: 'vertical',
                        shadeIntensity: 1,
                        inverseColors: false,
                        opacityFrom: 0.55,
                        opacityTo: 0.05,
                        stops: [0, 80, 100, 100]
                    }
                },
                grid: {
                    show: false
                },
                legend: {
                    show: false
                },
                markers: {
                    size: 0
                },
                xaxis: {
                    type: 'datetime',
                    labels: {
                        show: false
                    },
                    show: false
                },
                yaxis: {
                    show: false,
                    seriesName: 'Price',
                    labels: {
                        show: false,
                        formatter: (value: number) => `${value.toFixed(2)}`
                    }
                },
                theme: { mode: theme.palette.mode },
                tooltip: {
                    intersect: false,
                    theme: theme.palette.mode,
                    y: {
                        formatter: (y: number, { series, seriesIndex, dataPointIndex, w }: any) => {
                            if (typeof y !== 'undefined') {
                                return `${y.toLocaleString()} ${seriesIndex === 0 ? 'USD' : ''}`;
                            }
                            return y;
                        }
                    }
                }
            }
        });
    };
    const updateView = async () => {
        setChartData({});
        const { data } = await getTokenChart({
            variables: {
                coinId,
                params: {
                    vs_currency: 'usd',
                    days: '7'
                }
            }
        });
        if (data?.fetchMarketChart?.data?.prices?.length > 1) {
            prepareChart(data?.fetchMarketChart?.data);
        }
    };

    useEffect(() => {
        updateView();
    }, [coinId]);
    return (
        <div id="chart1">
            {!isEmpty(chartData) && <ReactApexChart options={chartData.options} series={chartData.series} type="area" height={60} />}
        </div>
    );
};

export default TokenChart;
