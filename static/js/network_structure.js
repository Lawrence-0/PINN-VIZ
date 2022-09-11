function network_structure(container, data, sliderA) {
    container.select("svg").remove();
    const svg = container.append("svg")
                .attr("width", '100%')
                .attr("height", '100%');
    var tooltip;
    var ttp_txt;
    var slider;
    const svg_width = svg.node().getBoundingClientRect().width;
    const svg_height = svg.node().getBoundingClientRect().height;
    var nodes = Array();
    var links = Array();
    var bg_nodes = Array();
    var structure = data.structure;
    var history = data.history;
    const num_layers = structure.length;
    const num_neurons = d3.max(structure);
    const epochs = history.length;
    colorScale = d3.scaleLinear()
                    .domain([0, d3.max([-d3.min(history.flat().flat().flat().flat()), d3.max(history.flat().flat().flat().flat())])])
                    .range([0, 1]);
    equareScale = d3.scaleLinear()
                    .domain([-d3.min(history.flat().flat().flat().flat()), d3.max(history.flat().flat().flat().flat())])
                    .range([-d3.min(history.flat().flat().flat().flat()), d3.max(history.flat().flat().flat().flat())]);
    slider = d3.sliderBottom()
    .min(1)
    .max(epochs)
    .step(1)
    .tickValues([1, epochs])
    .width(svg_width*0.9)
    .default(1)
    .displayValue(true)
    .fill('rgba(0,0,0,1)')
    .on('onchange', num => {
        for (let i=1; i<num_layers; i++) {
            for (let j=0; j<structure[i]; j++) {
                datum = history[num-1][i-1][1][j];
                if (datum < 0) {
                    nodes[i][j].style("fill", `rgba(0,0,255,${colorScale(-datum)})`);
                }
                else {
                    nodes[i][j].style("fill", `rgba(255,0,0,${colorScale(datum)})`);
                }
            }
        }
        for (let i=0; i<num_layers-1; i++) {
            for (let j=0; j<structure[i]; j++) {
                for (let k=0; k<structure[i+1]; k++) {
                    datum = history[num-1][i][0][j][k];
                    if (datum < 0) {
                        links[i][j][k].style("stroke", `rgba(0,0,255,${colorScale(-datum)})`);
                    }
                    else {
                        links[i][j][k].style("stroke", `rgba(255,0,0,${colorScale(datum)})`);
                    }
                }
            }
        }
    });
    const g_sld_height = 0;
    var xScale = d3.scaleBand()
    .domain(d3.range(num_layers+1))
    .range([0, svg_width]);
    var yScale = Array();
    structure.forEach(function(num_neu) {
        var yscl = d3.scaleBand()
        .domain(d3.range(num_neu+1))
        .range([g_sld_height+(1-(num_neu+1)/(num_neurons+1))*(svg_height-g_sld_height)/2, g_sld_height+(1+(num_neu+1)/(num_neurons+1))*(svg_height-g_sld_height)/2]);
        yScale.push(yscl);
    });
    structure.forEach(function(num_neu, i) {
        var lyr_lks = Array();
        for (let j=1; j<=num_neu; j++) {
            var nod_lks = Array();
            for (let k=1; k<=structure[i+1]; k++) {
                var link = svg.append("line")
                            .attr("x1", xScale(i+1))
                            .attr("y1", yScale[i](j))
                            .attr("x2", xScale(i+2))
                            .attr("y2", yScale[i+1](k))
                            .style("stroke-width", d3.min([xScale.bandwidth(), yScale[i].bandwidth()])/30)
                            .style("stroke", `rgba(200,200,200,0.5)`);
                nod_lks.push(link);
            }
            lyr_lks.push(nod_lks);
        }
        links.push(lyr_lks);
    });
    structure.forEach(function(num_neu, i) {
        var lyr_nds = Array();
        var bg_nds = Array();
        for (let j=1; j<=num_neu; j++) {
            var bg_nd = svg.append("circle")
                        .attr("cx", xScale(i+1))
                        .attr("cy", yScale[i](j))
                        .attr("r", d3.min([xScale.bandwidth(), yScale[i].bandwidth()])/3)
                        .style("fill", `rgba(255,255,255,1)`)
                        .style("stroke-width", d3.min([xScale.bandwidth(), yScale[i].bandwidth()])/30)
                        .style("stroke", `rgba(255,255,255,1)`);
            bg_nds.push(bg_nd);
            var circle = svg.append("circle")
                            .attr("cx", xScale(i+1))
                            .attr("cy", yScale[i](j))
                            .attr("r", d3.min([xScale.bandwidth(), yScale[i].bandwidth()])/3)
                            .style("fill", `rgba(255,255,255,1)`)
                            .style("stroke-width", d3.min([xScale.bandwidth(), yScale[i].bandwidth()])/30)
                            .style("stroke", `rgba(200,200,200,0.5)`);
            lyr_nds.push(circle);
        }
        bg_nodes.push(bg_nds);
        nodes.push(lyr_nds);
    });

    var visibility = true;

    for (let i=1; i<num_layers; i++) {
        for (let j=0; j<structure[i]; j++) {
            nodes[i][j].on("click", function() {
                if (visibility) {
                    nodes.flat().forEach(function(nd) {
                        nd.attr("visibility", "hidden");
                    });
                    nodes[i][j].attr("visibility", "visible");
                    bg_nodes.flat().forEach(function(nd) {
                        nd.attr("visibility", "hidden");
                    });
                    bg_nodes[i][j].attr("visibility", "visible");
                    links.flat().flat().forEach(function(lk) {
                        lk.attr("visibility", "hidden");
                    });
                    links[i-1][0].map((col, k) => links[i-1].map(row => row[k]))[j].forEach(function(lk) {
                        lk.attr("visibility", "visible");
                    });
                    links[i][j].forEach(function(lk) {
                        lk.attr("visibility", "visible");
                    });
                }
                else{
                    nodes.flat().forEach(function(nd) {
                        nd.attr("visibility", "visible");
                    });
                    bg_nodes.flat().forEach(function(nd) {
                        nd.attr("visibility", "visible");
                    });
                    links.flat().flat().forEach(function(lk) {
                        lk.attr("visibility", "visible");
                    });
                }
                visibility = !visibility;
            });
        }
    }

    var isplaying = false;
    var sld_pos = slider.value();
    var timer;

    var g_slider = svg.append('g')
                    .attr('id', 'detail_1_slider')
                    .attr('transform', `translate(${svg_width*0.05},0)`)
                    .call(slider);

    function progress() {
        if (isplaying) {
            clearInterval(timer);
            sld_pos = slider.value();
        }
        else {
            sld_pos = slider.value();
            timer = setInterval(() => {
            sld_pos++;
            g_slider.call(slider.value(sld_pos));
            if(sld_pos>=epochs){
                clearInterval(timer);
                sld_pos = slider.value();
                isplaying = !isplaying;
            }}, 50);
        }
        isplaying = !isplaying;
    }

    sliderA.on('onchange', num => {
        g_slider.call(slider.value(num));
    })

    var player = svg.append("polygon")
                    .attr("points", `${0.01*svg_width} ${0.01*svg_width}, ${0.01*svg_width} ${0.03*svg_width}, ${0.027*svg_width} ${0.02*svg_width}`)
                    .style("fill", `rgba(0,0,200,0.5)`)
                    .style("stroke-width", 0.001*svg_width)
                    .style("stroke", `rgba(200,200,200,0.5)`)
                    .on("click", function(){
                    progress();
                    });
    svg.call(d3.zoom().on("zoom", function(event) {
        nodes.flat().forEach(function(nd) {
            nd.attr('transform', event.transform);
        });
        links.flat().flat().forEach(function(lk) {
            lk.attr('transform', event.transform);
        });
        bg_nodes.flat().forEach(function(nd) {
            nd.attr('transform', event.transform);
        });
    }))
    .on("dblclick.zoom", null);

    svg.append('rect')
    .attr('width', 20)
    .attr('height', svg_height-200)
    .attr('x', svg_width-20)
    .attr('y', 100)
    .style('fill', `rgba(255,255,255,1)`);
    for (let i=0;i<svg_height/2-100;i++) {
        svg.append('rect')
        .attr('width', 20)
        .attr('height', 1)
        .attr('x', svg_width-20)
        .attr('y', 100+i)
        .style('fill', `rgba(255,0,0,${((svg_height/2-100)-i)/(svg_height/2-100)})`);
        svg.append('rect')
        .attr('width', 20)
        .attr('height', 1)
        .attr('x', svg_width-20)
        .attr('y', svg_height/2+i)
        .style('fill', `rgba(0,0,255,${i/(svg_height/2-100)})`);
    }
    svg.append('text')
    .text(d3.max([-d3.min(history.flat().flat().flat().flat()), d3.max(history.flat().flat().flat().flat())]).toExponential(2))
    .attr('transform', `translate(${svg_width-40},95)`)
    .attr("font-size", 10);
    svg.append('text')
    .text('-'+d3.max([-d3.min(history.flat().flat().flat().flat()), d3.max(history.flat().flat().flat().flat())]).toExponential(2))
    .attr('transform', `translate(${svg_width-44},${svg_height-90})`)
    .attr("font-size", 10);
}