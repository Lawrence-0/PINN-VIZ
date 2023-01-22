function pdct_show_3DwT(container, T, X, Y, Z, U, title_text, Umax=null, Umin=null) {
    var data = [];
    if (Umax==null) {
        Umax = d3.max(U);
    }
    if (Umin==null) {
        Umin = d3.min(U);
    }
    for (let i=0;i<21;i++) {
        var u_temp = U.slice(i*21*21*21, (i+1)*21*21*21);
        var d_temp = [{
            type: 'isosurface',
            x: X,
            y: Y,
            z: Z,
            value: u_temp,
            visible: false,
            isomin: Umin,
            isomax: Umax,
            surface: {show: true, count: 10, fill: 0.3},
            caps: {
                x: {show: false},
                y: {show: false},
                z: {show: false},
            },
            colorbar: {
                title: {text: title_text, side: 'bottom'},
                thickness: 10,
                tickfont: {size: 10},
                nticks: 4,
                orientation: 'h',
                len: 1,
                y: 0.8,
                x: 0.5,
                ypad: 0
            },
        }];
        data.push(d_temp);
    };
    data[0].visible = true;
    var config = {
        showSendToCloud: true,
        responsive: true,
        displayModeBar: false,
        toImageButtonOptions: {
            format: 'png',
            filename: 'isosurface',
            height: 600,
            width: 650,
        }
    };
    var steps = [];
    for (let i=0;i<data.length;i++) {
        var step = {
            label: T[i].toString(),
            method: 'update',
            args: [{
                visible: Array(data.length).fill(false)
            }]
        }
        step.args[0].visible[i] = true;
        steps.push(step);
    };

    var sliders = [{
        pad: {t: 10},
        currentvalue: {
            xanchor: 'right',
            prefix: 'time: ',
            font: {
            color: '#888',
            size: 10
            }
        },
        steps:steps
    }]

    var layout = {
        showlegend: false,
        margin: {t:10, l:10, b:50, r: 10},
        sliders: sliders
    };

    Plotly.newPlot(container, data[0], layout, config);
    for (let i=1; i<data.length; i++) {
        Plotly.addTraces(container, data[i])
    };
}

function pdct_show_3DoT(container, X, Y, Z, U, title_text, Umax=null, Umin=null) {
    if (Umax==null) {
        Umax = d3.max(U);
    }
    if (Umin==null) {
        Umin = d3.min(U);
    }
    var data = [{
        type: 'isosurface',
        x: X,
        y: Y,
        z: Z,
        value: U,
        visible: true,
        isomin: Umin,
        isomax: Umax,
        surface: {show: true, count: 10, fill: 0.3},
        caps: {
            x: {show: false},
            y: {show: false},
            z: {show: false},
        },
        colorbar: {
            title: {text: title_text, side: 'bottom'},
            thickness: 10,
            tickfont: {size: 10},
            nticks: 4,
            orientation: 'h',
            len: 1,
            y: 0.8,
            x: 0.5,
            ypad: 0
        },
    }];

    var config = {
        showSendToCloud: true,
        responsive: true,
        displayModeBar: false,
        toImageButtonOptions: {
            format: 'png',
            filename: 'isosurface',
            height: 600,
            width: 650,
        }
    };

    var layout = {
        showlegend: false,
        margin: {t:10, l:10, b:50, r: 10},
    };

    Plotly.newPlot(container, data, layout, config);
}

function pdct_show_2DwT(container, T, X, Y, U, title_text, Umax=null, Umin=null) {
    var data = [];
    if (Umax==null) {
        Umax = d3.max(U.flat().flat());
    }
    if (Umin==null) {
        Umin = d3.min(U.flat().flat());
    }
    for (let i=0;i<21;i++) {
        var u_temp = U.slice(i, i+1);
        var d_temp = [{
            type: 'heatmap',
            x: X,
            y: Y,
            z: u_temp[0],
            visible: false,
            zmin: Umin,
            zmax: Umax,
            colorbar: {
                title: {text: title_text, side: 'bottom'},
                thickness: 10,
                tickfont: {size: 10},
                nticks: 4,
                orientation: 'h',
                len: 1,
                y: 1.0,
                x: 0.5,
                ypad: 0
            },
        }];
        data.push(d_temp);
    }
    data[0].visible = true;
    var config = {
        showSendToCloud: true,
        responsive: true,
        displayModeBar: false,
        toImageButtonOptions: {
            format: 'png',
            filename: 'heatmap',
            height: 600,
            width: 650,
        }
    };
    var steps = [];
    for (let i=0;i<data.length;i++) {
        var step = {
            label: T[i].toString(),
            method: 'update',
            args: [{
                visible: Array(data.length).fill(false)
            }]
        }
        step.args[0].visible[i] = true;
        steps.push(step);
    };

    var sliders = [{
        pad: {t: 15},
        currentvalue: {
            xanchor: 'right',
            prefix: 'time: ',
            font: {
            color: '#888',
            size: 10
            }
        },
        steps:steps
    }]

    var layout = {
        showlegend: false,
        margin: {t:10, l:30, b:50, r: 30},
        sliders: sliders
    };

    Plotly.newPlot(container, data[0], layout, config);
    for (let i=1; i<data.length; i++) {
        Plotly.addTraces(container, data[i])
    };
}

