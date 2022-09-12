var log_play = false;
$('#terminal_pause').click(function() {
    if (log_play) {
        clearInterval(log_interval);
    } else {
        log_interval = setInterval(() => {
            $.ajax({
                url: '/server_log',
                type:'post',
            }).done(function (data) {
                if (data['change']=='T') {
                    $("#terminal_view").text(data["data"]);
                }
            }, 10);
        });
    }
    log_play = !log_play;
});

$("#terminal_switch").click(function() {
    if ($("#terminal_view").css("display") == "none") {
        log_interval = setInterval(() => {
            $.ajax({
                url: '/server_log',
                type:'post',
            }).done(function (data) {
                if (data['change']=='T') {
                    $("#terminal_view").text(data["data"]);
                }
            }, 10);
        });
        $("#equation_show").css("display", "none");
        $("#terminal_view").css("display", "block");
        $("#terminal_bttm").css("display", "block");
        $("#terminal_pause").css("display", "block");
        log_play = true;
    } else {
        $("#terminal_view").css("display", "none");
        $("#terminal_bttm").css("display", "none");
        $("#terminal_pause").css("display", "none");
        $("#equation_show").css("display", "block");
        clearInterval(log_interval);
        log_play = false;
    }
});

var scroll_timer;
$('#terminal_bttm').mouseover(function() {
    scroll_timer = setInterval(() => {
        $('#terminal_view').scrollTop( $('#terminal_view')[0].scrollHeight );
    }, 10);
});
$('#terminal_bttm').mouseout(function() {
    clearInterval(scroll_timer);
});

$("#equation_add").click(function() {
    let equation_name = $("#equation_name").text();
    let equation_num = parseInt(equation_name.slice(8,));
    // let fd = new FormData();
    // fd.append("equ_num", equation_name.slice(8,));
    // fd.append("equ_equ", $("#new_equation").val());
    $.ajax('/server7?equ_act=add', {
        type:'post',
        data: {"equ_num": equation_name.slice(8,), "equ_equ": $("#new_equation").val()}
    }).done(function(data) {
        div_tmp = $('<div>').attr('id', 'PDE' + equation_name.slice(8,)).attr('class', 'equ_div').css("font-size", "14px").css("visibility", 'hidden').appendTo($("#equation_show"));
        div_tmp.html('$${\\bf PDE' + equation_name.slice(8,) + ':}\\quad 0 = ' + data.slice(2,-2) + '$$');
        MathJax.Hub.Queue(["Typeset",MathJax.Hub,"#div_tmp"]);
        div_tmp.css("visibility", 'visible');
        ddiv_tmp = $('<div>').attr('id', 'PDE' + equation_name.slice(8,) + '_w').attr('class', 'equ_div_w').appendTo($("#equation_show"));
        $('<input>').attr('type', 'number').attr('value', '0').attr('min', '0').css('width', '90%').css('transform', 'translate(0,50%)').appendTo(ddiv_tmp);
    });
    $("#equation_name").text('Equation' + String(equation_num+1));
})

$("#equation_sub").click(function() {
    let equation_name = $("#equation_name").text();
    let equation_num = parseInt(equation_name.slice(8,));
    if (equation_num > 1) {
        $.ajax({
            url:'/server7?equ_act=sub',
            type:'post',
        });
        $("#equation_show").children('.equ_div').slice(-1).remove();
        $("#equation_show").children('.equ_div_w').slice(-1).remove();
        $("#equation_name").text('Equation' + String(equation_num-1));
    }
});

$("#derivative_sub").click(function() {
    $.ajax({
        url:'/server6?der_act=sub',
        type: 'post',
    });
    let derivative_name = $("#derivative_0").text();
    let derivative_num = parseInt(derivative_name.slice(10,));
    if (derivative_num > 1) {
        $("#control_3_subblock_12").children(".elems").slice(-1).remove();
        $("#control_4_block_4").children(".sht_elems").slice(-1).remove();
        $("#derivative_1").children('option').slice(-1).remove();
        $("#derivative_0").text('Derivative' + String(derivative_num-1));
        $("#control_3_block_2").children().slice(-1).remove();
    }
});

