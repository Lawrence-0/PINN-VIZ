import pandas as pd
import numpy as np
import tensorflow as tf
import time
import os
import sys
import json
original_stdout = sys.stdout
sys.stdout = open('log.log', 'a')


optimizers = {
    'Adadelta': tf.keras.optimizers.Adadelta,
    'Adagrad': tf.keras.optimizers.Adagrad,
    'Adam': tf.keras.optimizers.Adam,
    'Adamax': tf.keras.optimizers.Adamax,
    'Ftrl': tf.keras.optimizers.Ftrl,
    'Nadam': tf.keras.optimizers.Nadam,
    'Optimizer': tf.keras.optimizers.Optimizer,
    'RMSprop': tf.keras.optimizers.RMSprop,
    'SGD': tf.keras.optimizers.SGD
    }

actv_funcs = [
    'deserialize',
    'elu',
    'exponential',
    'gelu',
    'get',
    'hard_sigmoid',
    'linear',
    'relu',
    'selu',
    'serialize',
    'sigmoid',
    'softmax',
    'softplus',
    'softsign',
    'swish',
    'tanh'
    ]

def model_train(PDE_vars, csv_path, code, layers, epochs, steps_per_epoch, optimizer, learning_rate, actv_func):
    with tf.device("/cpu:0"):
        df = pd.read_csv(csv_path)
        input_tensor = tf.convert_to_tensor(np.asarray(df.loc[:,[x.name for x in list(PDE_vars.input_dict.values()) + list(PDE_vars.parameter_dict.values())]]), dtype=tf.float32)
        output_tensor = tf.convert_to_tensor(np.asarray(df.loc[:,[x.name for x in list(PDE_vars.output_dict.values())]]), dtype=tf.float32)
        class PINN(tf.keras.models.Sequential):
            def __init__(self, pde, rate=1.0):
                super(PINN, self).__init__()
                self.rate = rate
                self.pde = pde
            def call(self, inputs, training=False):
                if training:
                    with tf.GradientTape(persistent=True) as tape:
                        tape.watch(inputs)
                        f_predict = super(PINN, self).call(inputs)
                        phsc_loss = [tf.reduce_mean(p_l) for p_l in self.pde(tape, inputs, f_predict)]
                        self.add_loss(tf.math.multiply(self.rate, phsc_loss[0]))
                        tf.print("[", output_stream='file://temp/loss_tmp.txt')
                        for p_l in phsc_loss[0:]:
                            tf.print(p_l, output_stream='file://temp/loss_tmp.txt')
                            tf.print(", ", output_stream='file://temp/loss_tmp.txt')
                        tf.print("], ", output_stream='file://temp/loss_tmp.txt')
                return super(PINN, self).call(inputs)
        exec(code, globals())
        mypinn = PINN(pde)
        mypinn.add(tf.keras.layers.Dense(layers[1], input_shape=(layers[0],), activation=actv_func[0]))
        for i in range(2, len(layers)-1):
            mypinn.add(tf.keras.layers.Dense(layers[i], activation=actv_func[i-1]))
        mypinn.add(tf.keras.layers.Dense(layers[-1]))
        history_weights = []
        print_weights = tf.keras.callbacks.LambdaCallback(on_epoch_end=lambda batch, logs: history_weights.append([[wght_bias.tolist() for wght_bias in layer.get_weights()] for layer in mypinn.layers]))
        mypinn.summary()
        mypinn.compile(optimizer=optimizers[optimizer](learning_rate=learning_rate), loss='mse')
        tt_loss=[]
        start = time.time()
        with open('temp/loss_tmp.txt', 'w') as f:
            f.write('[')
        for epoch in range(epochs):
            print('Epoch ' + str(epoch))
            with open('temp/loss_tmp.txt', 'a') as f:
                f.write('[')
            history = mypinn.fit(input_tensor, output_tensor, epochs=1, steps_per_epoch=steps_per_epoch, shuffle=True, callbacks = [print_weights])#, print_phsc_loss])
            with open('temp/loss_tmp.txt', 'a') as f:
                f.write('], ')
            tt_loss.append(history.history['loss'][0])
        with open('temp/loss_tmp.txt', 'a') as f:
            f.write(']')
        time_cost = time.time() - start
        with open('temp/loss_tmp.txt', 'r') as f:
            loss_str = f.read().replace('\n', '')
        data1_dict = dict()
        data2_dict = dict()
        exec("data2_dict['loss_list'] = " + loss_str)
        data2_dict['loss_list'] = [[tt_loss[i], tt_loss[i] - data2_dict['loss_list'][i][-1][0]] + data2_dict['loss_list'][i][-1][1:] for i in range(len(tt_loss))]
        data1_dict['structure'] = layers
        data1_dict['history'] = history_weights
        # with open('temp/loss_tmp.txt', 'w') as f:
        #     f.write(str(data2_dict))
        
        jsonString = json.dumps(data1_dict)
        jsonFile = open("./temp/data1.json", "w")
        jsonFile.write(jsonString)
        jsonFile.close()
        
        jsonString = json.dumps(data2_dict['loss_list'])
        jsonFile = open("./temp/data2.json", "w")
        jsonFile.write(jsonString)
        jsonFile.close()
        
        return tt_loss[-1]