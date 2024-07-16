import { useTheme } from '@mui/material/styles';
// eslint-disable-next-line
import { IChartApi, ISeriesApi } from 'lightweight-charts';

// this is designed to handle future trading view chart types as the series styling is different based on type
type ChartType = 'area';

const useTradingViewChartTheme = (chartType: ChartType, options?: any) => {
    const theme = useTheme();

    let seriesStyle;
    if (chartType === 'area') {
        seriesStyle = {
            topColor: `${theme.palette.secondary.main}8f`,
            bottomColor: `${theme.palette.secondary.main}0A`,
            lineColor: theme.palette.secondary.main
        };
    }

    const darkTheme = {
        chart: {
            ...options,
            layout: {
                backgroundColor: 'transparent',
                textColor: '#D9D9D9'
            },
            watermark: {
                color: 'rgba(0, 0, 0, 0)'
            },
            grid: {
                vertLines: {
                    color: '#2B2B43'
                },
                horzLines: {
                    color: '#363C4E'
                }
            }
        },
        series: {
            ...seriesStyle
        }
    };

    const lightTheme = {
        chart: {
            ...options,
            layout: {
                backgroundColor: 'transparent',
                lineColor: '#2B2B43',
                textColor: '#191919'
            },
            watermark: {
                color: 'rgba(0, 0, 0, 0)'
            },
            grid: {
                vertLines: {
                    visible: false
                },
                horzLines: {
                    color: '#f0f3fa'
                }
            }
        },
        series: {
            ...seriesStyle
        }
    };

    const themesData = {
        dark: darkTheme,
        light: lightTheme
    };

    const tradingViewTheme = themesData[theme.palette.mode];

    const syncToTheme = (chartApi: IChartApi, seriesApi: ISeriesApi<'Area'>) => {
        if (chartApi && seriesApi) {
            chartApi.applyOptions(tradingViewTheme.chart);
            seriesApi.applyOptions(tradingViewTheme.series);
        }
    };

    return { theme: tradingViewTheme, syncToTheme };
};

export default useTradingViewChartTheme;
