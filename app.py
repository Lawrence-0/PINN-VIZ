from flask import  Flask, jsonify, render_template, request
import json
import time
import os
import pandas as pd
import importlib
from pycode1 import *
import logging
flask_log = logging.getLogger('werkzeug')
flask_log.disabled = True
if os.path.exists('log.log'):
    os.remove('log.log')
log_len = 0
logging.basicConfig(filename='log.log', level=logging.DEBUG)

app = Flask(__name__)

PDE_type = {'input': '1DoT',
            'output': '1',
            'parameter': '1'}
PDE_vars = {'PDE_vars': None,
            'PDE_equs': []}
Hyper_settings = {'layers': [1, 1],
                  'epochs': '1',
                  'steps': '1',
                  'optimizer': 'Adam',
                  'learning_rate': '0.001',
                  'activation_functions': []}


@app.after_request
def cors(environ):
    environ.headers['Acess-Control-Allow-Origin']='*'
    environ.headers['Acess-Control-Allow-Method']='*'
    environ.headers['Acess-Control-Allow-Headers']='x-requested-with,content-type'
    return environ

@app.route('/', methods=['POST', 'GET'])
def index():
    PDE_type['input'] = '1DoT'
    PDE_type['output'] = '1'
    PDE_type['parameter'] = '1'
    PDE_vars['PDE_equs'] = []
    PDE_vars['PDE_vars'] = None
    Hyper_settings['layers'] = [1, 1]
    Hyper_settings['epochs'] = '1'
    Hyper_settings['steps'] = '1'
    Hyper_settings['optimizer'] = 'Adam'
    Hyper_settings['learning_rate'] = '0.001'
    Hyper_settings['activation_functions'] = []
    return render_template("index.html", reload = time.time())

@app.route('/server_log', methods=['POST', 'GET'])
def server_log():
    if request.method == 'POST':
        with open("log.log", 'r') as log_file:
            if log_len != len(log_file.readlines()):
                with open("log.log", 'r') as log_file:
                    return {"change": "T", "data": log_file.read().replace('\x08','')}
            else:
                return {"change": "F"}
            

@app.route('/server1', methods=['POST', 'GET'])
def server1():
    if request.method == 'POST':
        with open('./temps/pa.json',"r") as f:
            data = json.load(f)
        return jsonify(data)
    
@app.route('/server2', methods=['POST', 'GET'])
def server2():
    if request.method == 'POST':
        with open('./temps/data1_.json',"r") as f:
            data1 = json.load(f)
        with open('./temps/losses.json',"r") as f:
            data2 = json.load(f)
        return jsonify({"epoch": 100, "data1": data1, "data2": data2})
    
@app.route('/server3', methods=['POST', 'GET'])
def server3():
    if request.method == 'POST':
        request.files.get('upfile').save(os.path.join('temp', 'data.csv'))
        if check_csv(PDE_type , './temp/data.csv'):
            return "good"
        else:
            return "bad"
    
@app.route('/server4', methods=['POST', 'GET'])
def server4():
    # import ela_pinn_sm
    if request.method == 'POST':
        if request.args.get('input'):
            PDE_type['input'] = request.args.get('input')
        if request.args.get('output'):
            PDE_type['output'] = request.args.get('output')
        if request.args.get('parameter'):
            PDE_type['parameter'] = request.args.get('parameter')
        if PDE_type['input'] == '1DoT':
            Hyper_settings['layers'] = [1, int(PDE_type['output'])]
        elif PDE_type['input'] == '2DoT' or PDE_type['input'] == '1DwT':
            Hyper_settings['layers'] = [2, int(PDE_type['output'])]
        elif PDE_type['input'] == '3DoT' or PDE_type['input'] == '2DwT':
            Hyper_settings['layers'] = [3, int(PDE_type['output'])]
        elif PDE_type['input'] == '3DwT':
            Hyper_settings['layers'] = [4, int(PDE_type['output'])]
        return {'layers': Hyper_settings['layers']}
    
