let matrices = [];
let variables = {};

function isValidFraction(value) {
    // Check if the input is a valid fraction in the format a/b
    const fractionPattern = /^\s*\d+\s*\/\s*\d+\s*$/;
    return fractionPattern.test(value);
}

function parseValue(value) {
    // Parse value as a fraction, 'w' as infinity, or number
    if (isValidFraction(value)) {
        const parts = value.split('/');
        return parseInt(parts[0]) / parseInt(parts[1]);
    } else if (value.trim().toLowerCase() === 'w') {
        return Infinity;
    } else {
        return parseFloat(value);
    }
}

function addMatrix(matrixName) {
    if (matrixName === "M_identity") {
        matrices.push({ matrix: matrixName, variables: {} });
    } else {
        const matrixVariables = {};

        if (matrixName === "M_space") {
            matrixVariables.z = parseValue(prompt("Enter the value for z(distance):"));
        } else if (matrixName === "M_ObjectDistance") {
            matrixVariables.s_o = parseValue(prompt("Enter the value for s_o(object distance):"));
        } else if (matrixName === "M_ImageDistance") {
            matrixVariables.s_i = parseValue(prompt("Enter the value for s_i(image distance):"));
        } else if (matrixName === "M_interface") {
            matrixVariables.n1 = parseValue(prompt("Enter the value for n_1:"));
            matrixVariables.n2 = parseValue(prompt("Enter the value for n_2:"));
        } else if (matrixName === "M_lens") {
            matrixVariables.f_l = parseValue(prompt("Enter the value for f(focal length):"));
        } else if (matrixName === "M_mirror") {
            matrixVariables.f_m = parseValue(prompt("Enter the value for f(focal length R=2/f):"));
        } else if (matrixName === "M_curved") {
            matrixVariables.n1 = parseValue(prompt("Enter the value for n_1:"));
            matrixVariables.n2 = parseValue(prompt("Enter the value for n_2:"));
            matrixVariables.R = parseValue(prompt("Enter the value for R(Radius of Curvature), or 'w' for infinity:"));
            if (matrixVariables.R !== 'w' && isNaN(matrixVariables.R)) {
                alert("Invalid input for R. Please enter a valid number or 'w' for infinity.");
                return;
            }
        }

        if (Object.values(matrixVariables).some(value => isNaN(parseFloat(value)))) {
            alert("Please enter a valid number.");
            return;
        }
        matrices.push({ matrix: matrixName, variables: matrixVariables });
    }

    displayMatrices();
}




function displayMatrices() {
    const matricesDiv = document.getElementById("matrices");
    matricesDiv.innerHTML = "";
    matrices.slice().reverse().forEach((item, index) => {
        matricesDiv.innerHTML += `<p>M${matrices.length - index}: ${item.matrix} (${Object.values(item.variables).join(", ")}) <button onclick="deleteMatrix(${matrices.length - 1 - index})">Delete</button></p>`;
    });
}
// Delete a matrix
function deleteMatrix(index) {
    matrices.splice(index, 1);
    displayMatrices();
}

// Call displayMatrices to initially display matrices
displayMatrices();