$("#derivative_add").click(function() {
    $.ajax({
        url:'/server6?der_act=add&der_var=' + $("#derivative_0").text() + '&up_var=' + $("#derivative_1 option:selected").text() + '&down_var=' + $("#derivative_2 option:selected").text(),
        type:'post',
    }).done(function (data) {
        div_tmp = $('<div>').attr('id', 'div_tmp').css("font-size", "14px").css("visibility", 'hidden').appendTo($("#control_3_block_2"));
        div_tmp.html(data);
        MathJax.Hub.Queue(["Typeset",MathJax.Hub,"#div_tmp"]);
        div_tmp.css("visibility", 'visible').removeAttr('id');
    });
    let derivative_name = $("#derivative_0").text();
    let derivative_num = parseInt(derivative_name.slice(10,));
    $('<div class="elems">' + derivative_name + '</div>').appendTo($("#control_3_subblock_12"));
    $('<div class="sht_elems">D' + derivative_name.slice(10,) + '</div>').appendTo($("#control_4_block_4"));
    $("#derivative_1").append($('<option>').attr('value', derivative_name).text(derivative_name));
    $("#derivative_0").text('Derivative' + String(derivative_num+1));
});

$('#upload_csv').click(function () {
    let $upfile = $('input[name="select_csv"]');
    // let fd = new FormData();
    // fd.append("upfile", $upfile.prop('files')[0]);
    $.ajax({
        url:'/server3',
        type:'post',
        data: {"upfile": $upfile.prop('files')[0]},
        processData: false,
        contentType: false,
        cache: false,
    }).done(function (data) {
        if (data=='good') {
            alert('csv file has been uploaded!');
            $("#select_csv_").prop('disabled', true);
            $("#upload_csv").prop('disabled', true);
        } else {
            alert('csv file format error!')
        }
    });
});

$('#analyze_csv').click(function() {
    $("#select_PDE_input").prop('disabled', true);
    $("#select_PDE_output").prop('disabled', true);
    $("#select_PDE_parameter").prop('disabled', true);
    $.ajax({
        url:"/server5",
        method: 'post',
        success: function(data) {
            $("#control_2_block_3").empty();
            if (data.in_type=='1DoT' || data.in_type=='1DowT') {
                show_csv_1d("control_2_block_3", data.rows);
            } else if (data.in_type=='2DoT' || data.in_type=='2DowT') {
                show_csv_2d("control_2_block_3", data.rows);
            } else if (data.in_type=='3DoT' || data.in_type=='3DowT') {
                show_csv_3d("control_2_block_3", data.rows);
            }
            let sel_tmp = $('#select_csv_show');
            sel_tmp.empty();
            data.vars.forEach(function(d) {
                sel_tmp.append($('<option>').attr('value', d).text(d));
            });
            $("#control_2_subblock_22").empty();
            show_csv_any("control_2_subblock_22", data.rows, "InputX")
            $('#select_csv_show').change(function(){
                $("#control_2_subblock_22").empty();
                show_csv_any("control_2_subblock_22", data.rows, $('#select_csv_show option:selected').val());
            });
        }
    });
    $("#analyze_csv").prop('disabled', true);
    $("#select_csv_show").prop('disabled', false);
    $("#derivative_1").prop('disabled', false);
    $("#derivative_2").prop('disabled', false);
    $("#derivative_add").prop('disabled', false);
    $("#derivative_sub").prop('disabled', false);
    $("#new_equation").prop('disabled', false);
    $("#equation_add").prop('disabled', false);
    $("#equation_sub").prop('disabled', false);
});

