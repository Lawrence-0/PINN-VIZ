import tensorflow as tf
import numpy as np
import plotly.express as px
from tensorflow import keras
import json
import os
import time
import sys
original_stdout = sys.stdout
sys.stdout = open('log.log', 'a')

code = "def pde(tape, x, f):\n\tUx = f[:, 0:1]\n\tUy = f[:, 1:2]\n\tExx = f[:, 2:3]\n\tExy = f[:, 3:4]\n\tEyy = f[:, 4:5]\n\tSxx = f[:, 5:6]\n\tSxy = f[:, 6:7]\n\tSyy = f[:, 7:8]\n\tFx = f[:, 8:9]\n\tFy = f[:, 9:10]\n\tUx_x = tape.gradient(Ux, x)[:, 0:1]\n\tUx_y = tape.gradient(Ux, x)[:, 0:2]\n\tUy_x = tape.gradient(Uy, x)[:, 0:1]\n\tUy_y = tape.gradient(Uy, x)[:, 0:2]\n\tSxx_x = tape.gradient(Sxx, x)[:, 0:1]\n\tSxy_x = tape.gradient(Sxy, x)[:, 0:1]\n\tSxy_y = tape.gradient(Sxy, x)[:, 0:2]\n\tSyy_y = tape.gradient(Syy, x)[:, 0:2]\n\tLoss1 = tf.abs(Sxx_x + Sxy_y + Fx)\n\tLoss2 = tf.abs(Sxy_x + Syy_y + Fy)\n\tLoss3 = tf.abs(Sxy - 2 * x[:, 3:4] * Exy)\n\tLoss4 = tf.abs(Sxx - x[:, 2:3] * Exx - x[:, 2:3] * Eyy - 2 * x[:, 3:4] * Exx)\n\tLoss5 = tf.abs(Syy - x[:, 2:3] * Exx - x[:, 2:3] * Exx - 2 * x[:, 3:4] * Eyy)\n\tLoss6 = tf.abs(Exx - Ux_x)\n\tLoss7 = tf.abs(Eyy - Uy_y)\n\tLoss8 = tf.abs(Exy - Ux_y / 2 - Uy_x / 2)\n\treturn [Loss1 + Loss2 + Loss3 + Loss4 + Loss5 + Loss6 + Loss7 + Loss8, Loss1, Loss2, Loss3, Loss4, Loss5, Loss6, Loss7, Loss8]"




