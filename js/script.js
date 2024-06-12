
var gl; 
var canvas; 
var shadersProgram; 
var vertexPositionAttributePointer; 
var vertexColorAttributePointer;
var verticesTransformUniformPointer; 
var vertexBuffer;
var colorBuffer; 
var indexBuffer; 
var totalAngle = 0.0; 
var rotationXMatrix = new Float32Array(16);
var requestID = 0; 
 
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
}

function initBuffers() {
    var cubeVertices = new Float32Array([
        // Front face
        0.3,  0.3,  0.3, 1.0,  // Vertex 0
       -0.3,  0.3,  0.3, 1.0,  // Vertex 1
       -0.3, -0.3,  0.3, 1.0,  // Vertex 2
        0.3, -0.3,  0.3, 1.0,  // Vertex 3

        // Back face
        0.3,  0.3, -0.3, 1.0,  // Vertex 4
       -0.3,  0.3, -0.3, 1.0,  // Vertex 5
       -0.3, -0.3, -0.3, 1.0,  // Vertex 6
        0.3, -0.3, -0.3, 1.0   // Vertex 7
    ]);
	vertexBuffer = gl.createBuffer(); 
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, cubeVertices,	gl.STATIC_DRAW); 
	vertexBuffer.itemSize = 4;  
	vertexBuffer.itemCount = 8;

	// Colors for 8 vertices
	var cubeColors = new Float32Array([
				1.0, 0.0, 0.0, 1.0, // Color of vertex 0: κόκκινο
				0.0, 1.0, 0.0, 1.0, // Χρώμα κορυφής Β: πράσινο
				0.0, 0.0, 1.0, 1.0, // Χρώμα κορυφής Γ: μπλε
				1.0, 1.0, 0.0, 1.0,  // Χρώμα κορυφής Δ: κίτρινο
                1.0, 1.0, 0.0, 1.0,  // Χρώμα κορυφής Δ: κίτρινο
                1.0, 1.0, 0.0, 1.0,  // Χρώμα κορυφής Δ: κίτρινο
                1.0, 1.0, 0.0, 1.0,  // Χρώμα κορυφής Δ: κίτρινο
                1.0, 1.0, 0.0, 1.0  // Χρώμα κορυφής Δ: κίτρινο
				]);
	colorBuffer = gl.createBuffer(); 
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW); 
	colorBuffer.itemSize = 4;  
	colorBuffer.itemCount = 8;

	var cubeIndices = new Uint16Array([
        // Front face
        0, 1, 2,  0, 2, 3,
        // Back face
        4, 5, 6,  4, 6, 7,
        // Top face
        0, 1, 5,  0, 5, 4,
        // Bottom face
        2, 3, 7,  2, 7, 6,
        // Right face
        0, 3, 7,  0, 7, 4,
        // Left face
        1, 2, 6,  1, 6, 5
    ]);
	indexBuffer = gl.createBuffer(); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); 
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
	indexBuffer.itemCount = 36; 
}

function drawScene() { 
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear color and depth buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); 
	gl.vertexAttribPointer(vertexPositionAttributePointer, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); 
	gl.vertexAttribPointer(vertexColorAttributePointer, colorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// Compute total rotation angle
	var textFactorScale = document.getElementById("textFactorScale").value; 
	var numStepAngle= parseFloat(textFactorScale);
	numStepAngle = numStepAngle*Math.PI/180.0; 
	totalAngle += numStepAngle; 
	glMatrix.mat4.fromXRotation(rotationXMatrix, totalAngle );  

    // Create a translation matrix
	var translationMatrix = new Float32Array(16);
	var finalMatrix = new Float32Array(16);

    // Translate the pyramid to the origin
    glMatrix.mat4.fromTranslation(translationMatrix, [0, 0, 0]);
    // Combine the rotation and translation matrices
    glMatrix.mat4.multiply(finalMatrix,  rotationXMatrix, translationMatrix);
    // Set the transformation matrix
    gl.uniformMatrix4fv(verticesTransformUniformPointer, false, finalMatrix); 

    // Draw the pyramid
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

function startAnimation() {
	if (requestID == 0)
		requestID = window.requestAnimationFrame(animationStep);
}

function animationStep() {
	drawScene();
	requestID = window.requestAnimationFrame(animationStep);
}

function stopAnimation() {
	window.cancelAnimationFrame(requestID);
	requestID = 0;
}
