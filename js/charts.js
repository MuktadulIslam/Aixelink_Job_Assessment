class ChartManager {
    static createTrendsChart(data, idName, systolic, diastolic) {
        const chartContainer = document.getElementById(idName);
        chartContainer.innerHTML = '';
        const { margin, dimensions } = this.getChartDimensions(chartContainer);
        const processedData = this.processChartData(data, systolic, diastolic);
        const minWidth = Math.max(dimensions.width, processedData.length * 50);

        const { svg, container } = this.setupChartContainer(chartContainer, margin, minWidth, dimensions.height);
        const scales = this.createScales(processedData, minWidth, dimensions.height, 'dual');

        this.drawAxes(svg, scales, dimensions.height);
        this.drawDualLines(svg, processedData, scales, systolic, diastolic);
        this.createTooltip();
        this.addDualValueDots(svg, processedData, scales, systolic, diastolic);
        this.addLegend(svg, dimensions.width, [
            { name: systolic, color: '#ef4444' },
            { name: diastolic, color: '#3b82f6' }
        ]);
    }

    static createTrendsChartSingleValue(data, idName, valueType) {
        const chartContainer = document.getElementById(idName);
        chartContainer.innerHTML = '';
        const { margin, dimensions } = this.getChartDimensions(chartContainer);
        const processedData = this.processSingleValueData(data, valueType);
        const minWidth = Math.max(dimensions.width, processedData.length * 50);

        const { svg, container } = this.setupChartContainer(chartContainer, margin, minWidth, dimensions.height);
        const scales = this.createScales(processedData, minWidth, dimensions.height, 'single', valueType);

        this.drawAxes(svg, scales, dimensions.height);
        this.drawSingleLine(svg, processedData, scales, valueType);
        this.createTooltip();
        this.addSingleValueDots(svg, processedData, scales, valueType);
        this.addLegend(svg, dimensions.width, [{ name: valueType, color: '#ef4444' }]);
    }

    static getChartDimensions(container) {
        return {
            margin: { top: 20, right: 120, bottom: 80, left: 50 },
            dimensions: {
                width: container.clientWidth - 170,
                height: container.clientHeight - 100
            }
        };
    }

    static setupChartContainer(container, margin, width, height) {
        const scrollContainer = d3.select(container)
            .append('div')
            .style('overflow-x', 'auto')
            .style('margin-bottom', '20px');

        const svg = scrollContainer.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        return { svg, container: scrollContainer };
    }

    static createScales(data, width, height, type, valueType = null) {
        const x = d3.scalePoint()
            .domain(data.map(d => d.time))
            .range([0, width])
            .padding(0.5);

        const y = d3.scaleLinear()
            .domain([0, type === 'dual' ?
                d3.max(data, d => Math.max(d.systolic || 0, d.diastolic || 0)) * 1.1 :
                d3.max(data, d => d[valueType]) * 1.1
            ])
            .range([height, 0]);

        return { x, y };
    }

    static drawAxes(svg, scales, height) {
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(scales.x))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        svg.append('g')
            .call(d3.axisLeft(scales.y));
    }

    static drawDualLines(svg, data, scales, systolic, diastolic) {
        const lineMaker = (key) => d3.line()
            .x(d => scales.x(d.time))
            .y(d => scales.y(d[key]))
            .defined(d => d[key] != null);

        svg.append('path')
            .datum(data)
            .attr('class', 'line-systolic')
            .attr('fill', 'none')
            .attr('stroke', '#ef4444')
            .attr('stroke-width', 2)
            .attr('d', lineMaker('systolic'));

        svg.append('path')
            .datum(data)
            .attr('class', 'line-diastolic')
            .attr('fill', 'none')
            .attr('stroke', '#3b82f6')
            .attr('stroke-width', 2)
            .attr('d', lineMaker('diastolic'));
    }

    static drawSingleLine(svg, data, scales, valueType) {
        const line = d3.line()
            .x(d => scales.x(d.time))
            .y(d => scales.y(d[valueType]))
            .defined(d => d[valueType] != null);

        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#ef4444')
            .attr('stroke-width', 2)
            .attr('d', line);
    }

    static createTooltip() {
        if (!d3.select('body').select('.chart-tooltip').size()) {
            d3.select('body').append('div')
                .attr('class', 'chart-tooltip')
                .style('position', 'absolute')
                .style('background', 'white')
                .style('padding', '10px')
                .style('border', '1px solid #ccc')
                .style('border-radius', '5px')
                .style('pointer-events', 'none')
                .style('opacity', 0)
                .style('z-index', 1000);
        }
    }

    static addDualValueDots(svg, data, scales, systolic, diastolic) {
        const tooltip = d3.select('.chart-tooltip');

        this.addDots(svg, data, scales, 'systolic', '#ef4444', systolic, tooltip);
        this.addDots(svg, data, scales, 'diastolic', '#3b82f6', diastolic, tooltip);
    }

    static addSingleValueDots(svg, data, scales, valueType) {
        const tooltip = d3.select('.chart-tooltip');
        this.addDots(svg, data, scales, valueType, '#ef4444', valueType, tooltip);
    }

    static addDots(svg, data, scales, key, color, label, tooltip) {
        // Sanitize key for CSS selector
        const safeKey = key.replace(/[^a-zA-Z0-9]/g, '_');

        svg.selectAll(`.dot-${safeKey}`)
            .data(data.filter(d => d[key] != null))
            .enter()
            .append('circle')
            .attr('class', `dot-${safeKey}`)
            .attr('cx', d => scales.x(d.time))
            .attr('cy', d => scales.y(d[key]))
            .attr('r', 6)
            .attr('fill', color)
            .on('mouseover', function (event, d) {
                d3.select(this).attr('r', 8);
                tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);
                tooltip.html(`Time: ${d.time}<br/>${label}: ${d[key]}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function () {
                d3.select(this).attr('r', 6);
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    }

    static addLegend(svg, width, items) {
        const legend = svg.append('g')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10)
            .attr('text-anchor', 'start')
            .selectAll('g')
            .data(items)
            .enter()
            .append('g')
            .attr('transform', (d, i) => `translate(${width + 10},${i * 20})`);

        legend.append('rect')
            .attr('x', 0)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', d => d.color);

        legend.append('text')
            .attr('x', 20)
            .attr('y', 7.5)
            .attr('dy', '0.32em')
            .text(d => d.name);
    }

    static processChartData(data, systolic, diastolic) {
        const bpData = data.reduce((acc, item) => {
            const time = item.ColumnDisplay;
            if (!acc[time]) acc[time] = { time };
            if (item.Name === systolic) acc[time].systolic = parseFloat(item.Value);
            if (item.Name === diastolic) acc[time].diastolic = parseFloat(item.Value);
            return acc;
        }, {});

        return Object.values(bpData)
            .filter(d => d.systolic || d.diastolic)
            .sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    static processSingleValueData(data, valueType) {
        return data
            .filter(item => item.Name === valueType && item.Value)
            .map(item => ({
                time: item.ColumnDisplay,
                [valueType]: parseFloat(item.Value)
            }))
            .sort((a, b) => new Date(b.time) - new Date(a.time));
    }
}