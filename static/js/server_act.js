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
        $("#database_show").css("display", "none");
        $("#terminal_view").css("display", "block");
        $("#terminal_bttm").css("display", "block");
        $("#terminal_pause").css("display", "block");
        log_play = true;
    } else {
        $("#terminal_view").css("display", "none");
        $("#terminal_bttm").css("display", "none");
        $("#terminal_pause").css("display", "none");
        $("#database_show").css("display", "block");
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
    let fd = new FormData();
    fd.append("equ_num", equation_name.slice(8,));
    fd.append("equ_equ", $("#new_equation").val());
    $.ajax('/server7?equ_act=add', {
        type:'post',
        data: fd,
        processData: false,
        contentType: false,
        cache: false,
    }).done(function(data) {
        div_tmp = $('<div>').attr('id', 'PDE' + equation_name.slice(8,)).attr('class', 'equ_div').css("font-size", "14px").css("visibility", 'hidden').appendTo($("#equation_show"));
        div_tmp.html('$${\\bf PDE' + equation_name.slice(8,) + ':}\\quad 0 = ' + data.slice(2,-2) + '$$');
        MathJax.Hub.Queue(["Typeset",MathJax.Hub,"#div_tmp"]);
        div_tmp.css("visibility", 'visible');
        ddiv_tmp = $('<div>').attr('id', 'PDE' + equation_name.slice(8,) + '_w').attr('class', 'equ_div_w').appendTo($("#equation_show"));
        $('<input>').attr('id', 'PDE' + equation_name.slice(8,) + '_w_num').attr('type', 'number').attr('value', '0').attr('min', '0').css('width', '90%').css('transform', 'translate(0,50%)').appendTo(ddiv_tmp);
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
    let derivative_name = $("#derivative_0").text();
    let derivative_num = parseInt(derivative_name.slice(10,));
    if (derivative_num > 1) {
        $("#control_3_subblock_12").children(".elems").slice(-1).remove();
        $("#control_4_block_4").children(".sht_elems").slice(-1).remove();
        $("#derivative_1").children('option').slice(-1).remove();
        $("#derivative_0").text('Derivative' + String(derivative_num-1));
        $("#control_3_block_2").children().slice(-1).remove();
        $.ajax({
            url:'/server6?der_act=sub',
            type: 'post',
        });
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
    let fd = new FormData();
    fd.append("upfile", $upfile.prop('files')[0]);
    $.ajax({
        url:'/server3',
        type:'post',
        data: fd,
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
    $('#load_proj_slct').prop('disabled', true);
    $('#load_proj_bttn').prop('disabled', true);
    $("#select_PDE_input").prop('disabled', true);
    $("#select_PDE_output").prop('disabled', true);
    $("#select_PDE_parameter").prop('disabled', true);
    $.ajax({
        url:"/server5",
        method: 'post',
        success: function(data) {
            $("#control_2_block_3").empty();
            for (i=1;i<data.para_min_max.length+1;i++) {
                $('#para_pdt' + String(i)).prop('min', data.para_min_max[i-1][0]);
                $('#para_pdt' + String(i)).val(data.para_min_max[i-1][0]);
                $('#para_pdt' + String(i)).prop('max', data.para_min_max[i-1][1]);
            }
            if (data.in_type=='1DoT' || data.in_type=='1DwT') {
                show_csv_1d("control_2_block_3", data.rows);
            } else if (data.in_type=='2DoT' || data.in_type=='2DwT') {
                show_csv_2d("control_2_block_3", data.rows_smp);
            } else if (data.in_type=='3DoT' || data.in_type=='3DwT') {
                show_csv_3d("control_2_block_3", data.rows_smp);
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
    $('#equation_confirm').prop('disabled', false);
});

$("#select_PDE_input").change(function(){
    $('#load_proj_slct').prop('disabled', true);
    $('#load_proj_bttn').prop('disabled', true);
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
    $("#rst_input").empty();
    new_elems.forEach(function(d) {
        $("#rst_input").append($('<option>').attr('value', d).text(d));
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
    $('#load_proj_slct').prop('disabled', true);
    $('#load_proj_bttn').prop('disabled', true);
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
    $('#load_proj_slct').prop('disabled', true);
    $('#load_proj_bttn').prop('disabled', true);
    $("#control_1_subblock_32").empty();
    $("#control_4_block_3").empty();
    $("#para_predict").empty();
    for (let i=1;i<=this.value;i++) {
        $('<div class="elems">Parameter' + String(i) + '</div>').appendTo($("#control_1_subblock_32"));
        $('<div class="sht_elems">P' + String(i) + '</div>').appendTo($("#control_4_block_3"));
        $('<span>Parameter' + String(i) + '</span>').appendTo($("#para_predict"));
        $('<input type="number" id="para_pdt' + String(i) + '" style="width: 90%;" disabled>').appendTo($("#para_predict"));
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

$('#equation_confirm').click(function() {
    $("#derivative_1").prop('disabled', true);
    $("#derivative_2").prop('disabled', true);
    $("#derivative_add").prop('disabled', true);
    $("#derivative_sub").prop('disabled', true);
    $("#new_equation").prop('disabled', true);
    $("#equation_add").prop('disabled', true);
    $("#equation_sub").prop('disabled', true);
    $('#equation_confirm').prop('disabled', true);
    let weights=Array();
    let equation_num = parseInt($("#equation_name").text().slice(8,));
    for (let i=1;i<equation_num;i++) {
        wgt_tmp = $('#PDE'+String(i)+'_w_num');
        weights.push(wgt_tmp.val());
        wgt_tmp.prop('disabled', true);
    }
    $('#exa_sol_new').prop('disabled', false);
    $('#exa_sol_open').prop('disabled', false);
    $('#exa_sol_save').prop('disabled', false);
    $('#exa_sol_editor').prop('readonly', false);
    let fd = new FormData();
    fd.append('weights', weights);
    $.ajax('/server11', {
        type: 'post',
        data: fd,
        processData: false,
        contentType: false,
        cache: false,
    });
});

var wait_py_timer
$("#exa_sol_open").click(function() {
    $("#select_py").val('');
    $("#select_py").click();
    wait_py_timer = setInterval(() => {
        if ($("#select_py").prop('files')[0]) {
            clearInterval(wait_py_timer);
            let fd = new FormData();
            fd.append("upfile", $("#select_py").prop('files')[0]);
            $.ajax({
                url:'/server8?exa_act=open',
                type:'post',
                data: fd,
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
            $('#exa_sol_new').prop('disabled', true);
            $('#exa_sol_open').prop('disabled', true);
            $('#exa_sol_save').prop('disabled', true);
            $('#exa_sol_editor').prop('readonly', true);
            $('#save_proj_text').prop('disabled', false);
            $('#save_proj_bttn').prop('disabled', false);
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
        actv_funcs.push($("#actv_func" + String(i)).val());
    }
    let fd = new FormData();
    fd.append('epoch_num', $("#epoch_num").val());
    fd.append('steps_num', $("#steps_num").val());
    fd.append('optimizer_sel', $("#optimizer_sel").val());
    fd.append('learning_rate_num', $("#learning_rate_num").val());
    fd.append('actv_funcs', actv_funcs);
    $.ajax('/server10', {
        type: 'post',
        data: fd,
        processData: false,
        contentType: false,
        cache: false,
    }).done(function(data) {
        refresh_mdl_db();
    });
});

$("#save_proj_bttn").click(function() {
    $('#save_proj_text').prop('disabled', false);
    $('#save_proj_bttn').prop('disabled', false);
    let fd = new FormData();
    fd.append('proj_name', $('#save_proj_text').val());
    $.ajax('/server12', {
        type: 'post',
        data: fd,
        processData: false,
        contentType: false,
        cache: false,
    }).done(function(data) {
        $('#new_layer_num').prop('disabled', false);
        $('#new_layer_add').prop('disabled', false);
        $('#new_layer_sub').prop('disabled', false);
        $('#epoch_num').prop('disabled', false);
        $('#steps_num').prop('disabled', false);
        $('#optimizer_sel').prop('disabled', false);
        $('#learning_rate_num').prop('disabled', false);
        $('#actv_func').prop('disabled', false);
        $('#start_train').prop('disabled', false);
        $('#save_proj_text').prop('disabled', true);
        $('#save_proj_bttn').prop('disabled', true);
    });
});

var wait_proj_timer
$("#load_proj_bttn").click(function() {
    let fd = new FormData();
    fd.append('proj_id', $("#load_proj_slct option:selected").val());
    $.ajax('/server13', {
        type: 'post',
        data: fd,
        processData: false,
        contentType: false,
        cache: false,
    }).done(function(data) {
        $('#select_PDE_input').val(data['input']);
        $('#select_PDE_input').trigger('change');
        $('#select_PDE_output').val(data['output']);
        $('#select_PDE_output').trigger('change');
        $('#select_PDE_parameter').val(data['parameter']);
        $('#select_PDE_parameter').trigger('change');
        $("#select_csv_").prop('disabled', true);
        $("#upload_csv").prop('disabled', true);
        $('#analyze_csv').trigger('click');
        data['derivative'].forEach(d => {
            $('#derivative_1').val(d[0]);
            $('#derivative_2').val(d[1]);
            $('#derivative_add').trigger('click');
        });
        data['equation'].forEach(d => {
            $('#new_equation').val(d);
            $('#equation_add').trigger('click');
        });
        data['weight'].forEach((d, i) => {
            wait_proj_timer = setInterval(() => {
                if ($('#PDE' + String(i+1) + '_w_num').val()) {
                    clearInterval(wait_proj_timer);
                    $('#PDE' + String(i+1) + '_w_num').val(d);
                }
            }, 100);
        });
        wait_py_timer = setInterval(() => {
            if ($('#PDE' + String(data['weight'].length) + '_w_num').val()) {
                clearInterval(wait_py_timer);
                $('#equation_confirm').trigger('click');
                $("#exa_sol_editor").val(data.exa_sol);
                $('#exa_sol_new').prop('disabled', true);
                $('#exa_sol_open').prop('disabled', true);
                $('#exa_sol_save').prop('disabled', true);
                $('#exa_sol_editor').prop('readonly', true);
                $('#new_layer_num').prop('disabled', false);
                $('#new_layer_add').prop('disabled', false);
                $('#new_layer_sub').prop('disabled', false);
                $('#epoch_num').prop('disabled', false);
                $('#steps_num').prop('disabled', false);
                $('#optimizer_sel').prop('disabled', false);
                $('#learning_rate_num').prop('disabled', false);
                $('#actv_func').prop('disabled', false);
                $('#start_train').prop('disabled', false);
            }
        }, 100);
        refresh_mdl_db();
    });
});

$('#load_model_bttn').click(function() {
    let fd = new FormData();
    fd.append('model_id', $("#load_model_slct option:selected").val());
    $.ajax('/server16', {
        type: 'post',
        data: fd,
        processData: false,
        contentType: false,
        cache: false,
    }).done(function(data) {
        sliders = detail_slider(d3.select("#detail_1_container"), data["epoch"]);
        network_structure(d3.select("#detail_2_container"), data["data1"], sliders[0]);
        slider__ = loss_epoch(d3.select("#detail_3_container"), data["data2"], sliders[1]);
        $('#para_predict').children('input').prop('disabled', false);
        $('#rst_predict').prop('disabled', false);
        $('#rst_input').prop('disabled', false);
    });
});

$('#rst_predict').click(function() {
    let fd = new FormData();
    let paras = Array();
    for (let i=1;i<parseInt($('#select_PDE_parameter').val())+1;i++) {
        paras.push(parseFloat($('#para_pdt'+String(i)).val()));
    }
    fd.append('paras', paras);
    fd.append('model_id', $("#load_model_slct option:selected").val());
    $.ajax('/server18', {
        type: 'post',
        data: fd,
        processData: false,
        contentType: false,
        cache: false,
    }).done(function(data) {
        if (data.PDE_type == '3DwT') {
            let Umin = d3.min([d3.min(data.U_model), d3.min(data.U_exact)]);
            let Umax = d3.max([d3.max(data.U_model), d3.max(data.U_exact)]);
            pdct_show_3DwT('result_exp', data.T, data.X, data.Y, data.Z, data.U_model, 'PINN Solution', Umax, Umin);
            pdct_show_3DwT('result_std', data.T, data.X, data.Y, data.Z, data.U_exact, 'Exact Solution', Umax, Umin);
            pdct_show_3DwT('result_err', data.T, data.X, data.Y, data.Z, data.U_error, 'Error');
            $('#result_error_dist').empty();
            sel = $('#rst_input option:selected').val().slice(-1);
            error_show_any('result_error_dist', data['U_error_'+sel][0], data['U_error_'+sel][1], 'Input'+sel)
            $('#rst_input').change(function() {
                $('#result_error_dist').empty();
                sel = $('#rst_input option:selected').val().slice(-1);
                error_show_any('result_error_dist', data['U_error_'+sel][0], data['U_error_'+sel][1], 'Input'+sel)
                console.log(data.U_error_T);
                console.log(data.U_error_X);
                console.log(data.U_error_Y);
                console.log(data.U_error_Z);
            });
        }
    });
});







$.ajax('/server14', {
    type: 'post',
    processData: false,
    contentType: false,
    cache: false,
}).done(function(data) {
    data['data'].forEach(d => {
        $("#load_proj_slct").append($('<option>').attr('value', String(d[0])).text(d[1]));
    });
});






var tsne_pnts;

function refresh_mdl_db() {
    $.ajax('/server15', {
        type: 'post',
        processData: false,
        contentType: false,
        cache: false,
    }).done(function(data_all) {
        data = data_all.data;
        data2 = data_all.data2;
        $('#database_show tbody').empty();
        $(`
        <tr>
            <th></th>
            <th onclick="sortTable(1)">&nbsp;&nbsp;Model&nbsp;&nbsp;</th>
            <th onclick="sortTable(2)">&nbsp;&nbsp;Structure&nbsp;&nbsp;</th>
            <th onclick="sortTable(3)">&nbsp;&nbsp;Epochs&nbsp;&nbsp;</th>
            <th onclick="sortTable(4)">&nbsp;&nbsp;Steps per Epoch&nbsp;&nbsp;</th>
            <th onclick="sortTable(5)">&nbsp;&nbsp;Optimizer&nbsp;&nbsp;</th>
            <th onclick="sortTable(6)">&nbsp;&nbsp;Learning Rate&nbsp;&nbsp;</th>
            <th onclick="sortTable(7)">&nbsp;&nbsp;Final Loss&nbsp;&nbsp;</th>
        </tr>
        `).appendTo($('#database_show tbody'));
        data.forEach(d => {
            $(`
            <tr>
                <td><input type="checkbox" id="model${String(parseInt(d[0]))}" name="model${String(parseInt(d[0]))}" style="zoom:70%;"></td>
                <td>${d[0]}</td>
                <td>${d[1]}</td>
                <td>${d[2]}</td>
                <td>${d[3]}</td>
                <td>${d[4]}</td>
                <td>${d[5]}</td>
                <td>${d[6]}</td>
            </tr>
            `).appendTo($('#database_show tbody'));
            $(`#model${String(parseInt(d[0]))}`).change(function() {
                if (this.checked) {
                    let fd = new FormData();
                    fd.append('pa_act', 'add');
                    fd.append('model_id', this.name.slice(5));
                    $.ajax('/server17', {
                        type: 'post',
                        data: fd,
                        processData: false,
                        contentType: false,
                        cache: false,
                    }).done(function(data) {
                        parallel_line(d3.select("#overview_3_container"), data, tsne_pnts);
                    });
                } else {
                    let fd = new FormData();
                    fd.append('pa_act', 'sub');
                    fd.append('model_id', this.name.slice(5));
                    $.ajax('/server17', {
                        type: 'post',
                        data: fd,
                        processData: false,
                        contentType: false,
                        cache: false,
                    }).done(function(data) {
                        parallel_line(d3.select("#overview_3_container"), data, tsne_pnts);
                    });
                }
            });
        });
        $("#load_model_slct").empty();
        data.forEach(d => {
            $("#load_model_slct").append($('<option>').attr('value', String(parseInt(d[0]))).text('model' + String(parseInt(d[0]))));
        });
        tsne_pnts = mdl2pnt(d3.select('#overview_2_container'), data2);
        d3.select("#overview_3_container").select("svg").remove();
    });
}


function sortTable(n) {
    var theads = ['Model', 'Structure', 'Epochs', 'Steps per Epoch', 'Optimizer', 'Learning Rate', 'Final Loss'];
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("myTable");
    switching = true;
    dir = "asc";
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    for (let j=1;j<theads.length+1;j++) {
                        $('#myTable tr th').slice(j,j+1).text('\xa0\xa0'+theads[j-1]+'\xa0\xa0')
                    }
                    $('#myTable tr th').slice(n,n+1).text('\xa0\xa0'+theads[n-1]+'\xa0▲')
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    for (let j=1;j<theads.length+1;j++) {
                        $('#myTable tr th').slice(j,j+1).text('\xa0\xa0'+theads[j-1]+'\xa0\xa0')
                    }
                    $('#myTable tr th').slice(n,n+1).text('\xa0\xa0'+theads[n-1]+'\xa0▼')
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}
