const backendUrl = "https://spm-backend-rwbm.onrender.com";

// Function to handle file upload and populate column selection
async function uploadFile(page, fileInputId) {
    const fileInput = document.getElementById(fileInputId).files[0];
    if (!fileInput) {
        alert("Please select a file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput);

    try {
        const response = await fetch(`${backendUrl}/upload`, { 
            method: "POST", 
            body: formData 
        });

        if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById("columnSelection").style.display = "block";

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
        console.error("Fetch error:", error);
        alert("Error uploading file: " + error.message);
    }
}

// Populate dropdowns with column names
function populateDropdown(elementId, columns) {
    const select = document.getElementById(elementId);
    select.innerHTML = "";
    columns.forEach(col => select.add(new Option(col, col)));
}

// Function to handle different analyses dynamically
async function runAnalysis(page) {
    let formData = new FormData();
    let endpoint = "";

    switch (page) {
        case "PCA":
            const pcaFile = document.getElementById("fileInput").files[0];
            if (!pcaFile) {
                alert("Please upload a file.");
                return;
            }
            formData.append("file", pcaFile);
            formData.append("components", document.getElementById("components").value || 2);
            endpoint = "/pca/";
            break;

        case "TTest":
            const tTestFile = document.getElementById("fileInput").files[0];
            if (!tTestFile) {
                alert("Please upload a file.");
                return;
            }
            formData.append("file", tTestFile);
            formData.append("col_left", document.getElementById("colLeft").value);
            formData.append("col_right", document.getElementById("colRight").value);
            endpoint = "/ttest/";
            break;

        case "ANOVA":
            const anovaFile = document.getElementById("fileInput").files[0];
            if (!anovaFile) {
                alert("Please upload a file.");
                return;
            }
            formData.append("file", anovaFile);
            formData.append("dependent_var", document.getElementById("dependentVar").value);
            formData.append("independent_var", document.getElementById("independentVar").value);
            endpoint = "/anova/";
            break;

        default:
            alert("Invalid analysis type.");
            return;
    }

    try {
        const response = await fetch(`${backendUrl}${endpoint}`, { method: "POST", body: formData });
        if (!response.ok) throw new Error("Analysis failed");

        const imageUrl = URL.createObjectURL(await response.blob());
        document.getElementById("output").innerHTML = `<img src="${imageUrl}" alt="${page} Analysis Result">`;
    } catch (error) {
        alert("Error: " + error.message);
    }
}


