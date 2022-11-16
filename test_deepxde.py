from deepxde.icbc import DirichletBC
from deepxde.geometry.geometry_2d import Polygon
# from tensorflow.keras.backend import set_floatx
from deepxde.callbacks import EarlyStopping
from deepxde.nn import FNN
from deepxde.data.pde import PDE
from deepxde.model import Model
from deepxde.backend import tf
import numpy as np


# set_floatx("float64")


def wall_top_boundary(x, on_boundary):
    """Checks for points on top wall boundary"""
    return on_boundary and np.isclose(x[1], 2.0)


def wall_bottom_boundary(x, on_boundary):
    """Checks for points on bottom wall boundary"""
    return on_boundary and np.isclose(x[1], 0.0)


def wall_mid_horizontal_boundary(x, on_boundary):
    """Check for points on step horizontal boundary"""
    return on_boundary and (np.isclose(x[1], 1.0) and x[0] < 2.0)


def wall_mid_vertical_boundary(x, on_boundary):
    """Check for points on step horizontal boundary"""
    return on_boundary and (x[1] < 1.0 and np.isclose(x[0], 2.0))


def outlet_boundary(x, on_boundary):
    """Implements the outlet boundary with zero y-velocity component"""
    return on_boundary and np.isclose(x[0], 12.0)


def inlet_boundary(x, on_boundary):
    """Implements the inlet boundary with parabolic x-velocity component"""
    return on_boundary and np.isclose(x[0], 0.0)


def parabolic_velocity(x):
    """Parabolic velocity"""
    return (6 * (x[:, 1] - 1) * (2 - x[:, 1])).reshape(-1, 1)


def zero_velocity(x):
    """Zero velocity"""
    return np.zeros((x.shape[0], 1))


def output_transformer(inputs, outputs):
    """Apply output transforms to strictly enforce boundary conditions"""

    top_line = inputs[:, 1] - 2.0
    bottom_line = inputs[:, 1]
    mid_hor_line = inputs[:, 1] - 1.0
    mid_ver_line = inputs[:, 0] - 2.0
    outlet_line = inputs[:, 0] - 12.0
    inlet_line = inputs[:, 0]
    # velocity_profile = 6.0 * (inputs[:, 1] - 1.0) * (2.0 - inputs[:, 1])
    velocity_profile = 1.0

    u_multiplier = (top_line * bottom_line * mid_hor_line * mid_ver_line *
                    velocity_profile)
    v_multiplier = (top_line * bottom_line * mid_hor_line * mid_ver_line *
                    outlet_line * inlet_line)
    p_multiplier = 1.0

    return tf.transpose(
        tf.stack((
            u_multiplier * outputs[:, 0],
            v_multiplier * outputs[:, 1],
            p_multiplier * outputs[:, 2]
        ))
    )


def navier_stokes(x, y):
    """Navier-Stokes equation"""
    rho = 1.0
    nu = 0.01
    eps = 1e-8

    u, v, p = y[:, 0:1], y[:, 1:2], y[:, 2:3]

    du = tf.gradients(u, x)[0]
    dv = tf.gradients(v, x)[0]
    dp = tf.gradients(p, x)[0]

    p_x, p_y = dp[:, 0:1], dp[:, 1:2]
    u_x, u_y = du[:, 0:1], du[:, 1:2]
    v_x, v_y = dv[:, 0:1], dv[:, 1:2]

    u_xx = tf.gradients(u_x, x)[0][:, 0:1]
    u_yy = tf.gradients(u_y, x)[0][:, 1:2]

    v_xx = tf.gradients(v_x, x)[0][:, 0:1]
    v_yy = tf.gradients(v_y, x)[0][:, 1:2]

    continuity = u_x + v_y + eps * p
    x_momentum = u * u_x + v * u_y + 1 / rho * p_x - nu * (u_xx + u_yy)
    y_momentum = u * v_x + v * v_y + 1 / rho * p_y - nu * (v_xx + v_yy)

    return [continuity, x_momentum, y_momentum]


if __name__ == '__main__':
    """
    Geometry
    --------
             (0, 2)       (12, 2)
              *------------*
        in -> |            |
        (0, 1)*--*(2,1)    . -> out
                 |         |
            (2,0)*---------*(12, 0)
    """
    geom = Polygon([
        [0.0, 2.0], [12.0, 2.0], [12.0, 0.0], [2.0, 0.0], [2.0, 1.0],
        [0.0, 1.0]
    ])

    inlet_x = DirichletBC(geom, parabolic_velocity, inlet_boundary,
                          component=0)
    inlet_y = DirichletBC(geom, zero_velocity, inlet_boundary, component=1)
    outlet = DirichletBC(geom, zero_velocity, outlet_boundary, component=1)
    wallt_x = DirichletBC(geom, zero_velocity, wall_top_boundary, component=0)
    wallt_y = DirichletBC(geom, zero_velocity, wall_top_boundary, component=1)
    wallb_x = DirichletBC(geom, zero_velocity, wall_bottom_boundary,
                          component=0)
    wallb_y = DirichletBC(geom, zero_velocity, wall_bottom_boundary,
                          component=1)
    wallsh_x = DirichletBC(geom, zero_velocity, wall_mid_horizontal_boundary,
                           component=0)
    wallsh_y = DirichletBC(geom, zero_velocity, wall_mid_horizontal_boundary,
                           component=1)
    wallsv_x = DirichletBC(geom, zero_velocity, wall_mid_vertical_boundary,
                           component=0)
    wallsv_y = DirichletBC(geom, zero_velocity, wall_mid_vertical_boundary,
                           component=1)

    data = PDE(
        geom, navier_stokes,
        [inlet_x, inlet_y, outlet, wallt_x, wallt_y, wallb_x,
         wallb_x, wallsh_x, wallsh_y, wallsv_x, wallsv_y], num_domain=10000,
        num_boundary=10000, num_test=10000
    )

    layer_size = [2] + [50] * 6 + [3]
    net = FNN(layer_size, "tanh", "Glorot uniform")
    # net.apply_output_transform(output_transformer)

    model = Model(data, net)
    model.compile("adam", lr=0.001)

    early_stopping = EarlyStopping(min_delta=1e-8, patience=40000)
    model.train(epochs=80000, display_every=1000, callbacks=[early_stopping],
                disregard_previous_best=True)