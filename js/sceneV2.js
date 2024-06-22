
var gl; 
var canvas; 
var shadersProgram; 
var vertexPositionAttributePointer; 
var vertexColorAttributePointer;
var verticesTransformUniformPointer; 
var perspectiveViewUniformPointer;
var vertexBuffer;
var colorBuffer; 
var indexBuffer; 
var translationMatrix = new Float32Array(16);
// Scaling and translation matrices
var scaleMatrix = new Float32Array(16);
var finalMatrix = new Float32Array(16);

var perspectiveMatrix = new Float32Array(16);// perspective Matrix
var viewMatrix = new Float32Array(16); // position of camera
var pvMatrix = new Float32Array(16); // product of perspectiveMatrix and viewMatrix

var colorBuffers = {}; // Object to hold multiple color buffers

function createGLContext(inCanvas) {
	var outContext = null;
	outContext = inCanvas.getContext("webgl");
		if (!outContext)
			outContext = inCanvas.getContext("experimental-webgl"); 
		if (!outContext) 
			alert("WebGL rendering context creation error.");
 
	return outContext;
}

function createCompileShader(shaderType, shaderSource) {
	var outShader = gl.createShader(shaderType);
	gl.shaderSource(outShader, shaderSource); 
	gl.compileShader(outShader); 
	if (!gl.getShaderParameter(outShader, gl.COMPILE_STATUS)) { 
		alert( "Shader compilation error. " + gl.getShaderInfoLog(outShader) ); 
		gl.deleteShader(outShader);
		outShader = null;
	}
	return outShader;
}

function initShaders() {
	var vertexShaderSource = document.getElementById("vShader").textContent; 
	var fragmentShaderSource = document.getElementById("fShader").textContent; 
	var vertexShader = createCompileShader(gl.VERTEX_SHADER, vertexShaderSource); 
	var fragmentShader = createCompileShader(gl.FRAGMENT_SHADER, fragmentShaderSource); 
	shadersProgram = gl.createProgram(); 
	gl.attachShader(shadersProgram, vertexShader); 
	gl.attachShader(shadersProgram, fragmentShader); 
	gl.linkProgram(shadersProgram); 
	if (!gl.getProgramParameter(shadersProgram, gl.LINK_STATUS)) { 
		alert("Shaders linking error.");
	}
	gl.useProgram(shadersProgram); 
	vertexPositionAttributePointer = 	gl.getAttribLocation(shadersProgram, "aVertexPosition"); 
	gl.enableVertexAttribArray(vertexPositionAttributePointer); 
	vertexColorAttributePointer = gl.getAttribLocation(shadersProgram, "aVertexColor"); 
	gl.enableVertexAttribArray(vertexColorAttributePointer); 
	verticesTransformUniformPointer = gl.getUniformLocation(shadersProgram, "uVerticesTransform"); 
    //Save in the new uniform pointer the address of uPerspectiveViewTransform
    perspectiveUniformPointer = gl.getUniformLocation(shadersProgram, "uPerspectiveViewTransform"); 
}

function createShadesForCube(R,G,B)
{
    R = parseFloat(R);G = parseFloat(G);B = parseFloat(B);
    var colorShades = new Float32Array([
        // Front face 
        R, G, B, 1.0,  // Vertex 0
        R, G, B, 1.0,  // Vertex 1
        R, G, B, 1.0,  // Vertex 2 
        R, G, B, 1.0,  // Vertex 3

        // Back face
        R, G, B, 0.2,  // Vertex 4 
        R, G, B, 0.2,  // Vertex 5 
        R, G, B, 0.2,  // Vertex 6 
        R, G, B, 0.2,  // Vertex 7

        // Top face
        R, G, B, 0.8,  // Vertex 8 
        R, G, B, 0.8,  // Vertex 9 
        R, G, B, 0.8,  // Vertex 10 
        R, G, B, 0.8,  // Vertex 11

        // Bottom face 
        R, G, B, 0.4,  // Vertex 12 
        R, G, B, 0.4,  // Vertex 13 
        R, G, B, 0.4,  // Vertex 14 
        R, G, B, 0.4,  // Vertex 15 

        // Right face
        R, G, B, 0.3,  // Vertex 16 
        R, G, B, 0.3,  // Vertex 17 
        R, G, B, 0.3,  // Vertex 18 
        R, G, B, 0.3,  // Vertex 19

        // Left face 
        R, G, B, 0.6,  // Vertex 20 
        R, G, B, 0.6,  // Vertex 21 
        R, G, B, 0.6,  // Vertex 22
        R, G, B, 0.6  // Vertex 23 
    ]);
    return colorShades;
    
}

