<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import useChartData from '@/composables/useChartData'
import Tooltip from '@/components/Tooltip.vue'
import useBlockNumber from '@/composables/useBlockNumber'
import { DateTime } from 'luxon'
import { format } from '@/lib/utils/format'

const d3 = require('d3')
const chart = ref(null)
const xAxis = ref(null)
const tooltip = ref(null)
defineExpose({chart, xAxis, tooltip})

const props = defineProps({
    stream: null
})

const { tvlHistory, historyLoaded, loadHistory, priceHistory } = useChartData()
const { blockNumber } = useBlockNumber()

onMounted(async () => {
    reloadChart()
})

const currentPrice = computed(() => {
    return props.stream.depositTokenUnstreamed / props.stream.rewardTokenRemaining
})
const averagePrice = computed(() => {
    return (props.stream.tokenAmounts.depositTokenAmount - props.stream.depositTokenUnstreamed)
     / (props.stream.tokenAmounts.rewardTokenAmount - props.stream.rewardTokenRemaining)
})
const rewardPerToken = computed(() => {
    return 1 / currentPrice.value
})
const averageRewardPerToken = computed(() => {
    return 1 / averagePrice.value
})
const tvl = computed(() => {
    return format(props.stream.tokenAmounts.depositTokenAmount)
})
const rewardPerTokenHistory = computed(() => {
    return priceHistory.value.map(d => ({
        date: d.date,
        value: d.value == 0 ? undefined : 1 / d.value
    }))
    // TODO: Insert a datapoint just before each undefined with the date of n and value of n-1
})

watch(blockNumber, reloadChart)

async function reloadChart() {
    await loadHistory(props.stream)
    drawChart(
        chart.value, 
        xAxis.value, 
        tooltip.value.$el, 
        props.stream.isSale ? priceHistory.value : rewardPerTokenHistory.value)
}