$("#select_PDE_input").change(function(){
    $("#control_1_subblock_12").empty();
    $('#control_4_block_1').empty();
    let sel = $('#select_PDE_input option:selected').val();
    let new_elems = Array();
    if (sel=='1DoT') {
        new_elems = ['InputX'];
    } else if (sel=='2DoT') {
        new_elems = ['InputX','InputY'];
    } else if (sel=='3DoT') {
        new_elems = ['InputX','InputY','InputZ'];
    } else if (sel=='1DwT') {
        new_elems = ['InputT','InputX'];
    } else if (sel=='2DwT') {
        new_elems = ['InputT','InputX','InputY'];
    } else if (sel=='3DwT') {
        new_elems = ['InputT','InputX','InputY','InputZ'];
    }
    new_elems.forEach(function(d) {
        $('<div class="elems">' + d + '</div>').appendTo($("#control_1_subblock_12"));
        $('<div class="sht_elems">' + d.slice(0,1) + d.slice(5,6) + '</div>').appendTo($("#control_4_block_1"));
    });
    let sel_tmp = $("#derivative_2");
    sel_tmp.empty();
    new_elems.forEach(function(d) {
        sel_tmp.append($('<option>').attr('value', d).text(d));
    });
    $.ajax({
        url:"/server4?input=" + sel,
        type:'post',
        processData: false,
        contentType: false,
        cache: false,
    }).done(function(data) {
        $("#layers_span").text(data.layers.join('=>'));
    });
    let layer_num = parseInt($("#new_layer_title").text().slice(18,-4));
    for (let i=1;i<layer_num;i++) {
        $("#layer_" + String(i)).remove();
    }
    $("#new_layer_title").text('New Hidden Layer (1):  ');
});

$("#select_PDE_output").change(function(){
    $("#control_1_subblock_22").empty();
    $("#control_4_block_2").empty();
    let new_elems = Array();
    for (let i=1;i<=this.value;i++) {
        new_elems.push('Output' + String(i));
        $('<div class="elems">Output' + String(i) + '</div>').appendTo($("#control_1_subblock_22"));
        $('<div class="sht_elems">O' + String(i) + '</div>').appendTo($("#control_4_block_2"));
    }
    let sel_tmp = $("#derivative_1");
    sel_tmp.empty();
    new_elems.forEach(function(d) {
        sel_tmp.append($('<option>').attr('value', d).text(d));
    });
    $.ajax({
        url:"/server4?output=" + String(this.value),
        type:'post',
        processData: false,
        contentType: false,
        cache: false,
    }).done(function(data) {
        $("#layers_span").text(data.layers.join('=>'));
    });
    let layer_num = parseInt($("#new_layer_title").text().slice(18,-4));
    for (let i=1;i<layer_num;i++) {
        $("#layer_" + String(i)).remove();
    }
    $("#new_layer_title").text('New Hidden Layer (1):  ');
});

$("#select_PDE_parameter").change(function(){
    $("#control_1_subblock_32").empty();
    $("#control_4_block_3").empty();
    for (let i=1;i<=this.value;i++) {
        $('<div class="elems">Parameter' + String(i) + '</div>').appendTo($("#control_1_subblock_32"));
        $('<div class="sht_elems">P' + String(i) + '</div>').appendTo($("#control_4_block_3"));
    }
    $.ajax({
        url:"/server4?parameter=" + String(this.value),
        type:'post',
        processData: false,
        contentType: false,
        cache: false,
    }).done(function(data) {
        $("#layers_span").text(data.layers.join('=>'));
    });
});

$("#exa_sol_new").click(function() {
    $.ajax({
        url:'/server8?exa_act=new',
        type:'post',
    }).done(function (data) {
        $("#exa_sol_editor").val(data.text);
    });
});

var wait_py_timer
$("#exa_sol_open").click(function() {
    $("#select_py").val('');
    $("#select_py").click();
    wait_py_timer = setInterval(() => {
        if ($("#select_py").prop('files')[0]) {
            clearInterval(wait_py_timer);
            // let fd = new FormData();
            // fd.append("upfile", $("#select_py").prop('files')[0]);
            $.ajax({
                url:'/server8?exa_act=open',
                type:'post',
                data: {"upfile": $("#select_py").prop('files')[0]},
                processData: false,
                contentType: false,
                cache: false,
            }).done(function (data) {
                if (data.isgood=='good') {
                    $("#exa_sol_editor").val(data.text);
                } else {
                    alert('Invalid file!');
                }
            });
        }
    }, 100);
});

