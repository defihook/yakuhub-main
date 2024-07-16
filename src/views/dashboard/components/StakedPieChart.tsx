import { Box, Skeleton, useTheme } from '@mui/material';
import { isEmpty, round } from 'lodash';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const StakedPieChart = ({ total, totalStaked }: any) => {
    const theme = useTheme();
    const [chartData, setChartData] = useState<any>({});
    const updateChart = () => {
        setChartData({
            series: [totalStaked, total - totalStaked],
            options: {
                chart: {
                    zoom: {
                        enabled: false
                    },
                    toolbar: {
                        show: false
                    },
                    width: '100%',
                    type: 'donut',
                    background: 'transparent',
                    sparkline: {
                        enabled: true
                    }
                },
                labels: ['Staked', 'Non-staked'],
                colors: ['#c691c1', '#120c18'],
                theme: { mode: theme.palette.mode },
                legend: {
                    show: false
                },
                stroke: {
                    show: false
                },
                plotOptions: {
                    pie: {
                        donut: {
                            labels: {
                                show: true,
                                value: {
                                    fontSize: '14px'
                                },
                                total: {
                                    show: true,
                                    label: `Total: ${(total || 0).toLocaleString()}`,
                                    fontSize: '14px',
                                    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                                    offsetY: 0,
                                    showAlways: true,
                                    formatter: () => `Stake rate: ${round(totalStaked / total, 2) * 100}%`
                                }
                            }
                        }
                    }
                }
            }
        });
    };

    useEffect(() => {
        setChartData({});
        if (totalStaked) {
            updateChart();
        }
    }, [totalStaked, total, theme]);

    return (
        <>
            {totalStaked > 0 && total > 0 && !isEmpty(chartData) ? (
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', px: 1 }}>
                    <ReactApexChart options={chartData.options} series={chartData.series} type="donut" />
                </Box>
            ) : (
                <Box sx={{ width: '100%', height: 240, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                    <Skeleton variant="circular" height="100%" sx={{ aspectRatio: '1 / 1' }} />
                </Box>
            )}
        </>
    );
};

export default StakedPieChart;
