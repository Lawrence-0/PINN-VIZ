import pandas as pd
import os


def check_csv(PDE_type, csv_path):
    if PDE_type['input'] == '1DoT':
        good_columns = {'InputX'}
    elif PDE_type['input'] == '2DoT':
        good_columns = {'InputX', 'InputY'}
    elif PDE_type['input'] == '3DoT':
        good_columns = {'InputX', 'InputY', 'InputZ'}
    elif PDE_type['input'] == '1DwT':
        good_columns = {'InputT', 'InputX'}
    elif PDE_type['input'] == '2DwT':
        good_columns = {'InputT', 'InputX', 'InputY'}
    elif PDE_type['input'] == '3DwT':
        good_columns = {'InputT', 'InputX', 'InputY', 'InputZ'}
    for i in range(int(PDE_type['output'])):
        good_columns.add('Output' + str(i+1))
    for i in range(int(PDE_type['parameter'])):
        good_columns.add('Parameter' + str(i+1))
    df = pd.read_csv(csv_path)
    if set(df.columns)==good_columns:
        return True
    else:
        os.remove(csv_path)
        return False

def PDE_tp2var(PDE_type, varI=True, varO=True, varP=True):
    vars = []
    if varI:
        if PDE_type['input'] == '1DoT':
            vars += ['InputX']
        elif PDE_type['input'] == '2DoT':
            vars += ['InputX', 'InputY']
        elif PDE_type['input'] == '3DoT':
            vars += ['InputX', 'InputY', 'InputZ']
        elif PDE_type['input'] == '1DwT':
            vars += ['InputT', 'InputX']
        elif PDE_type['input'] == '2DwT':
            vars += ['InputT', 'InputX', 'InputY']
        elif PDE_type['input'] == '3DwT':
            vars += ['InputT', 'InputX', 'InputY', 'InputZ']
    if varO:
        for i in range(int(PDE_type['output'])):
            vars.append('Output' + str(i+1))
    if varP:
        for i in range(int(PDE_type['parameter'])):
            vars.append('Parameter' + str(i+1))
    return vars

class PDE_DERIVATIVE:
    def __init__(self, der_var, up_var, down_var):
        assert (der_var[:10] == "Derivative") and (der_var[10:].isnumeric())
        assert ((up_var[:6] == "Output") and up_var[6:].isnumeric()) or ((up_var[:10] == "Derivative") and up_var[10:].isnumeric())
        assert (down_var[:5] == "Input") and ((down_var[5:] == "T") or (down_var[5:] == "X") or (down_var[5:] == "Y") or (down_var[5:] == "Z"))
        self.name = der_var
        self.up_var = up_var
        self.down_var = down_var
        self.sht_name = "D" + der_var[10:]
    def formula(self):
        return [self.up_var, self.down_var]
    def formula_sht(self):
        if self.up_var[:6] == "Output":
            return ["O" + self.up_var[6:], "I" + self.down_var[5:]]
        else:
            return ["D" + self.up_var[10:], "I" + self.down_var[5:]]
    def to_pde_code(self, PDE_type):
        I_tmp = PDE_tp2var(PDE_type, varI=True, varO=False, varP=False)
        return self.sht_name + " = tape.gradient(" + self.formula_sht()[0] + ", x)[:, " + str(I_tmp.index(self.formula()[1])) + ":" + str(I_tmp.index(self.formula()[1]) + 1) + "]"

class PDE_INPUT:
    def __init__(self, name):
        assert (name[:5] == "Input") and ((name[5:] == "T") or (name[5:] == "X") or (name[5:] == "Y") or (name[5:] == "Z"))
        self.name = name
        self.sht_name = "I" + name[5:]
    def to_pde_code(self, PDE_type):
        I_tmp = PDE_tp2var(PDE_type, varI=True, varO=False, varP=False)
        return self.sht_name + " = x[:, " + str(I_tmp.index(self.name)) + ":" + str(I_tmp.index(self.name) + 1) + "]"

class PDE_OUTPUT:
    def __init__(self, name):
        assert (name[:6] == "Output") and name[6:].isnumeric()
        self.name = name
        self.sht_name = "O" + name[6:]
    def to_pde_code(self, PDE_type):
        O_tmp = PDE_tp2var(PDE_type, varI=False, varO=True, varP=False)
        return self.sht_name + " = f[:, " + str(O_tmp.index(self.name)) + ":" + str(O_tmp.index(self.name) + 1) + "]"
    
