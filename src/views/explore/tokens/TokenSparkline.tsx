/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import ReactApexChart from 'react-apexcharts';

const TokenSparkline = ({ sparkline, symbol }: { sparkline: Array<Number>; symbol: String }) => {
    const theme = useTheme();
    const [chartData, setChartData] = useState<any>({});
    const sparklineData = _.map(sparkline, (s, index) => ({ x: index, y: s }));

    const prepareChart = () => {
        setChartData({
            series: [
                {
                    name: 'Price',
                    type: 'area',
                    data: sparklineData
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
                fill: {
                    opacity: [0.5],
                    gradient: {
                        inverseColors: false,
                        shade: 'light',
                        type: 'vertical',
                        opacityFrom: 0.85,
                        opacityTo: 0.55,
                        stops: [0, 100, 100, 100]
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
                    enabled: false
                    // intersect: false,
                    // theme: theme.palette.mode,
                    // x: { formatter: () => null },
                    // y: {
                    //     formatter: (y: number, { series, seriesIndex, dataPointIndex, w }: any) => {
                    //         if (typeof y !== 'undefined') {
                    //             return `${y.toLocaleString()} ${seriesIndex === 0 ? 'USD' : ''}`;
                    //         }
                    //         return y;
                    //     }
                    // }
                }
            }
        });
    };

    useEffect(() => {
        prepareChart();
    }, []);

    return (
        <div id={`chart-${symbol}`}>
            {!_.isEmpty(chartData) && <ReactApexChart options={chartData.options} series={chartData.series} type="area" height={60} />}
        </div>
    );
};

export default TokenSparkline;
