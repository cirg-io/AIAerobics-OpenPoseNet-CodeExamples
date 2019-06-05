
![GIF compilation of the makers](https://space10.io/content/uploads/2019/06/learning-from-machines.gif)

# learning-from-machines-examples
We put togehter some Examples on how to use OpenPoseNet and an KNN classifier. All sketches are basic html and js using processing.js (http://processingjs.org/) and the ml5.js libraray (https://github.com/ml5js). 

The repository includes examples for training KNN classifier Classes with your own poses and creating a prediction model. The prediction models can be saved and later loaded into your application.

## Intelligence of SiIly Walks?

About the Project


## Getting started

!Please run the Examples in Chrome or Safari!


### Example 1 (simpleOpenPoseExample) - OpenPoseNet Example, selecting the most Centered Pose
A basic example on how to use OpenPoseNet for pose detecting. Selecting (Highlighting in red) the most centered pose. 
(We added this feature to get clean training data and don't ending up training our KNN classifier on background noise)

### Example 2 (trainingWithCameraInput) - Training KNN classifier Classes with WebCam input.
Simple interface for training your KNN classifier model with real time webcam data. Easy way to get started and test your ideas.

#### Notes: 
- You should allways train an default class with random movments. we recomand to use class »Z« for this. 
- Just train as many classes as you need, the emtpy ones will not been taken into considereation. Classes are hardcoded, but you can easily change Names and quantity in the code.

### Example 3 (simpleOpenPoseExample) - OpenPoseNet Example, selecting the most Centered Pose
Enables you to train your KNN classifier model with pre-recorded video files. So you can easily try out different setting and combination for the same input data. (No need to dance in front of the camera allday long ;) 

#### Notes: 
- You should allways train an default class with random movments. we recomand to use class »Z« for this. 
- Just train as many classes as you need, the emtpy ones will not been taken into considereation. Classes are hardcoded, but you can easily change Names and quantity in the code.

### Example 4 (poseClassesPrediction) - loading a pretrained model with 3 poses and predicting the representet pose
todo : /



## Get in touch
Feel free to write to digital@space10.io with any questions, ideas or comments you might have.

## Copyleft

The examples are based on the original examples by the ml5.js project: https://github.com/ml5js/ml5-examples

Licensed under the GNU Lesser General Public License. See license.txt for further details.