@app.route('/server5', methods=['POST', 'GET'])
def server5():
    if request.method == 'POST':
        PDE_vars['PDE_vars'] = PDE_vars_list(PDE_type)
        return jsonify({'vars': PDE_tp2var(PDE_type, varO=False), 'in_type': PDE_type['input'], 'rows': pd.read_csv('./temp/data.csv').to_dict('records')})
    
@app.route('/server6', methods=['POST', 'GET'])
def server6():
    if request.method == 'POST':
        if request.args.get('der_act') == 'add':
            PDE_vars['PDE_vars'].add_derivative(request.args.get('der_var'), request.args.get('up_var'), request.args.get('down_var'))
            return PDE_vars['PDE_vars'].to_formula('D' + request.args.get('der_var')[10:])
        else:
            PDE_vars['PDE_vars'].sub_derivative()
            return "good"
        
@app.route('/server7', methods=['POST', 'GET'])
def server7():
    if request.method == 'POST':
        if request.args.get('equ_act') == 'add':
            PDE_vars['PDE_equs'].append('Loss' + str(len(PDE_vars['PDE_equs']) + 1) + ' = tf.abs(' + request.form.get('equ_equ') + ')')
            print(pde_code(PDE_vars['PDE_vars'], PDE_vars['PDE_equs']))
            return equation_show(request.form.get('equ_equ'), PDE_vars['PDE_vars'])
        else:
            PDE_vars['PDE_equs'].pop(-1)
            return "good"
        
@app.route('/server8', methods=['POST', 'GET'])
def server8():
    if request.method == 'POST':
        if request.args.get('exa_act') == 'new':
            text = 'import numpy as np\nimport scipy\n'
            for o in range(int(PDE_type['output'])):
                text += '\ndef output' + str(o+1) + '(x):\n    return 0*x\n'
            with open('./temp/exa_sol.py', 'w') as f:
                f.write(text)
            return {'isgood': 'good', 'text': text}
        if request.args.get('exa_act') == 'open':
            with open('./temp/exa_sol.py', 'w') as f:
                f.write('')
            request.files.get('upfile').save(os.path.join('temp', 'exa_sol.py'))
            from temp import exa_sol
            try:
                importlib.reload(exa_sol)
            except:
                return {'isgood': 'bad'}
            else:
                with open('./temp/exa_sol.py', 'r') as f:
                    text = f.read()
                return {'isgood': 'good', 'text': text}
        if request.args.get('exa_act') == 'save':
            text = request.form['text']
            with open('./temp/exa_sol.py', 'w') as f:
                f.write(text)
            try:
                from temp import exa_sol
                importlib.reload(exa_sol)
            except:
                return {'isgood': 'bad'}
            else:
                return {'isgood': 'good', 'text': text}
            
@app.route('/server9', methods=['POST', 'GET'])
def server9():
    if request.method == 'POST':
        isgood = "bad"
        if request.args.get('lyr_act') == 'add':
            Hyper_settings['layers'] = Hyper_settings['layers'][:-1] + [int(request.args.get('new_layer'))] + Hyper_settings['layers'][-1:]
            isgood = "good"
        elif len(Hyper_settings['layers']) > 2:
            Hyper_settings['layers'] = Hyper_settings['layers'][:-2] + Hyper_settings['layers'][-1:]
            isgood = "good"
        return {'layers': Hyper_settings['layers'], 'isgood': isgood}
    
@app.route('/server10', methods=['POST', 'GET'])
def server10():
    if request.method == 'POST':
        Hyper_settings['epochs'] = request.form.get('epoch_num')
        Hyper_settings['steps'] = request.form.get('steps_num')
        Hyper_settings['optimizer'] = request.form.get('optimizer_sel')
        Hyper_settings['learning_rate'] = request.form.get('learning_rate_num')
        Hyper_settings['activation_functions'] = request.form.get('actv_funcs').split(',')
        return request.form.get('actv_funcs')