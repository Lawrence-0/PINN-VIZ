import numpy as np
from scipy.special import erfc

def output1(x):
    C = 0.5
    D = 1 / 14
    # return x[:, 2:3] * (0.5 * np.exp(C*x[:, 0:1] / (2 * D))*(np.exp(-C * x[:, 0:1]/(2 * D)) * erfc((x[:, 0:1] - C * x[:, 1:2])/(2 * np.sqrt(D * x[:, 1:2])))+(np.exp(C * x[:, 0:1]/(2 * D)) * erfc((x[:, 0:1] + C * x[:, 1:2]) / (2 * np.sqrt(D * x[:, 1:2]))))))
    return x[:, 2:3] * 0
