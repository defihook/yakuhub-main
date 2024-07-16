import { useEffect, useRef, useState } from 'react';
import _, { cloneDeep, find, maxBy, minBy, round } from 'lodash';
import {
    BusinessDay,
    createChart,
    CrosshairMode,
    IChartApi,
    isBusinessDay,
    ISeriesApi,
    MouseEventParams,
    SingleValueData
} from 'lightweight-charts';

import useTradingViewChartTheme from 'hooks/useTradingViewChartTheme';
import { formatAmount } from 'utils/utils';

interface AreaChartProps {
    chartId: string | undefined;
    chartData: Array<SingleValueData>;
    height?: number;
    pricePrefix?: string;
    priceSuffix?: string;
    priceMargin?: number;
    showTooltip?: boolean;
}

function AreaChart({
    chartData,
    chartId,
    height = 400,
    pricePrefix = '$',
    priceSuffix = '',
    priceMargin = 10,
    showTooltip = true
}: AreaChartProps) {
    const chartDivId = `${chartId}-trading-view-chart`;
    const [areaSeriesApi, setAreaSeriesApi] = useState<ISeriesApi<'Area'> | undefined>();

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chart = useRef<IChartApi>();
    const resizeObserver = useRef<ResizeObserver>();
    const priceFormatter = (price: number) => `${pricePrefix}${formatAmount(price)}${priceSuffix}`;
    const businessDayToString = (businessDay: BusinessDay) => `${businessDay.year}-${businessDay.month}-${businessDay.day}`;
    const options = {
        localization: {
            priceFormatter
        },
        crosshair: {
            mode: CrosshairMode.Magnet
        }
    };
    const { theme, syncToTheme } = useTradingViewChartTheme('area', options);

    const setTooltip = () => {
        const toolTipWidth = 160;
        const toolTipHeight = 60;
        const toolTipMargin = 15;

        const toolTip = document.createElement('div');
        toolTip.className = 'floating-tooltip-2';
        const container = document.getElementById(chartDivId);
        container?.appendChild(toolTip);
        const width = container?.clientWidth || 0;

        // update tooltip
        chart.current?.subscribeCrosshairMove((param: MouseEventParams) => {
            const x = param?.point?.x ?? 0;
            const y = param?.point?.y ?? 0;
            if (!param?.time || x < 0 || x > width || y < 0 || y > height) {
                toolTip.style.display = 'none';
                return;
            }

            const dateStr = isBusinessDay(param.time) ? businessDayToString(param.time) : new Date(param.time * 1000).toLocaleDateString();

            toolTip.style.display = 'flex';
            const price = find(chartData, ({ time }: any) => time === param?.time);
            toolTip.innerHTML = `${'<div style="font-size: 16px;">'}${priceFormatter(
                round(price?.value ?? 0, 2)
            )}</div><div>${dateStr}</div>`;

            let left = x + toolTipMargin;
            if (left > width - toolTipWidth) {
                left = x - toolTipMargin - toolTipWidth;
            }

            let top = y + toolTipMargin;
            if (top < height - toolTipHeight) {
                top = y + toolTipHeight + toolTipMargin;
            }

            toolTip.style.left = `${left}px`;
            toolTip.style.top = `${top}px`;
        });
    };
    useEffect(() => {
        if (!_.isEmpty(chartData) && !chart.current) {
            chart.current = createChart(chartContainerRef.current || chartDivId, {
                height,
                width: chartContainerRef.current?.clientWidth ?? 0,
                rightPriceScale: {
                    borderVisible: false
                },
                timeScale: {
                    borderVisible: false
                }
            });
            const areaSeries = chart.current.addAreaSeries({
                crosshairMarkerVisible: true,
                autoscaleInfoProvider: () => {
                    const minValue = Math.max((minBy(chartData, 'value')?.value ?? 0) - priceMargin, 0);
                    const maxValue = (maxBy(chartData, 'value')?.value ?? 0) + priceMargin;
                    return {
                        priceRange: {
                            minValue,
                            maxValue
                        }
                    };
                }
            });
            areaSeries.setData(chartData);
            chart.current.applyOptions(options);
            chart.current.timeScale().fitContent();
            if (showTooltip) {
                setTooltip();
            }
            setAreaSeriesApi(areaSeries);
            syncToTheme(chart.current, areaSeries);
        } else if (!_.isEmpty(chartData)) {
            const newAreaSeriesApi = cloneDeep(areaSeriesApi);
            newAreaSeriesApi?.setData(chartData);
            setAreaSeriesApi(newAreaSeriesApi);
            chart.current?.timeScale().fitContent();
            syncToTheme(chart.current!, newAreaSeriesApi!);
        }
    }, [chartData, chartDivId, chart.current]);

    useEffect(() => {
        if (chart.current && areaSeriesApi) {
            syncToTheme(chart.current, areaSeriesApi);
        }
    }, [theme]);

    // Resize chart on container resizes.
    useEffect(() => {
        resizeObserver.current = new ResizeObserver((entries) => {
            const { width, height: contentHeight } = entries[0].contentRect;
            chart.current?.applyOptions({ width, height: contentHeight });
            setTimeout(() => {
                chart.current?.timeScale().fitContent();
            }, 0);
        });

        resizeObserver.current.observe(chartContainerRef.current!);

        return () => resizeObserver.current?.disconnect();
    }, []);
    return <div id={chartDivId} ref={chartContainerRef} />;
}
export default AreaChart;