function initBuffers() {
    var cubeVertices = new Float32Array([
        // Front face
        1.0,  1.0,  1.0, 1.0,  // Vertex 0
        -1.0,  1.0,  1.0, 1.0,  // Vertex 1
        -1.0, -1.0,  1.0, 1.0,  // Vertex 2
        1.0, -1.0,  1.0, 1.0,  // Vertex 3
        // Back face
        1.0,  1.0, -1.0, 1.0,  // Vertex 4
        -1.0,  1.0, -1.0, 1.0,  // Vertex 5
        -1.0, -1.0, -1.0, 1.0,  // Vertex 6
        1.0, -1.0, -1.0, 1.0,  // Vertex 7
        // Top face
        1.0,  1.0, -1.0, 1.0,  // Vertex 8
        -1.0,  1.0, -1.0, 1.0,  // Vertex 9
        -1.0,  1.0,  1.0, 1.0,  // Vertex 10
        1.0,  1.0,  1.0, 1.0,  // Vertex 11
        // Bottom face
        1.0, -1.0,  1.0, 1.0,  // Vertex 12
        -1.0, -1.0,  1.0, 1.0,  // Vertex 13
        -1.0, -1.0, -1.0, 1.0,  // Vertex 14
        1.0, -1.0, -1.0, 1.0,  // Vertex 15
        // Right face
        1.0,  1.0, -1.0, 1.0,  // Vertex 16
        1.0,  1.0,  1.0, 1.0,  // Vertex 17
        1.0, -1.0,  1.0, 1.0,  // Vertex 18
        1.0, -1.0, -1.0, 1.0,  // Vertex 19
        // Left face
        -1.0,  1.0, -1.0, 1.0,  // Vertex 20
        -1.0,  1.0,  1.0, 1.0,  // Vertex 21
        -1.0, -1.0,  1.0, 1.0,  // Vertex 22
        -1.0, -1.0, -1.0, 1.0,  // Vertex 23
    ]);
    
    vertexBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); 
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW); 
    vertexBuffer.itemSize = 4;  
    vertexBuffer.itemCount = 24;

	// Colors for 6 faces of TABLE TOP 
    var greenShades = createShadesForCube(0, 1, 0);
	colorBuffers.green = gl.createBuffer(); 
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffers.green); 
	gl.bufferData(gl.ARRAY_BUFFER, greenShades, gl.STATIC_DRAW); 
	colorBuffers.itemSize = 4;  
	colorBuffers.itemCount = 24;
	// Colors for 6 faces OF LEGS
    var redShades = createShadesForCube(1, 0, 0);
	colorBuffers.red = gl.createBuffer(); 
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffers.red); 
	gl.bufferData(gl.ARRAY_BUFFER, redShades, gl.STATIC_DRAW); 
	colorBuffers.itemSize = 4;  
	colorBuffers.itemCount = 24;
    var blueShades = createShadesForCube(0, 0, 1);
	colorBuffers.blue = gl.createBuffer(); 
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffers.blue); 
	gl.bufferData(gl.ARRAY_BUFFER, blueShades, gl.STATIC_DRAW); 
	colorBuffers.itemSize = 4;  
	colorBuffers.itemCount = 24;
    var purpleShades = createShadesForCube(0.5, 0, 0.5);
	colorBuffers.purple = gl.createBuffer(); 
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffers.purple); 
	gl.bufferData(gl.ARRAY_BUFFER, purpleShades, gl.STATIC_DRAW); 
	colorBuffers.itemSize = 4;  
	colorBuffers.itemCount = 24;
    var yellowShades = createShadesForCube(1, 1, 0);
	colorBuffers.yellow = gl.createBuffer(); 
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffers.yellow); 
	gl.bufferData(gl.ARRAY_BUFFER, yellowShades, gl.STATIC_DRAW); 
	colorBuffers.itemSize = 4;  
	colorBuffers.itemCount = 24;
    var blackShades = createShadesForCube(0, 0, 0);
	colorBuffers.black = gl.createBuffer(); 
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffers.black); 
	gl.bufferData(gl.ARRAY_BUFFER, blackShades, gl.STATIC_DRAW); 
	colorBuffers.itemSize = 4;  
	colorBuffers.itemCount = 24;

    var cubeIndices = new Uint16Array([
        0, 1, 2,  0, 2, 3,  // Front face
        4, 5, 6,  4, 6, 7,  // Back face
        8, 9, 10,  8, 10, 11,  // Top face
        12, 13, 14,  12, 14, 15,  // Bottom face
        16, 17, 18,  16, 18, 19,  // Right face
        20, 21, 22,  20, 22, 23   // Left face
    ]);
    indexBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
    indexBuffer.itemCount = 36; 
}

