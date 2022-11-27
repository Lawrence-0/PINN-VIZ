import numpy as np
import tensorflow as tf
import json

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



def model_pdct(data1, row, ipts, paras, output1):
    layers = [int(row.split('=>')[0])] + [int(x[:x.index('(')]) for x in row.split('=>')[1:-1]] + [int(row.split('=>')[-1])]
    actv_func = [(x[x.index('(')+1: x.index(')')]) for x in row.split('=>')[1:-1]]
    model = tf.keras.models.Sequential()
    model.add(tf.keras.layers.Dense(layers[1], input_shape=(layers[0],), activation=actv_func[0]))
    for i in range(2, len(layers)-1):
        model.add(tf.keras.layers.Dense(layers[i], activation=actv_func[i-1]))
    model.add(tf.keras.layers.Dense(layers[-1]))
    model.summary()
    wght_bias = []
    for lyr in data1["history"][-1]:
        wght_bias += [np.asarray(lyr[0]), np.asarray(lyr[1])]
    model.set_weights(wght_bias)
    if len(ipts) == 4:
        pdct_data = np.concatenate((np.transpose(np.mgrid[ipts[0][0]:ipts[0][1]:21j, ipts[1][0]:ipts[1][1]:21j, ipts[2][0]:ipts[2][1]:21j, ipts[3][0]:ipts[3][1]:21j].reshape(4,21**4)), np.tile(paras, (21**4, 1))), axis=1)
        pdct_rst_flat = model.predict(pdct_data).reshape(21*21*21*21)
        exact_rst_flat = output1(pdct_data).reshape(21*21*21*21)
        error_rst_flat = np.abs(pdct_rst_flat - exact_rst_flat)
        pdct_rst = pdct_rst_flat.reshape(21,21,21,21)
    elif len(ipts) == 3:
        pdct_data = np.concatenate((np.transpose(np.mgrid[ipts[0][0]:ipts[0][1]:21j, ipts[1][0]:ipts[1][1]:21j, ipts[2][0]:ipts[2][1]:21j].reshape(3,21**3)), np.tile(paras, (21**3, 1))), axis=1)
        pdct_rst_flat = model.predict(pdct_data).reshape(21*21*21)
        pdct_rst = pdct_rst_flat.reshape(21,21,21)
    elif len(ipts) == 2:
        pdct_data = np.concatenate((np.transpose(np.mgrid[ipts[0][0]:ipts[0][1]:21j, ipts[1][0]:ipts[1][1]:21j].reshape(2,21**2)), np.tile(paras, (21**2, 1))), axis=1)
        pdct_rst_flat = model.predict(pdct_data).reshape(21*21)
        pdct_rst = pdct_rst_flat.reshape(21,21)
    elif len(ipts) == 1:
        pdct_data = np.concatenate((np.transpose(np.mgrid[ipts[0][0]:ipts[0][1]:21j].reshape(1,21**1)), np.tile(paras, (21**1, 1))), axis=1)
        pdct_rst_flat = model.predict(pdct_data).reshape(21)
        pdct_rst = pdct_rst_flat.reshape(21)
    return pdct_data, pdct_rst_flat, pdct_rst, exact_rst_flat, error_rst_flat