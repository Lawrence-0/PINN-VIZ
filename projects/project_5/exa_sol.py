import numpy as np
import scipy

def output1(x):
    return (
    (4 * x[:, 0:1] + 1) ** (-3/2) 
    * np.exp(- (x[:, 1:2] - 0.5) ** 2 / (4 * x[:, 0:1] + 1) 
            - (x[:, 2:3] - 0.5) ** 2 / (4 * x[:, 0:1] + 1) 
            - (x[:, 3:4] - 0.5) ** 2 / (4 * x[:, 0:1] + 1)))