$("#exa_sol_save").click(function() {
    $.ajax('/server8?exa_act=save', {
        type:'post',
        data: {'text': $("#exa_sol_editor").val()}
    }).done(function (data) {
        if (data.isgood=='good') {
            alert('File has been uploaded!');
        } else {
            alert('Invalid code!');
        }
    });
});

var actv_all;
$("#new_layer_add").click(function() {
    let layer_num = parseInt($("#new_layer_title").text().slice(18,-4));
    let new_layer = parseInt($("#new_layer_num").val());
    if (new_layer > 0) {
        $.ajax({
            url: '/server9?lyr_act=add&new_layer=' + String(new_layer),
            type: 'post',
        }).done(function(data) {
            $("#layers_span").text(data.layers.join('=>'));
        });
        $("#overview_0_subblock_71").append('<div class="layer_" id="layer_' + String(layer_num) + '"><span>Hidden Layer ' + String(layer_num) + '</span><br><select disabled="true" id="actv_func' + String(layer_num) + '"><option value="deserialize">deserialize</option><option value="elu">elu</option><option value="exponential">exponential</option><option value="gelu">gelu</option><option value="get">get</option><option value="hard_sigmoid">hard_sigmoid</option><option value="linear">linear</option><option value="relu" selected="selected">relu</option><option value="selu">selu</option><option value="serialize">serialize</option><option value="sigmoid">sigmoid</option><option value="softmax">softmax</option><option value="softplus">softplus</option><option value="softsign">softsign</option><option value="swish">swish</option><option value="tanh">tanh</option></select></div>');
        if ($("#actv_func").val()!='') {
            $("#actv_func" + String(layer_num)).val($("#actv_func").val()).change();
        } else {
            $("#actv_func" + String(layer_num)).prop('disabled', false);
        }
        layer_num += 1;
        $("#new_layer_title").text('New Hidden Layer (' + String(layer_num) + '):  ');
    }
});

$("#new_layer_sub").click(function() {
    let layer_num = parseInt($("#new_layer_title").text().slice(18,-4));
    layer_num -= 1;
    $.ajax({
        url: '/server9?lyr_act=sub',
        type: 'post',
    }).done(function(data) {
        $("#layers_span").text(data.layers.join('=>'));
        if (data.isgood=="good") {
            $("#new_layer_title").text('New Hidden Layer (' + String(layer_num) + '):  ');
            $("#layer_" + String(layer_num)).remove();
        }
    });
});

$("#actv_func").change(function() {
    let layer_num = parseInt($("#new_layer_title").text().slice(18,-4));
    let actv_val = $("#actv_func").val();
    if (actv_val != "") {
        for (let i=1;i<layer_num;i++) {
            $("#actv_func" + String(i)).val(actv_val).change();
            $("#actv_func" + String(i)).prop('disabled', true);
        }
    } else {
        for (let i=1;i<layer_num;i++) {
            $("#actv_func" + String(i)).prop('disabled', false);
        }
    }
});

$("#start_train").click(function() {
    let layer_num = parseInt($("#new_layer_title").text().slice(18,-4));
    let actv_funcs = Array();
    for (let i=1;i<layer_num;i++) {
        actv_funcs.push($("#actv_func" + String(i)));
    }
    $.ajax('/server10', {
        type: 'post',
        data: {'epoch_num': $("#epoch_num").val(),
            'steps_num': $("#steps_num").val(),
            'optimizer_sel': $("#optimizer_sel").val(),
            'learning_rate_num':  $("#learning_rate_num").val(),
            'actv_funcs': actv_funcs},}).done
});




$("#show_overview_3").click(function() {
    $.ajax({
        url:"/server1",
        method: 'post',
        success: function(data) {
            parallel_line(d3.select("#overview_3_container"), data);
        }
    });
});

$("#show_detail_2").click(function() {
    $.ajax({
        url:"/server2",
        method: 'post',
        success: function(data) {
            sliders = detail_slider(d3.select("#detail_1_container"), data["epoch"]);
            network_structure(d3.select("#detail_2_container"), data["data1"], sliders[0]);
            slider__ = loss_epoch(d3.select("#detail_3_container"), data["data2"], sliders[1]);
            console.log(slider__);
        }
    });
});
