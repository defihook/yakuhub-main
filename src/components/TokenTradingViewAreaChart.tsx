import { useEffect, useState } from 'react';
import _ from 'lodash';
import { createChart, IChartApi, ISeriesApi, SingleValueData } from 'lightweight-charts';

import useTradingViewChartTheme from 'hooks/useTradingViewChartTheme';
import { formatAmount } from 'utils/utils';

interface TokenTradingViewAreaChartProps {
    chartId: string | undefined;
    chartData: Array<SingleValueData>;
    height?: number;
}

function TokenTradingViewChart({ chartData, chartId, height = 400 }: TokenTradingViewAreaChartProps) {
    const chartDivId = `${chartId}-trading-view-chart`;
    const [chartApi, setChartApi] = useState<IChartApi | undefined>();
    const [areaSeriesApi, setAreaSeriesApi] = useState<ISeriesApi<'Area'> | undefined>();
    const { theme, syncToTheme } = useTradingViewChartTheme('area');

    const priceFormatter = (price: number) => `$${formatAmount(price)}`;

    useEffect(() => {
        if (!_.isEmpty(chartData)) {
            const chart = createChart(chartDivId, {
                height,
                leftPriceScale: {
                    borderVisible: false,
                    visible: true
                },
                rightPriceScale: {
                    visible: false
                },
                timeScale: {
                    borderVisible: false
                }
            });
            chart.applyOptions({
                localization: {
                    priceFormatter
                }
            });
            const areaSeries = chart.addAreaSeries();
            areaSeries.setData(chartData);
            setChartApi(chart);
            setAreaSeriesApi(areaSeries);
        }
    }, [chartData, chartDivId]);

    useEffect(() => {
        if (chartApi && areaSeriesApi) {
            const chartDiv = document.getElementById(chartDivId);
            if (chartDiv && chartDiv?.childElementCount > 1) {
                chartDiv?.firstChild?.remove();
            }
            syncToTheme(chartApi, areaSeriesApi);
        }
    }, [theme, chartApi, areaSeriesApi, chartDivId]);

    return <div id={chartDivId} />;
}

export default TokenTradingViewChart;
