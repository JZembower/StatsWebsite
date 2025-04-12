const backendUrl = "https://spm-backend-rwbm.onrender.com";

async function uploadFile(page, fileInputId) {
    const fileInput = document.getElementById(fileInputId)?.files[0];
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
        if (!data.columns) {
            throw new Error("No columns returned from upload.");
        }
        // Sanitize column names
        const cleanColumns = data.columns.map(col => col.replace(/[\s\-()]/g, "_"));
        const columnSelection = document.getElementById("columnSelection");
        if (columnSelection) {
            columnSelection.style.display = "block";
        }
        if (document.getElementById("dependentVar")) {
            populateDropdown("dependentVar", cleanColumns);
        }
        if (document.getElementById("independentVar")) {
            populateDropdown("independentVar", cleanColumns);
        }
        if (document.getElementById("colLeft")) {
            populateDropdown("colLeft", cleanColumns);
        }
        if (document.getElementById("colRight")) {
            populateDropdown("colRight", cleanColumns);
        }
    } catch (error) {
        console.error("Fetch error:", error);
        alert("Error uploading file: " + error.message);
    }
}
// Function to handle tab switching
async function runAnalysis(page) {
    let formData = new FormData();
    let endpoint = "";
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = '<div class="spinner">Loading...</div>'; // Show spinner

    switch (page) {
        case "PCA":
            const pcaFile = document.getElementById("fileInput").files[0];
            if (!pcaFile) {
                alert("Please upload a file.");
                return;
            }
            formData.append("file", pcaFile);
            formData.append("components", document.getElementById("components").value || 2);
            endpoint = "/pca";
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
            endpoint = "/ttest"; // Ensure this exists in Flask
            break;

            case "ANOVA":
            const anovaFile = document.getElementById("fileInput").files[0];
            const dependentVar = document.getElementById("dependentVar").value;
            const independentVar = document.getElementById("independentVar").value;
            if (!anovaFile || !dependentVar || !independentVar) {
                alert("Please select file and variables.");
                outputDiv.innerHTML = "";
                return;
            }
            formData.append("file", anovaFile);
            formData.append("dependent_var", dependentVar);
            formData.append("independent_var", independentVar);
            endpoint = "/anova";
            break;
        
                case "SPM":
                    const file1 = document.getElementById("fileInput1").files[0];
                    const file2 = document.getElementById("fileInput2").files[0];
                    const col1 = document.getElementById("colLeft").value;
                    const col2 = document.getElementById("colRight").value;
                    if (!file1 || !file2) {
                        alert("Please upload both files.");
                        outputDiv.innerHTML = "";
                        return;
                    }
                    if (!col1 || !col2) {
                        alert("Please select columns for both datasets.");
                        outputDiv.innerHTML = "";
                        return;
                    }
                    formData.append("file1", file1);
                    formData.append("file2", file2);
                    formData.append("col1", col1);
                    formData.append("col2", col2);
                    endpoint = "/moving_avg_overlay";
                    break;

        default:
            alert("Invalid analysis type.");
            return;
    }
    try {
        const response = await fetch(`${backendUrl}${endpoint}`, {
            method: "POST",
            body: formData,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
    
        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                throw new Error(data.error || `Analysis failed with status ${response.status}`);
            } else {
                const text = await response.text();
                console.error(`Non-JSON response: status=${response.status}, content-type=${contentType}, response=${text.slice(0, 100)}`);
                throw new Error(`Analysis failed with status ${response.status}: ${text.slice(0, 50)}...`);
            }
        }
    
        if (contentType && contentType.includes("image/png")) {
            const imageUrl = URL.createObjectURL(await response.blob());
            outputDiv.innerHTML = `<img src="${imageUrl}" alt="${page} Analysis Result">`;
        } else {
            const data = await response.json();
            throw new Error(data.error || "Unexpected response format");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        outputDiv.innerHTML = "";
        alert(`Error: ${error.message}`);
    }
}
function downloadImage(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
function populateDropdown(elementId, columns) {
    const select = document.getElementById(elementId);
    select.innerHTML = "";
    columns.forEach(col => select.add(new Option(col, col)));
    // Prevent duplicate selections
    select.addEventListener("change", function() {
        const otherSelect = elementId === "colLeft" ? document.getElementById("colRight") : document.getElementById("colLeft");
        if (otherSelect && otherSelect.value === select.value) {
            alert("Please select different columns.");
            select.value = "";
        }
    });
}
// Function to test API connection
async function testBackendConnection() {
    try {
        const response = await fetch(`${backendUrl}/`);
        const data = await response.json();
        console.log("Backend connection successful:", data);
    } catch (error) {
        console.error("Backend connection error:", error);
    }
}

// Run this function when the page loads
testBackendConnection();