function drawScene(farVisibilityThreshold) { 

// Create camera matrices
    setCameraAndView(farVisibilityThreshold);

//Create Cubes transformations TO CREATE A TABLE
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear color and depth buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); 
	gl.vertexAttribPointer(vertexPositionAttributePointer, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    /* BIG TABLE  */
    /* TABLE TOP Dimensions = 20x20x1*/
    drawTableTop(10, 10, 0.5, 0, 0, 8, colorBuffers.green);
    /* FRONT LEFT LEG Dimensions = 1x1x15*/
    drawLeg(0.5, 0.5, 7.5, 9.5, 9.5, 0, colorBuffers.black);  
    /* FRONT RIGHT LEG Dimensions = 1x1x15*/
    drawLeg(0.5, 0.5, 7.5, -9.5, -9.5, 0, colorBuffers.blue);  
    /* BACK LEFT LEG Dimensions = 1x1x15*/
    drawLeg(0.5, 0.5, 7.5, 9.5, -9.5, 0, colorBuffers.purple);  
    /* BACK RIGHT LEG Dimensions = 1x1x15*/
    drawLeg(0.5, 0.5, 7.5, -9.5, 9.5, 0, colorBuffers.yellow);  

    /* STOOL (half table) */
    /* TABLE TOP Dimensions = 10x10x0.5*/
    drawTableTop(5, 5, 0.25, 10, 0, 4-3.75, colorBuffers.green);  // Halved dimensions
    /* FRONT LEFT LEG Dimensions = 0.5x0.5x7.5*/
    drawLeg(0.25, 0.25, 3.75, 10+4.75, 4.75, -3.75, colorBuffers.black);  // Halved dimensions
    /* FRONT RIGHT LEG Dimensions = 0.5x0.5x7.5*/
    drawLeg(0.25, 0.25, 3.75, 10-4.75, -4.75, -3.75, colorBuffers.blue);  // Halved dimensions
    /* BACK LEFT LEG Dimensions = 0.5x0.5x7.5*/
    drawLeg(0.25, 0.25, 3.75, 10+4.75, -4.75, -3.75, colorBuffers.purple);  // Halved dimensions
    /* BACK RIGHT LEG Dimensions = 0.5x0.5x7.5*/
    drawLeg(0.25, 0.25, 3.75, 10-4.75, 4.75, -3.75, colorBuffers.yellow);  // Halved dimensions

    /* BACK */
    /* TABLE TOP Dimensions = 0.5x10x7.5*/
    drawTableTop(0.25, 5, 3.75, 14.75, 0, 8-3.75, colorBuffers.red);  // Halved dimensions
}

