# PINN-VIZ

This is a visualization system program for PINN (Physics-informed neural network) surrogate model. Users could use this tool to create and train their PINN models here.

## Introduction

TechStack: Flask (python), Javascript (jquery, d3, plotly), TensorFlow.

### Run code

'flask run' in root directory.

Welcome to Flask: https://flask.palletsprojects.com/en/2.2.x/.

### Manual

Demo video: https://www.youtube.com/watch?v=cDsAVo_EAo4.

#### Overview of the system

![](pictures_for_readme/2023-02-09-16-29-35.png)

#### Step 1.1:

![](pictures_for_readme/2023-02-09-16-30-57.png)

1. Select the type of equations.
2. Set number of Outputs.
3. Set number of Parameters.

#### Step 1.2:

![](pictures_for_readme/2023-02-09-16-32-59.png)

1. 'Data' button to select the local '.csv' file.
![](pictures_for_readme/2023-02-09-16-36-13.png)
2. 'Upload' button to check if the file is valid and then upload.
3. 'Analyze' button to show the distribution of the data.

#### Step 1.3:

![](pictures_for_readme/2023-02-09-16-37-02.png)

Use outputs/inputs/lower order derivative term to make higher order derivative term

#### Step 1.4:

![](pictures_for_readme/2023-02-09-16-41-27.png)

Make PDE(s)

#### Step 1.5:

![](pictures_for_readme/2023-02-09-16-42-18.png)

Set weights on PDE(s)

#### Step 1.6:

![](pictures_for_readme/2023-02-09-16-45-21.png)

Set exact solution for later comparison. (optional)

#### Step 2.1:

![](pictures_for_readme/2023-02-09-16-47-30.png)

1. Add/delete layer by setting the number of neurons, to change the structure of networks.
2. Define the epochs / batches / optimizer / learning rate and activation function for each layer.

#### Step 2.2:

![](pictures_for_readme/2023-02-09-16-50-52.png)

Terminal style window to show the training process.

'Switch' Button

![](pictures_for_readme/2023-02-09-16-51-48.png)

Information of the exiting trained model in database.

#### Step 2.3

![](pictures_for_readme/2023-02-09-16-53-58.png)

Show the 2D mapping result with TSNE dimensionality reduction for structures (position). Color shows the final loss value (the darker the smaller).

#### Step 2.4:

![](pictures_for_readme/2023-02-09-16-54-59.png)

1. Check the checkbox in the database to add the model structure and final loss into the parallel chart comparison.
2. Mouseover or click on the model while highlight them in the parallel chart and 2D mappings with the same color.

#### Step 3.1:

Choose a certain model.

![](pictures_for_readme/2023-02-09-16-56-29.png)

Structure visualization (network style)

'Switch' Button

![](pictures_for_readme/2023-02-09-16-57-07.png)

Structure visualization (matrix style)

#### Step 3.2:

![](pictures_for_readme/2023-02-09-16-58-18.png)

Loss(es) change.

#### Step 3.3:

![](pictures_for_readme/2023-02-09-16-59-14.png)

Set parameters to make the PINN surrogate model predict, and then compare with exact solution.

