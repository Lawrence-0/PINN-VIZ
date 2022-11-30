function nn2mx(container, data, sliderA) {
    const pic_size = 4;
    container.select("svg").remove();
    const svg = container.append("svg")
        .attr("width", '100%')
        .attr("height", '100%');
    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", `rgba(0,0,0,0.2)`);
    const svg_width = svg.node().getBoundingClientRect().width;
    const svg_height = svg.node().getBoundingClientRect().height;
    var structure = data.structure;
    var history = data.history;
    const num_layers = structure.length;
    const num_neurons = d3.max(structure);
    const epochs = history.length;
    colorScale = d3.scaleLinear()
        .domain([0, d3.max([-d3.min(history.flat().flat().flat().flat()), d3.max(history.flat().flat().flat().flat())])])
        .range([0, 1]);
    var slider = d3.sliderBottom()
        .min(1)
        .max(epochs)
        .step(1)
        .tickValues([1, epochs])
        .width(svg_width*0.9)
        .default(1)
        .displayValue(true)
        .fill('rgba(0,0,0,1)')
        .on("onchange", num => {
            for (let i=0;i<structure.length-1;i++) {
                for (let j=0;j<structure[i];j++) {
                    for (let k=0;k<structure[i+1];k++) {
                        if (history[num][i][0][j][k] >= 0) {
                            rect_array[i][j][k].style("fill", `rgba(255,0,0,${colorScale(history[num][i][0][j][k])})`)
                        } else {
                            rect_array[i][j][k].style("fill", `rgba(0,0,255,${colorScale(-history[num][i][0][j][k])})`)
                        }
                    }
                }
                for (let j=0;j<structure[i+1];j++) {
                    if (history[num][i][1][j] >= 0) {
                        tria_array[i][j].style("fill", `rgba(255,0,0,${colorScale(history[num][i][1][j])})`)
                    } else {
                        tria_array[i][j].style("fill", `rgba(0,0,255,${colorScale(-history[num][i][1][j])})`)
                    }
                }
            }
        });
    

    var g_array = Array();
    var rect_array = Array();
    var tria_array = Array();
    var g_all = svg.append("g");
    for (let i=0;i<structure.length-1;i++) {
        let g_tmp = g_all.append("g");
        g_array.push(g_tmp);
        let g_tsf = `translate(${(structure[1]+5)*pic_size*0.5**0.5}, ${svg_height/3})`;
        for (let j=0;j<i;j++) {
            if (j%2==0) {
                g_tsf += ` translate(${Math.sqrt(1/2)*(structure[j]+6)*pic_size}, ${(-1)**j*Math.sqrt(1/2)*(structure[j]+6)*pic_size}) translate(${(-1)**(j+1)*Math.sqrt(1/2)*(structure[j+1])*pic_size}, ${(-1)**j*Math.sqrt(1/2)*(structure[j+1])*pic_size})`;
            } else {
                g_tsf += ` translate(${Math.sqrt(1/2)*(structure[j+2]+6)*pic_size}, ${(-1)**j*Math.sqrt(1/2)*(structure[j+2]+6)*pic_size}) translate(${(-1)**(j+1)*Math.sqrt(1/2)*(structure[j])*pic_size}, ${(-1)**j*Math.sqrt(1/2)*(structure[j])*pic_size})`;
            }
        }
        g_tsf += ` rotate(${(-1)**i*45})`;
        g_tmp.attr("transform", g_tsf);
        if (i==0) {
            for (let j=0;j<structure[0];j++) {
                let line_tmp = g_tmp.append("line")
                    .attr("x1", `${(j+0.5)*pic_size}`)
                    .attr("y1", `${structure[1]*pic_size}`)
                    .attr("x2", `${(j+0.5)*pic_size}`)
                    .attr("y2", `${(structure[1]+5)*pic_size}`)
                    .style("stroke-width", 1)
                    .style("stroke", `rgba(0,0,0,0.5)`);
            }
        }
        rect_array.push(Array());
        tria_array.push(Array());
        for (let j=0;j<structure[i];j++) {
            rect_array[rect_array.length-1].push(Array());
            for (let k=0;k<structure[i+1];k++) {
                let rect_tmp = g_tmp.append("rect")
                    .attr("x", `${j*pic_size}`)
                    .attr("y", `${k*pic_size}`)
                    .attr("width", `${pic_size}`)
                    .attr("height", `${pic_size}`)
                    .style("fill", `rgba(255,255,255,1)`);
                rect_tmp = g_tmp.append("rect")
                    .attr("x", `${j*pic_size}`)
                    .attr("y", `${k*pic_size}`)
                    .attr("width", `${pic_size}`)
                    .attr("height", `${pic_size}`)
                    .style("fill", `rgba(0,0,0,0)`);
                rect_array[rect_array.length-1][rect_array[rect_array.length-1].length-1].push(rect_tmp);
            }
        }
        for (let j=0;j<structure[i+1];j++) {
            let tria_tmp = g_tmp.append("polygon")
                .attr("points", `${structure[i]*pic_size} ${j*pic_size}, ${structure[i]*pic_size} ${(j+1)*pic_size}, ${(structure[i]+1)*pic_size} ${(j+0.5)*pic_size}`)
                .attr("fill", `rgba(255,255,255,1)`);
            tria_tmp = g_tmp.append("polygon")
                .attr("points", `${structure[i]*pic_size} ${j*pic_size}, ${structure[i]*pic_size} ${(j+1)*pic_size}, ${(structure[i]+1)*pic_size} ${(j+0.5)*pic_size}`)
                .attr("fill", `rgba(0,0,0,0)`);
            tria_array[tria_array.length-1].push(tria_tmp);
            let line_tmp = g_tmp.append("line")
                .attr("x1", `${(structure[i]+1)*pic_size}`)
                .attr("y1", `${(j+0.5)*pic_size}`)
                .attr("x2", `${(structure[i]+6)*pic_size}`)
                .attr("y2", `${(j+0.5)*pic_size}`)
                .style("stroke-width", 1)
                .style("stroke", `rgba(0,0,0,0.5)`);
        }
    }
    console.log(rect_array);
    console.log(tria_array);

    

    var g_slider = svg.append('g')
        .attr('transform', `translate(${svg_width*0.05},0)`)
        .call(slider);

    var isplaying = false;
    var sld_pos = slider.value();
    var timer;


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
        g_all.attr('transform', event.transform);
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