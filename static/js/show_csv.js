function show_csv_3d(container, rows) {
    function unpack(rows, key) {
        return rows.map(function(row)
        { return row[key]; });}
    var trace1 = {
        x:unpack(rows, 'InputX'), y: unpack(rows, 'InputY'), z: unpack(rows, 'InputZ'),
        mode: 'markers',
        marker: {
            size: 2,
            line: {
            color: 'rgba(200, 200, 200, 0.1)',
            width: 0.5},
            opacity: 0.8},
        type: 'scatter3d'
    };
    var data = [trace1]
    var layout = {margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0
        }};
    Plotly.newPlot(container, data, layout, {displayModeBar: false});
}

function show_csv_2d(container, rows) {
    function unpack(rows, key) {
        return rows.map(function(row)
        { return row[key]; });}
    var trace1 = {
        x:unpack(rows, 'InputX'), y: unpack(rows, 'InputY'),
        mode: 'markers',
        marker: {
            size: 2,
            line: {
            color: 'rgba(200, 200, 200, 0.1)',
            width: 0.5},
            opacity: 0.8},
        type: 'scatter'
        };
        var data = [trace1];
        var layout = {
        xaxis: {title: "x"}, 
        yaxis: {title: "y"},
        margin: {l: 50,r: 50,b: 30,t: 0}
        };
        Plotly.newPlot(container, data, layout, {displayModeBar: false});
}

function show_csv_1d(container, rows) {
    function unpack(rows, key) {
        return rows.map(function(row)
        { return row[key]; });}
    var x_ = unpack(rows, 'InputX')
    x_max = d3.max(x_)
    x_min = d3.min(x_)
    var trace1 = {
        x:x_,
        autobinx: false, 
        marker: {
            color: 'rgba(200, 200, 200, 0.9)',
        },  
        opacity: 0.9, 
        type: "histogram", 
        xbins: {
            start:x_min,
            end:x_max,
            size: (x_max-x_min)/100,
        }
        };
    var data = [trace1];
    var layout = {
    xaxis: {title: "x"}, 
    yaxis: {title: "number of samples"},
    margin: {l: 50,r: 50,b: 30,t: 0}
    };
    Plotly.newPlot(container, data, layout, {displayModeBar: false});
}

function show_csv_any(container, rows, var_name) {
    function unpack(rows, key) {
        return rows.map(function(row)
        { return row[key]; });}
    var x_ = unpack(rows, var_name)
    x_max = d3.max(x_)
    x_min = d3.min(x_)
    var trace1 = {
        x:x_,
        autobinx: false,
        opacity: 0.5, 
        type: "histogram", 
        xbins: {
            start:x_min,
            end:x_max,
            size: (x_max-x_min)/100,
        }
        };
    var data = [trace1];
    var layout = {
    xaxis: {title: var_name}, 
    yaxis: {title: "samples"},
    margin: {l: 0,r: 0,b: 0,t: 0}
    };
    Plotly.newPlot(container, data, layout, {displayModeBar: false});
}