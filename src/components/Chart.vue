<script setup>
import { onMounted, ref, watch } from 'vue'
import useChartData from '@/composables/useChartData'
import Tooltip from '@/components/Tooltip.vue'
import useBlockNumber from '@/composables/useBlockNumber'
import { DateTime } from 'luxon'

const d3 = require('d3')
const chart = ref(null)
const tooltip = ref(null)
defineExpose({chart, tooltip})

const props = defineProps({
    stream: null
})

const { tvlHistory, historyLoaded, loadHistory, priceHistory } = useChartData()
const { blockNumber } = useBlockNumber()

onMounted(async () => {
    reloadChart()
})

watch(blockNumber, reloadChart)

async function reloadChart() {
    await loadHistory(props.stream)
    drawChart(chart.value, tooltip.value.$el, priceHistory.value)
}

function drawChart(el, tooltip, data) {

    var margin = {top: 10, right: 0, bottom: 0, left: 0},
        width = el.clientWidth - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // remove any old svg
    d3.select(el).selectAll("svg").remove()

    // append the svg object to the body of the page
    var svg = d3.select(el)
    .append("svg")
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")  

    // Add X axis
    var streamStart = props.stream.streamParams.startTime
    var streamEnd = props.stream.streamParams.startTime + props.stream.streamParams.streamDuration
    var timeElapsed = DateTime.now().toSeconds() - streamStart
    var scaleEnd = Math.min(streamStart + timeElapsed * 1.5, streamEnd)
    var domain = [DateTime.fromSeconds(streamStart).toJSDate(), DateTime.fromSeconds(scaleEnd).toJSDate()]
    var x = d3.scaleTime()
//        .domain(d3.extent(data.map(d => d.date)))
        .domain(domain)
        .range([ 0, width ]);


    // Add Y axis
    var y = d3.scaleLinear()
        .domain([ 0, d3.max(data, d => +d.value) * 1.05])
        .range([ height, 0 ]);


    // Add the line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#43E0E4")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line().curve(d3.curveStepAfter)
                .x(d => x(d.date))
                .y(d => y(d.value))
                )

    var gradient = svg.append("linearGradient")
        .attr("id", "chartGradient")
        .attr("gradientTransform", "rotate(90)")
    
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#43E0E410")

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#43E0E480")

    svg.append("path")
        .datum(data)
        .attr("fill", "url('#chartGradient')")
        .attr("d", d3.area().curve(d3.curveStepAfter)
            .x(d => x(d.date))
            .y0(() => y(0))
            .y1(d => y(d.value)))

    var lastX = x(data[data.length-1].date)
    var lastY = y(data[data.length-1].value)
    svg
        .append('g')
        .append('path')
        .style("stroke", "#fff")
        .style("stroke-width", "0.5px")
        .style("stroke-dasharray", "5,5")
        .style("opacity", 1)
        .style("pointer-events", "none")
        .attr("d", function() {
            var d = "M" + lastX + "," + lastY;
                d += " " + width + "," + lastY;
                return d;
        })
        

    svg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);
    
    var bisect = d3.bisector(d => d.date).center;
    var tip = d3.select(tooltip);

    var focus = svg
        .append('g')
        .append('path')
        .style("stroke", "#fff")
        .style("stroke-width", "0.5px")
        .style("stroke-dasharray", "5,5")
        .style("opacity", 0)
        .style("pointer-events", "none")

    function mouseover() {
        tip.transition().duration(100).style("opacity", 1);
        focus.transition().duration(100).style("opacity", 1);
    }

    function mouseout() {
        tip.transition().duration(100).style("opacity", 0);
        focus.transition().duration(100).style("opacity", 0);
    }

    function mousemove(event) {
        var pointerX = d3.pointer(event)[0]
        var x0 = x.invert(pointerX);
        var i = bisect(data, x0);
        var value = data[i].value;
        var date = data[i].date;

        focus
            .attr("d", function () {
                var d = "M" + x(date) + "," + 0;
                d += " " + x(date) + "," + height;
                d += "M" + 0 + "," + y(value);
                d += " " + width + "," + y(value);
                return d;
            })
        tip.style("left", event.pageX + "px").style("top", event.pageY + "px");
        tip
            .selectAll('div')
            .html(`${d3.timeFormat("%Y-%m-%d")(date)}<br/>${d3.format(",.2f")(value)}`)
            .attr('fill', '#ffffff')
    }
}
</script>

<template>
    <div>
        <div ref="chart"></div>
        <Tooltip ref="tooltip"/>
    </div>
</template>