function loss_epoch(container, data, sliderA) {
    container.select("svg").remove();
    const svg = container.append("svg")
                .attr("width", '100%')
                .attr("height", '100%');
    const svg_width = svg.node().getBoundingClientRect().width;
    const svg_height = svg.node().getBoundingClientRect().height;
    //d3.json(json_file).then(function(data) {
        var losses = data;
        var losses_T = losses[0].map((col, k) => losses.map(row => row[k]));
        const epochs = losses.length;
        const num_loss = losses_T.length;
        
        svg.append("text")
        .text("Loss")
        .attr("transform", `translate(${svg_width-112}, 60)`)
        .attr("font-size", 12);
        loss_names = ['Total', 'Data']
        for (let i=1; i<=num_loss-2; i++) {
            loss_names.push('PDE'+String(i))
        }
        label_1 = Array();
        loss_names.forEach(function(name, n) {
            pos_x = svg_width-120
            pos_y = 80+20*n
            svg_tmp = svg.append("svg")
            ccl_tmp = svg_tmp.append("circle")
                        .attr("cx", pos_x)
                        .attr("cy", pos_y)
                        .attr("r", 5)
                        .style("fill", `rgba(255,255,255,0)`)
                        .style("stroke-width", 1)
                        .style("stroke", `rgba(${d3.interpolateRainbow(n/num_loss).slice(4,-1)},1)`)
                        .on("click", function(){
                        if (label_1[n][4]=="visible") {
                            label_1[n][2].attr("visibility", "hidden");
                            line_chart[n].attr("visibility", "hidden");
                            end_point[n].attr("visibility", "hidden");
                            label_1[n][4]="hidden";
                        } else {
                            label_1[n][2].attr("visibility", "visible");
                            line_chart[n].attr("visibility", "visible");
                            end_point[n].attr("visibility", "visible");
                            label_1[n][4]="visible";
                        }});
            pnt_tmp = svg_tmp.append("circle")
                        .attr("cx", pos_x)
                        .attr("cy", pos_y)
                        .attr("r", 2)
                        .style("fill", `rgba(${d3.interpolateRainbow(n/num_loss).slice(4,-1)},1)`)
                        .on("click", function(){
                        if (label_1[n][4]=="visible") {
                            label_1[n][2].attr("visibility", "hidden");
                            line_chart[n].attr("visibility", "hidden");
                            end_point[n].attr("visibility", "hidden");
                            label_1[n][4]="hidden";
                        } else {
                            label_1[n][2].attr("visibility", "visible");
                            line_chart[n].attr("visibility", "visible");
                            end_point[n].attr("visibility", "visible");
                            label_1[n][4]="visible";
                        }});
            txt_tmp = svg_tmp.append("text")
                        .text(name)
                        .attr("transform", `translate(${pos_x+8}, ${pos_y+4})`)
                        .attr("font-size", 12)
                        .style('fill', `rgba(${d3.interpolateRainbow(n/num_loss).slice(4,-1)},1)`)
                        .on("click", function(){
                        if (label_1[n][4]=="visible") {
                            label_1[n][2].attr("visibility", "hidden");
                            line_chart[n].attr("visibility", "hidden");
                            end_point[n].attr("visibility", "hidden");
                            label_1[n][4]="hidden";
                        } else {
                            label_1[n][2].attr("visibility", "visible");
                            line_chart[n].attr("visibility", "visible");
                            end_point[n].attr("visibility", "visible");
                            label_1[n][4]="visible";
                        }});
            num_tmp = svg_tmp.append("text")
                        .text("")
                        .attr("transform", `translate(${pos_x+50}, ${pos_y+4})`)
                        .attr("font-size", 12)
                        .style('fill', `rgba(${d3.interpolateRainbow(n/num_loss).slice(4,-1)},1)`)
            label_1.push([svg_tmp,ccl_tmp,pnt_tmp,txt_tmp,"visible",num_tmp])
        })

        var line_chart = Array();
        var end_point = Array();
        var slider = d3.sliderBottom()
        .min(1)
        .max(epochs)
        .step(1)
        .tickValues([1, epochs])
        .width(svg_width*0.9)
        .default(1)
        .displayValue(true)
        .fill('rgba(0,0,0,1)')
        .on("onchange", function(epoch) {
            line_chart.forEach(function(l_c) {
                l_c.remove();
            })
            end_point.forEach(function(e_p) {
                e_p.remove();
            })
            line_chart = Array();
            end_point = Array();
            losses_T.forEach(function(l_T, n) {
                l_c = svg.append("path")
                        .data([losses_T[n].slice(0,epoch)])
                        .attr("visibility", label_1[n][4])
                        .attr("fill", "none")
                        .attr("class", "line")
                        .attr("stroke", `rgba(${d3.interpolateRainbow(n/num_loss).slice(4,-1)},1)`)
                        .attr("stroke-width", 1)
                        .attr("d", d3.line(epoch)
                                .x(function(d,i) {return xScale(i+1);})
                                .y(function(d) {return yScale(d);}));
                line_chart.push(l_c);
                e_p = svg.append("circle")
                        .attr("visibility", label_1[n][4])
                        .attr("cx", xScale(epoch))
                        .attr("cy", yScale(losses_T[n][epoch-1]))
                        .attr("r", 5)
                        .style("fill", `rgba(255,255,255,0)`)
                        .style("stroke-width", 1)
                        .style("stroke", `rgba(${d3.interpolateRainbow(n/num_loss).slice(4,-1)},1)`);
                end_point.push(e_p);
                label_1[n][5].text(losses_T[n][epoch-1].toExponential(2));
            })
        })

        var xScale = d3.scaleLinear()
                        .domain([0, losses.length])
                        .range([60, svg_width-140]);
        var yScale = d3.scaleLog()
                        .base(10)
                        .domain([d3.min(losses.flat()), d3.max(losses.flat())])
                        .range([svg_height-60, 60]);
        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);
        svg.append('g')
        .call(xAxis)
        .attr("transform", `translate(0, ${svg_height-60})`);
        svg.append("text")
        .text('epoch')
        .attr("transform", `translate(${svg_width-140}, ${svg_height-75})`)
        .attr("text-anchor", 'end')
        .attr("dy", '1em')
        .attr("font-size", 12);
        svg.append('g')
        .call(yAxis)
        .attr("transform", `translate(60, 0)`);
        svg.append("text")
        .text('loss/error')
        .attr("transform", `translate(60, 60) rotate(-90)`)
        .attr("text-anchor", 'end')
        .attr("dy", '1em')
        .attr("font-size", 12);
        losses_T.forEach(function(l_T, n) {
            svg.append("path")
            .data([l_T])
            .attr("fill", "none")
            .attr("class", "line")
            .attr("stroke", `rgba(${d3.interpolateRainbow(n/num_loss).slice(4,-1)},0.1)`)
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                        .x(function(d,i) {return xScale(i+1);})
                        .y(function(d) {return yScale(d);}));
        })
        

        var isplaying = false;
        var sld_pos = slider.value();
        var timer;
        
        var g_slider = svg.append('g')
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
    //}); 
}