function calculate() {
    let resultMatrix = null;
    matrices.forEach((item) => {
        // Calculate result matrix based on selected matrices
        if (resultMatrix === null) {
            resultMatrix = getMatrix(item.matrix, item.variables);
        } else {
            // Perform matrix multiplication
            resultMatrix = multiplyMatrices(getMatrix(item.matrix, item.variables), resultMatrix);
        }
    });

    resultMatrix = resultMatrix.map(row => row.map(val => Math.abs(val) < 1e-8 ? 0 : val));

    // Display the result
    const resultDiv = document.getElementById("result");
    
    resultDiv.innerHTML = "ABCD Matrix<br>";
    if (resultMatrix !== null) {
        const table = document.createElement("table");
        for (let i = 0; i < resultMatrix.length; i++) {
            const row = document.createElement("tr");
            for (let j = 0; j < resultMatrix[i].length; j++) {
                const cell = document.createElement("td");
                if (j === 0) {
                    cell.innerText = resultMatrix[i][j];
                } else if (j === resultMatrix[i].length - 1) {
                    cell.innerText = resultMatrix[i][j];
                } else {
                    cell.innerText = resultMatrix[i][j];
                }
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
        resultDiv.appendChild(table);
        

        // Check conditions for Imaging Magnification
        if (matrices[0].matrix === "M_ObjectDistance" && matrices[matrices.length - 1].matrix === "M_ImageDistance") {
            const systemMatrix = resultMatrix;
            const A = systemMatrix[0][0];
            if (systemMatrix[0][1] === 0) {
                const imagingMagnification = A;
                resultDiv.innerHTML += `<p>A(Imaging Magnification) = ${imagingMagnification}</p>`;
                if (A > 0) {
                    if (A > 1) {
                        resultDiv.innerHTML += `<p>(erected, magnified)</p>`;
                    } else if (A < 1) {
                        resultDiv.innerHTML += `<p>(erected, diminished)</p>`;
                    } else {
                        resultDiv.innerHTML += `<p>(same as real object)</p>`;
                    }
                } else {
                    if (A > -1) {
                        resultDiv.innerHTML += `<p>(inverted, magnified)</p>`;
                    } else {
                        resultDiv.innerHTML += `<p>(inverted, diminished)</p>`;
                    }
                }
            } else {
                resultDiv.innerHTML += `<p>Cannot calculate Imaging Magnification: B is not zero</p>`;
            }
        } else {
            resultDiv.innerHTML += `<p>Cannot calculate Imaging Magnification: Conditions not met</p>`;
        }
    }
}
    function multiplyMatrices(matrix1, matrix2) {
        // Perform matrix multiplication logic here
        const result = [];
        for (let i = 0; i < matrix1.length; i++) {
            result[i] = [];
            for (let j = 0; j < matrix2[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < matrix1[0].length; k++) {
                    sum += matrix1[i][k] * matrix2[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }
    
 

    function getMatrix(matrixName, variables) {
        switch (matrixName) {
            case "M_space":
                return [
                    [1, parseFloat(variables.z)],
                    [0, 1]
                ];
            case "M_ObjectDistance":
                return [
                    [1, parseFloat(variables.s_o)],
                    [0, 1]
                ];
            case "M_ImageDistance":
                return [
                    [1, parseFloat(variables.s_i)],
                    [0, 1]
                ];
            case "M_curved":
                if (variables.R === 'w' || !isNaN(parseFloat(variables.R))) {
                    if (variables.R === Infinity) {
                        return [
                            [1, 0],
                            [0, parseFloat(variables.n1) / parseFloat(variables.n2)]
                        ];
                    } else {
                        return [
                            [1, 0],
                            [(parseFloat(variables.n1) - parseFloat(variables.n2)) / parseFloat(variables.n2) * parseFloat(variables.R), parseFloat(variables.n1) / parseFloat(variables.n2)]
                        ];
                    }
                } else {
                    alert("Invalid input for R. Please enter a valid number or 'w' for infinity.");
                    return null;
                }
            case "M_interface":
                return [
                    [1, 0],
                    [0, parseFloat(variables.n1) / parseFloat(variables.n2)]
                ];
            case "M_lens":
                return [
                    [1, 0],
                    [-1/parseFloat(variables.f_l), 1]
                ];
            case "M_mirror":
                return [
                    [1, 0],
                    [-1/parseFloat(variables.f_m), 1]
                ];
            case "M_identity":
                return [
                    [1, 0],
                    [0, 1]
                ];
            default:
                return null;
        }
    }

    function scrollToResult(event) {
        event.preventDefault(); // Prevent the default behavior of the link
        const container = document.querySelector(".container2");
        container.scrollIntoView({ behavior: 'smooth' });
    }