function setCameraAndView(farVisibilityThreshold) {
    // Create view matrix (adjust according to your camera position logic)
    var viewDistanceText = document.getElementById("viewDistanceTxt").value;
    var viewDistance = parseFloat(viewDistanceText);
    var selectedCameraPosition = document.querySelector('input[name="cameraPosition"]:checked').value;
    var cameraPositions = {
        "Left-Front-Top": [-viewDistance, viewDistance, viewDistance],
        "Left-Front-Bottom": [-viewDistance, viewDistance, -viewDistance],
        "Left-Back-Top": [-viewDistance, -viewDistance, viewDistance],
        "Left-Back-Bottom": [-viewDistance, -viewDistance, -viewDistance],
        "Right-Front-Top": [viewDistance, viewDistance, viewDistance],
        "Right-Front-Bottom": [viewDistance, viewDistance, -viewDistance],
        "Right-Back-Top": [viewDistance, -viewDistance, viewDistance],
        "Right-Back-Bottom": [viewDistance, -viewDistance, -viewDistance]
    };
    var cameraPosition = cameraPositions[selectedCameraPosition];
    var cameraTargetPoint = [0, 0, 0];
    var pointUp = [0, 0, 1];
    glMatrix.mat4.lookAt(viewMatrix, cameraPosition, cameraTargetPoint, pointUp);

    // Create perspective matrix
    var viewAngleText = document.getElementById("viewAngleTxt").value;
    var fieldOfView = parseFloat(viewAngleText) * Math.PI / 180.0;
    var aspect = 1; // Assuming square canvas
    var near = 0.01;
    if (!farVisibilityThreshold) farVisibilityThreshold = 100;
    glMatrix.mat4.perspective(perspectiveMatrix, fieldOfView, aspect, near, farVisibilityThreshold);
    
    // Combine view and perspective matrices
    glMatrix.mat4.multiply(pvMatrix, perspectiveMatrix, viewMatrix);
    // Set the uniform matrix for shaders
    gl.uniformMatrix4fv(perspectiveUniformPointer, false, pvMatrix);
}
function drawTableTop(scaleX, scaleY, scaleZ, translateX, translateY,translateZ,colorBufferObject)
{
    // Reset matrices
    glMatrix.mat4.identity(scaleMatrix);
    glMatrix.mat4.identity(translationMatrix);
    glMatrix.mat4.identity(finalMatrix);

    // Scale and translate table top
    scaleCube(scaleMatrix, scaleX, scaleY, scaleZ);
    translateCube(translationMatrix, translateX, translateY,translateZ); 
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBufferObject); 
	gl.vertexAttribPointer(vertexColorAttributePointer, colorBuffers.itemSize, gl.FLOAT, false, 0, 0);
    combineCubes(finalMatrix, translationMatrix, scaleMatrix);
}
function drawLeg(scaleX, scaleY, scaleZ,translateX, translateY, translateZ, colorBufferObject) {
     // Reset matrices
    glMatrix.mat4.identity(scaleMatrix);
    glMatrix.mat4.identity(translationMatrix);
    glMatrix.mat4.identity(finalMatrix);

    // Scale and translate leg
    scaleCube(scaleMatrix, scaleX, scaleY, scaleZ);
    translateCube(translationMatrix, translateX, translateY, translateZ); 
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBufferObject); 
	gl.vertexAttribPointer(vertexColorAttributePointer, colorBuffers.itemSize, gl.FLOAT, false, 0, 0);
    combineCubes(finalMatrix, translationMatrix, scaleMatrix);
}
function scaleCube(cube, scaleX, scaleY, scaleZ)
{
    glMatrix.mat4.fromScaling(cube, [scaleX, scaleY, scaleZ]);
}
function translateCube(cube, moveX, moveY, moveZ)
{
    glMatrix.mat4.fromTranslation(cube, [moveX, moveY, moveZ]);
}
function combineCubes(resultMat, mat1, mat2)
{
    // Combine matrices
    glMatrix.mat4.multiply(resultMat, mat1, mat2);
    // Set the transformation matrix
    gl.uniformMatrix4fv(verticesTransformUniformPointer, false, resultMat); 
    // Draw the cube
    gl.drawElements(gl.TRIANGLES, indexBuffer.itemCount, gl.UNSIGNED_SHORT, 0);
}

function main() {
	minDimension = Math.min(window.innerHeight, window.innerWidth);
	canvas = document.getElementById("sceneCanvas"); 
	canvas.width = 0.9*minDimension; 
	canvas.height = 0.9*minDimension; 
	gl = WebGLDebugUtils.makeDebugContext(createGLContext(canvas));
	initShaders(); 
	initBuffers(); 
	gl.clearColor(0.5, 0.5, 0.5, 1.0); // Background color
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	gl.enable(gl.DEPTH_TEST); 
	drawScene(); 
 }
function redesign(factor) {
    var viewDistanceText = document.getElementById("viewDistanceTxt").value; 
    var viewDistance = parseFloat(viewDistanceText);
    var newFar = viewDistance * factor;
     // Redraw the scene
    drawScene(newFar);
}
