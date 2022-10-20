function parallel_line(container, data) {
    container.select("svg").remove();
    if (data.length==0) return ;
    const svg = container.append("svg")
                .attr("width", '100%')
                .attr("height", '100%');
    const svg_width = svg.node().getBoundingClientRect().width;
    const svg_height = svg.node().getBoundingClientRect().height;
    //d3.json(json_file).then(function(data) {
        num_line = data.length;
        num_axis = d3.max(data.map(d => d.length));
        max_neur = d3.max(data.map(d => d.slice(0,-1)).flat())
        var xScale = d3.scaleLinear()
                        .domain([0, num_axis+1])
                        .range([60, svg_width-100]);
        var yScale = d3.scaleLinear()
                        .domain([0, max_neur])
                        .range([svg_height-60, 60]);
        var yScale_e = d3.scaleLog()
                        .base(10)
                        .domain([d3.min(data.map(d => d[d.length-1])), d3.max(data.map(d => d[d.length-1]))])
                        .range([svg_height-60, 60]);
        var yAxis = d3.axisRight(yScale);
        var yAxis_e = d3.axisLeft(yScale_e);
        for (let i=0; i<num_axis-1; i++) {
            svg.append('g')
            .call(yAxis)
            .attr("transform", `translate(${xScale(i)}, 0)`)
            .attr("color", 'rgba(0,0,100,0.5)');
            svg.append('text')
            .text("layer")
            .attr("transform", `translate(${xScale(i)}, 45)`)
            .attr("font-size", 12)
            .attr("font-weight", 700)
            .style('fill', 'rgba(0,0,100,0.5)');
        }
        svg.append('g')
        .call(yAxis_e)
        .attr("transform", `translate(${xScale(num_axis)}, 0)`)
        .attr("color", 'rgba(100,0,0,0.5)');
        svg.append('text')
        .text("error")
        .attr("transform", `translate(${xScale(num_axis)-30}, 45)`)
        .attr("font-size", 12)
        .attr("font-weight", 700)
        .style('fill', 'rgba(100,0,0,0.5)');
        var info_show = svg.append('text')
                    .attr("transform", `translate(60, ${svg_height-35})`)
                    .attr("font-size", 12)
                    .attr("font-weight", 700);
        var lns_lst = Array();
        data.forEach(function(datum, n) {
            ln_tmp = svg.append("path")
                        .data([datum.slice(0,-1)])
                        .attr("fill", "none")
                        .attr("class", "line")
                        .attr("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},0.2)`)
                        .attr("stroke-width", 1)
                        .attr("d", d3.line(datum.length-1)
                                .x(function(d,i) {return xScale(num_axis-datum.length+i);})
                                .y(function(d) {return yScale(d);}));
            ln_e_tmp = svg.append("path")
                        .data([datum.slice(-2,)])
                        .style("stroke-dasharray", ("3, 3"))
                        .attr("fill", "none")
                        .attr("class", "line")
                        .attr("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},0.2)`)
                        .attr("stroke-width", 1)
                        .attr("d", d3.line(2)
                                .x(function(d,i) {
                                    if (i==0) {
                                        return xScale(num_axis-2);
                                    } else {
                                        return xScale(num_axis);
                                    }
                                })
                                .y(function(d,i) {
                                    if (i==0) {
                                        return yScale(d);
                                    } else {
                                        return yScale_e(d);
                                    }}));
            pnts_tmp = Array();
            datum.forEach(function(dtm, m) {
                if (m<datum.length-1) {
                    pnt_tmp = svg.append("circle")
                                .attr("visibility", "hidden")
                                .attr("cx", xScale(num_axis-datum.length+m))
                                .attr("cy", yScale(dtm))
                                .attr("r", 5)
                                .style("fill", `rgba(255,255,255,0)`)
                                .style("stroke-width", 3)
                                .style("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},0.5)`);
                } else {
                    pnt_tmp = svg.append("polygon")
                                .attr("visibility", "hidden")
                                .attr("points", `${xScale(num_axis)} ${yScale_e(dtm)}, ${xScale(num_axis)+9} ${yScale_e(dtm)-5}, ${xScale(num_axis)+9} ${yScale_e(dtm)+5}`)
                                .style("fill", `rgba(255,255,255,0)`)
                                .style("stroke-width", 3)
                                .style("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},0.5)`)
                }
                pnts_tmp.push(pnt_tmp);
            });
            lns_lst.push([ln_tmp,ln_e_tmp,pnts_tmp])
        });
        label_0 = Array();
        data.forEach(function(datum, n) {
            pos_x = svg_width-100+20*parseInt(n/parseInt(svg_height/20-6))
            pos_y = 80+20*(n%parseInt(svg_height/20-6))
            svg_tmp = svg.append("svg")
            ccl_tmp = svg_tmp.append("circle")
                        .attr("cx", pos_x)
                        .attr("cy", pos_y)
                        .attr("r", 5)
                        .style("fill", `rgba(255,255,255,0)`)
                        .style("stroke-width", 1)
                        .style("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},1)`)
                        .on("click", function() {
                        if (label_0[n][2]=="hidden") {
                            label_0[n][2]="visible";
                            label_0[n][1].attr("visibility", "visible");
                        } else {
                            label_0[n][2]="hidden";
                            label_0[n][1].attr("visibility", "hidden");
                        }
                        })
                        .on("mouseover", function() {
                        lns_lst[n][0].attr("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},1)`)
                        .attr("stroke-width", 3);
                        lns_lst[n][1].attr("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},1)`)
                        .attr("stroke-width", 3);
                        lns_lst[n][2].forEach(function(p) {
                            p.attr("visibility", "visible")
                            .style("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},1)`)
                        });
                        info_tmp = "Error: ";
                        info_tmp += datum[datum.length-1].toExponential(2) + "; Hidden layers (" + String(datum.length-1) + "): ";
                        datum.slice(0,-2).forEach(function(dtm) {
                            info_tmp += String(dtm) + ' => ';
                        })
                        info_tmp += String(datum[datum.length-2]) + ".";
                        info_show.text(info_tmp)
                        .style('fill', `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},1)`);
                        })
                        .on("mouseout", function() {
                        if (label_0[n][2]=="hidden") {
                            lns_lst[n][0].attr("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},0.2)`)
                            .attr("stroke-width", 1);
                            lns_lst[n][1].attr("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},0.2)`)
                            .attr("stroke-width", 1);
                            lns_lst[n][2].forEach(function(p) {
                                p.attr("visibility", "hidden")
                                .style("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},0.5)`)
                            })
                        } else {
                            lns_lst[n][0].attr("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},0.5)`)
                            .attr("stroke-width", 3);
                            lns_lst[n][1].attr("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},0.5)`)
                            .attr("stroke-width", 3);
                            lns_lst[n][2].forEach(function(p) {
                                p.attr("visibility", "visible")
                                .style("stroke", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},0.5)`)
                            })
                        }
                        info_show.text("");
                        })
            pnt_tmp = svg_tmp.append("circle")
                        .attr("visibility", "hidden")
                        .attr("cx", pos_x)
                        .attr("cy", pos_y)
                        .attr("r", 2)
                        .style("fill", `rgba(${d3.interpolateRainbow(n/num_line).slice(4,-1)},1)`)
                        .on("click", function() {
                        if (label_0[n][2]=="hidden") {
                            label_0[n][2]="visible";
                            label_0[n][1].attr("visibility", "visible");
                        } else {
                            label_0[n][2]="hidden";
                            label_0[n][1].attr("visibility", "hidden");
                        }
                        });
            label_0.push([ccl_tmp,pnt_tmp,"hidden"])
        });
    //});
}