import numpy as np
import scipy

def output1(x):
    return (
    (4 * x[:, 0:1] + 1) ** (-3/2) 
    * np.exp(- (x[:, 1:2] - x[:, 4:5] * x[:, 0:1] - x[:, 10:11]) ** 2 / x[:, 7:8] / (4 * x[:, 0:1] + 1) 
            - (x[:, 2:3] - x[:, 5:6] * x[:, 0:1] - x[:, 11:12]) ** 2 / x[:, 8:9] / (4 * x[:, 0:1] + 1) 
            - (x[:, 3:4] - x[:, 6:7] * x[:, 0:1] - x[:, 12:13]) ** 2 / x[:, 9:10] / (4 * x[:, 0:1] + 1)))
ipts = [[0.0, 1.0], [0.0, 1.1], [0.0, 1.2], [0.0, 1.4]]
paras = [0, 0, 0, 1, 1, 1, 0.5, 0.5, 0.5]
exec('pdct_data = np.concatenate((np.transpose(np.mgrid[' + ','.join([str(x[0])+':'+str(x[1])+':21j' for x in ipts]) + '].reshape(' + str(len(ipts)) + ',21**' + str(len(ipts)) + ')), np.tile(paras, (21**' + str(len(ipts)) + ', 1))), axis=1)')
print(pdct_data)

print(output1(pdct_data))