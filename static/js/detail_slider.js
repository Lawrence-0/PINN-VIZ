function detail_slider(container, epochs) {
    container.select("svg").remove();
    const svg = container.append("svg")
                .attr("width", '100%')
                .attr("height", '100%');
    const svg_width = svg.node().getBoundingClientRect().width;
    const svg_height = svg.node().getBoundingClientRect().height;
    var sliderA = d3.sliderBottom()
        .min(1)
        .max(epochs)
        .step(1)
        .tickValues([1, epochs])
        .width(svg_width*0.9)
        .default(1)
        .displayValue(true)
        .fill('rgba(0,0,0,1)')
        .on('onchange', num => {
            g_sliderB.call(sliderB.value(num));
            g_sliderC.call(sliderC.value(num));
        })
    var sliderB = d3.sliderBottom()
        .min(1)
        .max(epochs)
        .step(1)
        .tickValues([1, epochs])
        .width(svg_width*0.9)
        .default(1)
        .displayValue(true)
        .fill('rgba(0,0,0,1)')
    var sliderC = d3.sliderBottom()
        .min(1)
        .max(epochs)
        .step(1)
        .tickValues([1, epochs])
        .width(svg_width*0.9)
        .default(1)
        .displayValue(true)
        .fill('rgba(0,0,0,1)')
    var g_sliderB = svg.append('g')
                    .attr('visibility', 'hidden')
                    .call(sliderA);
    var g_sliderC = svg.append('g')
                    .attr('visibility', 'hidden')
                    .call(sliderA);
                    
    var g_sliderA = svg.append('g')
                    .attr('transform', `translate(${svg_width*0.05},8)`)
                    .attr('id', 'detail_1_slider')
                    .call(sliderA);

    var sld_pos = sliderA.value();
    var timer;
    var isplaying = false;
    function progress() {
        if (isplaying) {
            clearInterval(timer);
            sld_pos = sliderA.value();
        }
        else {
            sld_pos = sliderA.value();
            timer = setInterval(() => {
            sld_pos++;
            g_sliderA.call(sliderA.value(sld_pos));
            if(sld_pos>=epochs){
                clearInterval(timer);
                sld_pos = sliderA.value();
                isplaying = !isplaying;
            }}, 50);
        }
        isplaying = !isplaying;
    }

    var player = svg.append("polygon")
                    .attr("points", `${0.01*svg_width} ${0}, ${0.01*svg_width} ${svg_height}, ${0.01*svg_width+0.866*svg_height} ${0.5*svg_height}`)
                    .style("fill", `rgba(0,0,200,0.5)`)
                    .style("stroke-width", 0.001*svg_width)
                    .style("stroke", `rgba(200,200,200,0.5)`)
                    .on("click", function(){
                    progress();
                    });
    return [sliderB, sliderC];
}