function pdct_show_2DoT(container, X, Y, U, title_text, Umax=null, Umin=null) {
    if (Umax==null) {
        Umax = d3.max(U.flat().flat());
    }
    if (Umin==null) {
        Umin = d3.min(U.flat().flat());
    }
    var data = [{
        type: 'heatmap',
        x: X,
        y: Y,
        z: U,
        value: U,
        visible: true,
        zmin: Umin,
        zmax: Umax,
        colorbar: {
            title: {text: title_text, side: 'bottom'},
            thickness: 10,
            tickfont: {size: 10},
            nticks: 4,
            orientation: 'h',
            len: 1,
            y: 1.0,
            x: 0.5,
            ypad: 0
        },
    }];

    var config = {
        showSendToCloud: true,
        responsive: true,
        displayModeBar: false,
        toImageButtonOptions: {
            format: 'png',
            filename: 'heatmap',
            height: 600,
            width: 650,
        }
    };

    var layout = {
        showlegend: false,
        margin: {t:10, l:30, b:50, r: 30},
    };

    Plotly.newPlot(container, data, layout, config);
}

function pdct_show_1DwT(container, T, X, U, title_text, Umax=null, Umin=null) {
    var data = [];
    if (Umax==null) {
        Umax = d3.max(U.flat().flat());
    }
    if (Umin==null) {
        Umin = d3.min(U.flat().flat());
    }
    for (let i=0;i<21;i++) {
        console.log(X);
        console.log(u_temp);
        var u_temp = U.slice(i, i+1);
        var d_temp = [{
            mode: 'markers',
            type: 'scatter',
            x: X,
            y: u_temp[0]
        }];
        data.push(d_temp);
    }
    data[0].visible = true;
    var config = {
        showSendToCloud: true,
        responsive: true,
        displayModeBar: false,
        toImageButtonOptions: {
            format: 'png',
            filename: 'scatter',
            height: 600,
            width: 650,
        }
    };
    var steps = [];
    for (let i=0;i<data.length;i++) {
        var step = {
            label: T[i].toString(),
            method: 'update',
            args: [{
                visible: Array(data.length).fill(false)
            }]
        }
        step.args[0].visible[i] = true;
        steps.push(step);
    };

    var sliders = [{
        pad: {t: 15},
        currentvalue: {
            xanchor: 'right',
            prefix: 'time: ',
            font: {
            color: '#888',
            size: 10
            }
        },
        steps:steps
    }]

    var layout = {
        showlegend: false,
        margin: {t:10, l:30, b:50, r: 30},
        yaxis: {range: [Umin, Umax]},
        sliders: sliders
    };

    Plotly.newPlot(container, data[0], layout, config);
    for (let i=1; i<data.length; i++) {
        Plotly.addTraces(container, data[i])
    };
}

function pdct_show_1DoT(container, X, U, title_text, Umax=null, Umin=null) {
    if (Umax==null) {
        Umax = d3.max(U.flat().flat());
    }
    if (Umin==null) {
        Umin = d3.min(U.flat().flat());
    }
    var data = [{
        mode: 'markers',
        type: 'scatter',
        x: X,
        y: U
    }]

    var config = {
        showSendToCloud: true,
        responsive: true,
        displayModeBar: false,
        toImageButtonOptions: {
            format: 'png',
            filename: 'scatter',
            height: 600,
            width: 650,
        }
    };

    var layout = {
        showlegend: false,
        margin: {t:10, l:30, b:50, r: 30},
    };

    Plotly.newPlot(container, data, layout, config);
}

function error_show_any(container, x, y, var_name){
    var trace1 = {
        x: x,
        y: y,
        marker: {color: 'rgb(135,206,250)'},
        type: 'bar'
    };
    var data = [trace1];
    var layout = {
        xaxis: {title: var_name}, 
        yaxis: {title: "mean error"},
        margin: {l: 0,r: 0,b: 1,t: 1}
    };
    Plotly.newPlot(container, data, layout, {displayModeBar: false});
}