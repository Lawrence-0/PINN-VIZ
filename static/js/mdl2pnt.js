function mdl2pnt(container, data) {
    container.select("svg").remove();
    if (data.length==0) return ;
    const svg = container.append("svg")
                .attr("width", '100%')
                .attr("height", '100%');
    const svg_width = svg.node().getBoundingClientRect().width;
    const svg_height = svg.node().getBoundingClientRect().height;
    const svg_size = d3.min([svg_width, svg_height]);
    function min_dis(pnts) {
        var rst = ((pnts[0][0]-pnts[1][0])**2+(pnts[0][1]-pnts[1][1])**2)**0.5;
        for (let i=0;i<pnts.length;i++) {
            for (let j=i+1;j<pnts.length;j++) {
                rst = d3.min([rst, ((pnts[i][0]-pnts[j][0])**2+(pnts[i][1]-pnts[j][1])**2)**0.5]);
            }
        }
        return rst;
    }
    const ccl_size = svg_size * 0.15 / (d3.max(data.map(d => d[0])) - d3.min(data.map(d => d[0])))*min_dis(data);
    var xScale = d3.scaleLinear()
        .domain([d3.min(data.map(d => d[0])), d3.max(data.map(d => d[0]))])
        .range([svg_size * 0.2, svg_size * 0.8]);
    var yScale = d3.scaleLinear()
        .domain([d3.min(data.map(d => d[1])), d3.max(data.map(d => d[1]))])
        .range([svg_size * 0.2, svg_size * (0.2 + 0.6 / (d3.max(data.map(d => d[0])) - d3.min(data.map(d => d[0]))) * (d3.max(data.map(d => d[1])) - d3.min(data.map(d => d[1]))))]);
    var colorScale = d3.scaleLinear()
        .domain([d3.max(data.map(d => d[2])), d3.min(data.map(d => d[2]))])
        .range([0.1, 0.9]);
    var points = Array();
    var bgs = Array();
    data.forEach(d => {
        var circle = svg.append("circle")
            .attr("cx", xScale(d[0]))
            .attr("cy", yScale(d[1]))
            .attr("r", ccl_size)
            .style("fill", `rgba(255,255,255,1)`)
            .style("stroke-width", ccl_size)
            .style("stroke", `rgba(0,0,0,0)`);
        points.push(circle);
        var bg = svg.append("circle")
            .attr("cx", xScale(d[0]))
            .attr("cy", yScale(d[1]))
            .attr("r", ccl_size)
            .style("fill", `rgba(255,255,255,1)`);
        bgs.push(bg);
        var bg = svg.append("circle")
            .attr("cx", xScale(d[0]))
            .attr("cy", yScale(d[1]))
            .attr("r", ccl_size)
            .style("fill", `rgba(0,0,0,${colorScale(d[2])})`);
        bgs.push(bg);
    });
    svg.call(d3.zoom().on("zoom", function(event) {
        points.flat().forEach(function(nd) {
            nd.attr('transform', event.transform);
        });
        bgs.flat().forEach(function(nd) {
            nd.attr('transform', event.transform);
        });
    }))
    .on("dblclick.zoom", null);
    return points;
}