class PDE_PARAMETER:
    def __init__(self, name):
        assert (name[:9] == "Parameter") and name[9:].isnumeric()
        self.name = name
        self.sht_name = "P" + name[9:]
    def to_pde_code(self, PDE_type):
        IP_tmp = PDE_tp2var(PDE_type, varI=True, varO=False, varP=True)
        return self.sht_name + " = x[:, " + str(IP_tmp.index(self.name)) + ":" + str(IP_tmp.index(self.name) + 1) + "]"

class PDE_vars_list:
    def __init__(self, PDE_type):
        self.PDE_type = PDE_type
        self.input_dict = {}
        self.output_dict = {}
        self.parameter_dict = {}
        self.derivative_dict = {}
        I_tmp = PDE_tp2var(PDE_type, varI=True, varO=False, varP=False)
        O_tmp = PDE_tp2var(PDE_type, varI=False, varO=True, varP=False)
        P_tmp = PDE_tp2var(PDE_type, varI=False, varO=False, varP=True)
        for I in I_tmp:
            tmp = PDE_INPUT(I)
            self.input_dict[tmp.sht_name] = tmp
        for O in O_tmp:
            tmp = PDE_OUTPUT(O)
            self.output_dict[tmp.sht_name] = tmp
        for P in P_tmp:
            tmp = PDE_PARAMETER(P)
            self.parameter_dict[tmp.sht_name] = tmp
    def add_derivative(self, der_var, up_var, down_var):
        tmp = PDE_DERIVATIVE(der_var, up_var, down_var)
        self.derivative_dict[tmp.sht_name] = tmp
    def sub_derivative(self):
        self.derivative_dict.popitem()
    def to_pde_code(self):
        rst = "def pde(tape, x, f):"
        for i in self.input_dict.values():
            rst += "\n\t" + i.to_pde_code(self.PDE_type)
        for p in self.parameter_dict.values():
            rst += "\n\t" + p.to_pde_code(self.PDE_type)
        for o in self.output_dict.values():
            rst += "\n\t" + o.to_pde_code(self.PDE_type)
        for d in self.derivative_dict.values():
            rst += "\n\t" + d.to_pde_code(self.PDE_type)
        return rst
    def get_formula(self, sht_name):
        assert (sht_name[0] == 'D') and sht_name[1:].isnumeric()
        fml_sht = self.derivative_dict[sht_name].formula_sht()
        while fml_sht[0][0] == 'D':
            fml_sht = self.derivative_dict[fml_sht[0]].formula_sht() + fml_sht[1:]
        assert fml_sht[0][0] == 'O'
        return [[fml_sht[0], len(fml_sht)-1]] + [[i_name, fml_sht.count(i_name)] for i_name in self.input_dict]
    def to_formula(self, sht_name):
        fml_tmp = self.get_formula(sht_name)
        fml_rst = "$$" + sht_name[0] + "_{" + sht_name[1:] + "}={{\partial"
        if fml_tmp[0][1] > 1:
            fml_rst += "^{" + str(fml_tmp[0][1]) +"}"
        fml_rst += "{" + fml_tmp[0][0][0] + "_{" + fml_tmp[0][0][1:] + "}}}\over{"
        for var in fml_tmp[1:]:
            if var[1] == 1:
                fml_rst += "\partial{" + var[0][0] + "_{" + var[0][1:] + "}}"
            elif var[1] > 1:
                fml_rst += "\partial{{" + var[0][0] + "_{" + var[0][1:] + "}}^{" + str(var[1]) + "}}"
        fml_rst += "}}$$"
        return fml_rst
    
def equation_show(equ_equ, PDE_vars):
    for i in list(PDE_vars.input_dict.keys())[::-1]:
        equ_equ = equ_equ.replace(i, "{I_{" + i[1:] + "}}")
    for o in list(PDE_vars.output_dict.keys())[::-1]:
        equ_equ = equ_equ.replace(o, "{O_{" + o[1:] + "}}")
    for p in list(PDE_vars.parameter_dict.keys())[::-1]:
        equ_equ = equ_equ.replace(p, "{P_{" + p[1:] + "}}")
    for d in list(PDE_vars.derivative_dict.keys())[::-1]:
        equ_equ = equ_equ.replace(d, "{D_{" + d[1:] + "}}")
    return "$$" + equ_equ + "$$"

def pde_code(PDE_vars, PDE_equs):
    rst = PDE_vars.to_pde_code()
    for p in PDE_equs:
        rst += "\n\t" + p
    rst += "\n\treturn [" + (' + ').join(['loss' + str(i) for i in range(1, len(PDE_equs) + 1)]) + ', ' + (', ').join(['loss' + str(i) for i in range(1, len(PDE_equs) + 1)]) + ']'
    return rst