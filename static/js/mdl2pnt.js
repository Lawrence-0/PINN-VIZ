function mdl2pnt(container, data) {
    container.select("svg").remove();
    if (data.length==0) return ;
    const svg = container.append("svg")
                .attr("width", '100%')
                .attr("height", '100%');
    const svg_width = svg.node().getBoundingClientRect().width;
    const svg_height = svg.node().getBoundingClientRect().height;
    var xScale = d3.scaleLinear()
        .domain([d3.min(data.map(d => d[0])), d3.max(data.map(d => d[0]))])
        .range([svg_width * 0.2, svg_width * 0.8]);
    var yScale = d3.scaleLinear()
        .domain([d3.min(data.map(d => d[1])), d3.max(data.map(d => d[1]))])
        .range([svg_height * 0.2, svg_height * 0.8]);
    var colorScale = d3.scaleLinear()
        .domain([d3.max(data.map(d => d[2])), d3.min(data.map(d => d[2]))])
        .range([0, 1]);
    var points = Array();
    data.forEach(d => {
        var circle = svg.append("circle")
            .attr("cx", xScale(d[0]))
            .attr("cy", yScale(d[1]))
            .attr("r", 3)
            .style("fill", `rgba(0,0,0,${colorScale(d[2])})`)
            .style("stroke-width", 1)
            .style("stroke", `rgba(0,0,0,0.3)`)
        points.push(circle);
    });
}