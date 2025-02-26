const backendUrl = "https://spm-backend.onrender.com"; 

// Function to handle file upload and dynamically populate column selection
async function uploadFile(page) {
    const fileInput = document.getElementById('fileInput').files[0];
    if (!fileInput) {
        alert("Please select a file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput);

    try {
        const response = await fetch(`${backendUrl}/upload/`, { method: "POST", body: formData });
        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        document.getElementById("columnSelection").style.display = "block";

        // Check if column selectors exist before populating
        if (document.getElementById("colLeft")) {
            populateDropdown("colLeft", data.columns);
        }
        if (document.getElementById("colRight")) {
            populateDropdown("colRight", data.columns);
        }
        if (document.getElementById("dependentVar")) {
            populateDropdown("dependentVar", data.columns);
        }
        if (document.getElementById("independentVar")) {
            populateDropdown("independentVar", data.columns);
        }
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// Populate dropdowns with column names
function populateDropdown(elementId, columns) {
    const select = document.getElementById(elementId);
    select.innerHTML = ""; // Clear previous options
    columns.forEach(col => select.add(new Option(col, col)));
}

// Function to handle different analyses dynamically
async function runAnalysis(page) {
    const fileInput = document.getElementById('fileInput').files[0];
    if (!fileInput) {
        alert("Please upload a file first.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput);

    let endpoint = "";
    
    // Determine API endpoint based on the page
    switch (page) {
        case "PCA":
            endpoint = "/pca/";
            const components = document.getElementById("components").value || 2;
            formData.append("components", components);
            break;
        case "TTest":
            endpoint = "/spm/";
            const colLeft = document.getElementById("colLeft").value;
            const colRight = document.getElementById("colRight").value;
            if (!colLeft || !colRight) {
                alert("Please select both columns.");
                return;
            }
            formData.append("col_left", colLeft);
            formData.append("col_right", colRight);
            break;
        case "SPM":
            endpoint = "/moving_avg_overlay/";
            const col1 = document.getElementById("colLeft").value;
            const col2 = document.getElementById("colRight").value;
            if (!col1 || !col2) {
                alert("Please select both columns.");
                return;
            }
            formData.append("col1", col1);
            formData.append("col2", col2);
            break;
        case "ANOVA":
            endpoint = "/anova/";
            const dependentVar = document.getElementById("dependentVar").value;
            const independentVar = document.getElementById("independentVar").value;
            if (!dependentVar || !independentVar) {
                alert("Please select dependent and independent variables.");
                return;
            }
            formData.append("dependent_var", dependentVar);
            formData.append("independent_var", independentVar);
            break;
        default:
            alert("Invalid analysis type.");
            return;
    }

    try {
        const response = await fetch(`${backendUrl}${endpoint}`, { method: "POST", body: formData });
        if (!response.ok) throw new Error("Analysis failed");

        // Display the analysis result as an image
        const imageUrl = URL.createObjectURL(await response.blob());
        document.getElementById("output").innerHTML = `<img src="${imageUrl}" alt="${page} Analysis Result">`;
    } catch (error) {
        alert("Error: " + error.message);
    }
}