function drawChart(el, axis, tooltip, data) {

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = el.clientWidth - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // remove any old svg
    d3.select(el).selectAll("svg").remove()
    d3.select(axis).selectAll("svg").remove()

    // append the svg object to the body of the page
    var svg = d3.select(el)
    .append("svg")
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")  

    // Set up x scale
    var streamStart = props.stream.streamParams.startTime
    var streamEnd = props.stream.streamParams.endStream
    var timeElapsed = DateTime.now().toSeconds() - streamStart
    var scaleEnd = Math.min(streamStart + timeElapsed * 1.5, streamEnd)
    var dataStart = d3.extent(data.map(d => d.date))[0]
    var xDomain = [dataStart, DateTime.fromSeconds(streamEnd).toJSDate()]
    var x = d3.scaleTime()
        .domain(xDomain)
        .range([ 0, width ]);


    // Set up y scale
    var yDomain = d3.extent(data.map(d => d.value))
    yDomain[0] *= 0.95
    yDomain[1] *= 1.05

    var y = d3.scaleLinear()
        .domain(yDomain)
        .range([ height, 0 ]);

    // Add the line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#43E0E4")
        .attr("stroke-width", 2)
        .attr("d", d3.line().curve(d3.curveStepAfter)
                .y(d => y(d.value))
                .defined(d => y(d.value))
                .x(d => x(d.date))
                )

    // Add the axes
    d3.select(axis).append("svg")
        .attr("width", "100%")
        .attr("height", "40")
        .attr('class', 'axis')
        .call(d3.axisBottom(x).ticks(4))

    svg.append("g")
        .attr('class', 'axis axis-right')
        .attr('transform', `translate(${width-margin.left-margin.right},0)`)
        .call(d3.axisLeft(y).ticks(3).tickFormat(format))

    // Price projection line
    var lastX = x(data[data.length-1].date)
    var lastY = y(data[data.length-1].value)
    svg
        .append('g')
        .append('path')
        .style("stroke", "#43E0E4")
        .style("stroke-width", "0.5px")
        .style("opacity", 0.8)
        .style("pointer-events", "none")
        .attr("d", function() {
            var d = "M" + lastX + "," + lastY;
                d += " " + width + "," + lastY;
                return d;
        })
        
    // Stream start line
    var streamStartX = x(DateTime.fromSeconds(streamStart).toJSDate())
    svg
        .append('g')
        .append('path')
        .style("stroke", "#43E0E4")
        .style("stroke-width", "0.5px")
        .style("stroke-dasharray", "5,5")
        .style("opacity", 0.8)
        .style("pointer-events", "none")
        .attr("d", function() {
            var d = "M" + streamStartX + "," + 0;
                d += " " + streamStartX + "," + height;
                return d;
        })
    svg
        .append('g')
        .attr('class','axis')
        .append('text')
        .attr('x', streamStartX+5)
        .attr('y', 10)
        .style('fill', "#43E0E4")
        .style('opacity', 0.5)
        .text('START')




    // Mouseover / tooltip
    svg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);
    
    var bisect = d3.bisector(d => d.date).right;
    var tip = d3.select(tooltip);

    var focus = svg
        .append('g')
        .append('path')
        .style("stroke", "#fff")
        .style("stroke-width", "0.5px")
        .style("stroke-dasharray", "5,5")
        .style("opacity", 0)
        .style("pointer-events", "none")

    var dot = svg
        .append('g')
        .append('circle')
        .attr('fill', '#43E0E4')
        .attr('r','4')
        .style('opacity', 0)
        .style("pointer-events", "none")

    function mouseover() {
        tip.transition().duration(100).style("opacity", 1);
        focus.transition().duration(100).style("opacity", 1);
        dot.transition().duration(100).style("opacity", 1);
    }

    function mouseout() {
        tip.transition().duration(100).style("opacity", 0);
        focus.transition().duration(100).style("opacity", 0);
        dot.transition().duration(100).style("opacity", 0);
    }

    function mousemove(event) {
        var pointerX = d3.pointer(event)[0]
        var x0 = x.invert(pointerX);
        var i = Math.max(0, bisect(data, x0)-1);
        var value = data[i].value;
        var date = data[i].date;

        focus
            .attr("d", function () {
                var d = "M" + pointerX + "," + 0;
                d += " " + pointerX + "," + height;
                // d += "M" + 0 + "," + y(value);
                // d += " " + width + "," + y(value);
                return d;
            })

        var dotX = pointerX //i == data.length-1 ? pointerX : x(date)
        var dotY = y(value)
        dot
            .attr('cx', dotX)
            .attr('cy', dotY)

        tip.style("left", event.pageX + "px").style("top", event.pageY + "px");
        tip
            .selectAll('div')
            .html(`${d3.timeFormat("%b-%d %H:%M")(x0).toUpperCase()}<br/>${d3.format(",.2f")(value)} ${props.stream.depositToken.symbol}`)
            //.html(`PRICE<br/>${d3.format(",.2f")(value)} ${props.stream.depositToken.symbol}`)
            .attr('fill', '#ffffff')
    }
}
</script>

<template>
    <div>
        <div class="roundedBox flex flex-col">
            <div class="p-4 flex flex-row justify-between">
                <div v-if="stream.isSale">
                    <div class="statLabel">Current Price</div>
                    <div class="statValue">{{format(currentPrice)}} {{stream.depositToken.symbol}}</div>
                </div>
                <div v-else>
                    <div class="statLabel">Reward per {{stream.depositToken.symbol}}</div>
                    <div class="statValue">{{currentPrice == 0 ? '--' : format(rewardPerToken)}} {{stream.rewardToken.symbol}}</div>
                </div>
                <div v-if="stream.isSale">
                    <div class="statLabel">Average Price</div>
                    <div class="statValue">{{format(averagePrice)}} {{stream.depositToken.symbol}}</div>
                </div>
                <div v-else>
                    <div class="statLabel">Average Reward per {{stream.depositToken.symbol}}</div>
                    <div class="statValue">{{format(averageRewardPerToken)}} {{stream.rewardToken.symbol}}</div>
                </div>
                <div>
                    <div class="statLabel">TVL</div>
                    <div class="statValue">{{tvl}} {{stream.depositToken.symbol}}</div>
                </div>
            </div>
            <div>
            <div ref="chart" style="cursor: crosshair"></div>
                <Tooltip ref="tooltip"/>
            </div>
        </div>
        <div ref="xAxis" class="mt-2 overflow-visible"></div>
    </div>
</template>

<style scoped>
:deep(div) .axis text {
    font-family: VCR;
    font-size: 12px;
    fill: #ffffff80;
}

:deep(div) .axis path, 
:deep(div) .axis-right line {
    stroke: none;
}

:deep(div) .axis {
    overflow: visible;
}

:deep(div) svg {
    overflow: visible
}

</style>