def train_save(Nx,Ny,N_lambd,N_mu,N_Q,Max_lambd,Min_lambd,Max_mu,Min_mu,Max_Q,Min_Q,layers,epochs,steps_per_epoch):

    def u_x(x, y, lambd=1, mu=0.5, Q=4):
        return np.cos(2*np.pi*x)*np.sin(np.pi*y)
    def u_y(x, y, lambd=1, mu=0.5, Q=4):
        return np.sin(np.pi*x)*Q*y**4/4
    def epsilon_xx(x, y, lambd=1, mu=0.5, Q=4):
        return -2*np.pi*np.sin(2*np.pi*x)*np.sin(np.pi*y)
    def epsilon_xy(x, y, lambd=1, mu=0.5, Q=4):
        return np.pi/2*np.cos(2*np.pi*x)*np.cos(np.pi*y)+np.pi/2*np.cos(np.pi*x)*Q*y**4/4
    def epsilon_yy(x, y, lambd=1, mu=0.5, Q=4):
        return np.sin(np.pi*x)*Q*y**3
    def sigma_xx(x, y, lambd=1, mu=0.5, Q=4):
        return -lambd*2*np.pi*np.sin(2*np.pi*x)*np.sin(np.pi*y)+lambd*np.sin(np.pi*x)*Q*y**3-mu*4*np.pi*np.sin(2*np.pi*x)*np.sin(np.pi*y)
    def sigma_xy(x, y, lambd=1, mu=0.5, Q=4):
        return mu*np.pi*np.cos(2*np.pi*x)*np.cos(np.pi*y)+mu*np.pi*np.cos(np.pi*x)*Q*y**4/4
    def sigma_yy(x, y, lambd=1, mu=0.5, Q=4):
        return -lambd*2*np.sin(2*np.pi*x)*np.sin(np.pi*y)+lambd*np.sin(np.pi*x)*Q*y**3+mu*2*np.sin(np.pi*x)*Q*y**3
    def f_x(x, y, lambd=1, mu=0.5, Q=4):
        return lambd*4*np.pi**2*np.cos(2*np.pi*x)*np.sin(np.pi*y)-lambd*np.pi*np.cos(np.pi*x)*Q*y**3+mu*9*np.cos(2*np.pi*x)*np.sin(np.pi*y)-mu*np.pi*np.cos(np.pi*x)*Q*y**3
    def f_y(x, y, lambd=1, mu=0.5, Q=4):
        return -lambd*3*np.sin(np.pi*x)*Q*y**2+lambd*2*np.pi**2*np.sin(2*np.pi*x)*np.cos(np.pi*y)-mu*6*np.sin(np.pi*x)*Q*y**2+mu*2*np.pi**2*np.sin(2*np.pi*x)*np.cos(np.pi*y)+mu*np.pi**2*np.sin(np.pi*x)*Q*y**4/4

    input_np = np.asarray([[x, y, lambd, mu, Q] for Q in np.arange(Min_Q,Max_Q+(Max_Q-Min_Q)/(N_Q-1),(Max_Q-Min_Q)/(N_Q-1)) for mu in np.arange(Min_mu,Max_mu+(Max_mu-Min_mu)/(N_mu-1),(Max_mu-Min_mu)/(N_mu-1)) for lambd in np.arange(Min_lambd,Max_lambd+(Max_lambd-Min_lambd)/(N_lambd-1),(Max_lambd-Min_lambd)/(N_lambd-1)) for y in np.arange(1/Ny,1+1/Ny,1/Ny) for x in np.arange(1/Nx,1+1/Nx,1/Nx)])

    def mkdata(lambd=1, mu=0.5, Q=4):
        xy=np.asarray([[x,y] for y in np.arange(1/Ny,1+1/Ny,1/Ny) for x in np.arange(1/Nx,1+1/Nx,1/Nx)])
        ux=u_x(xy[:,0],xy[:,1], lambd, mu, Q).reshape(Nx*Ny,1)
        uy=u_y(xy[:,0],xy[:,1], lambd, mu, Q).reshape(Nx*Ny,1)
        exx=epsilon_xx(xy[:,0],xy[:,1], lambd, mu, Q).reshape(Nx*Ny,1)
        exy=epsilon_xy(xy[:,0],xy[:,1], lambd, mu, Q).reshape(Nx*Ny,1)
        eyy=epsilon_yy(xy[:,0],xy[:,1], lambd, mu, Q).reshape(Nx*Ny,1)
        sxx=sigma_xx(xy[:,0],xy[:,1], lambd, mu, Q).reshape(Nx*Ny,1)
        sxy=sigma_xy(xy[:,0],xy[:,1], lambd, mu, Q).reshape(Nx*Ny,1)
        syy=sigma_yy(xy[:,0],xy[:,1], lambd, mu, Q).reshape(Nx*Ny,1)
        fx=f_x(xy[:,0],xy[:,1], lambd, mu, Q).reshape(Nx*Ny,1)
        fy=f_y(xy[:,0],xy[:,1], lambd, mu, Q).reshape(Nx*Ny,1)
        return np.concatenate((ux, uy, exx, exy, eyy, sxx, sxy, syy, fx, fy), axis=1)
    
    lambd_mu_Q = np.asarray([[lambd, mu, Q] for Q in np.arange(Min_Q,Max_Q+(Max_Q-Min_Q)/(N_Q-1),(Max_Q-Min_Q)/(N_Q-1)) for mu in np.arange(Min_mu,Max_mu+(Max_mu-Min_mu)/(N_mu-1),(Max_mu-Min_mu)/(N_mu-1)) for lambd in np.arange(Min_lambd,Max_lambd+(Max_lambd-Min_lambd)/(N_lambd-1),(Max_lambd-Min_lambd)/(N_lambd-1))])

    output = mkdata(lambd_mu_Q[0][0], lambd_mu_Q[0][1], lambd_mu_Q[0][2]).reshape(1,Nx*Ny*10)
    for lmq in lambd_mu_Q[1:]:
        print(lmq)
        output = np.concatenate((output, mkdata(lmq[0], lmq[1], lmq[2]).reshape(1,Nx*Ny*10)), axis=0)

    print(output)
    
    
    with tf.device("/cpu:0"):
        output_np = output.reshape(Nx*Ny*N_lambd*N_mu*N_Q,10)
        output_tensor = tf.convert_to_tensor(output_np, dtype=tf.float32)
        input_tensor = tf.convert_to_tensor(input_np, dtype=tf.float32)

        print(input_tensor.shape)
        print(output_tensor.shape)
        
        # def pde(tape, x, f):
        #     Ux = f[:, 0:1]
        #     Uy = f[:, 1:2]
        #     Exx = f[:, 2:3]
        #     Exy = f[:, 3:4]
        #     Eyy = f[:, 4:5]
        #     Sxx = f[:, 5:6]
        #     Sxy = f[:, 6:7]
        #     Syy = f[:, 7:8]
        #     Fx = f[:, 8:9]
        #     Fy = f[:, 9:10]
        #     Ux_x = tape.gradient(Ux, x)[:, 0:1]
        #     Ux_y = tape.gradient(Ux, x)[:, 0:2]
        #     Uy_x = tape.gradient(Uy, x)[:, 0:1]
        #     Uy_y = tape.gradient(Uy, x)[:, 0:2]
        #     Sxx_x = tape.gradient(Sxx, x)[:, 0:1]
        #     Sxy_x = tape.gradient(Sxy, x)[:, 0:1]
        #     Sxy_y = tape.gradient(Sxy, x)[:, 0:2]
        #     Syy_y = tape.gradient(Syy, x)[:, 0:2]
        #     Loss1 = tf.abs(Sxx_x + Sxy_y + Fx)
        #     Loss2 = tf.abs(Sxy_x + Syy_y + Fy)
        #     Loss3 = tf.abs(Sxy - 2 * x[:, 3:4] * Exy)
        #     Loss4 = tf.abs(Sxx - x[:, 2:3] * Exx - x[:, 2:3] * Eyy - 2 * x[:, 3:4] * Exx)
        #     Loss5 = tf.abs(Syy - x[:, 2:3] * Exx - x[:, 2:3] * Exx - 2 * x[:, 3:4] * Eyy)
        #     Loss6 = tf.abs(Exx - Ux_x)
        #     Loss7 = tf.abs(Eyy - Uy_y)
        #     Loss8 = tf.abs(Exy - Ux_y / 2 - Uy_x / 2)
        #     return [Loss1 + Loss2 + Loss3 + Loss4 + Loss5 + Loss6 + Loss7 + Loss8, Loss1, Loss2, Loss3, Loss4, Loss5, Loss6, Loss7, Loss8]

        exec(code, globals())

        MyAdam = tf.keras.optimizers.Adam(
            learning_rate=0.001,
            name='Adam'
        )

        class PINN(keras.models.Sequential):
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
                        tf.print("epochTag", output_stream='file://temp1.txt')
                        for p_l in phsc_loss[1:]:
                            tf.print("lossTag", output_stream='file://temp1.txt')
                            tf.print(p_l, output_stream='file://temp1.txt')
                return super(PINN, self).call(inputs)
        mypinn = PINN(pde)
        mypinn.add(tf.keras.layers.Dense(layers[0], input_shape=(5,), activation="relu"))
        for layer in layers[1:]:
            mypinn.add(tf.keras.layers.Dense(layer, activation="relu"))
        mypinn.add(tf.keras.layers.Dense(10))
        
        history_weights = []
        print_weights = keras.callbacks.LambdaCallback(on_epoch_end=lambda batch, logs: history_weights.append([[wght_bias.tolist() for wght_bias in layer.get_weights()] for layer in mypinn.layers]))

        mypinn.summary()
        mypinn.compile(optimizer=MyAdam, loss='mse')
        
        print(time.asctime(time.localtime(time.time())))
        
        his=[]
        for _ in range(epochs):
            history = mypinn.fit(input_tensor, output_tensor, epochs=1, steps_per_epoch=steps_per_epoch, shuffle=True, callbacks = [print_weights])
            his.append(history.history['loss'][0])
        phsc_his = [[float(x) for x in t.split('lossTag')[1:]] for t in open("temp1.txt","r").read().replace('\n','').split('epochTag')[1:]]
        os.remove('temp1.txt')
        
        print(time.asctime(time.localtime(time.time())))
        
        jsonString = json.dumps({"loss": his, "physical_loss": phsc_his})
        jsonFile = open("loss1.json", "w")
        jsonFile.write(jsonString)
        jsonFile.close()
        
        jsonString = json.dumps({"structure": layers, "history": history_weights})
        jsonFile = open("data1_.json", "w")
        jsonFile.write(jsonString)
        jsonFile.close()
        
    return his, mypinn
        
        





train_save(10,10,11,11,11,2,1,2,1,2,1,[50,50,50],1000,10)

sys.stdout = original_stdout