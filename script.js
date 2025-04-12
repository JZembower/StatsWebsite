const backendUrl = "https://spm-backend-rwbm.onrender.com";

async function uploadFile(page, fileInputId) {
    const fileInput = document.getElementById(fileInputId)?.files[0];
    if (!fileInput) {
        alert("Please select a file.");
        return;
    }
    const formData = new FormData();
    formData.append("file", fileInput);
    const rowLimit = document.getElementById("rowLimit")?.value || 0;
    formData.append("row_limit", rowLimit);
    try {
        const response = await fetch(`${backendUrl}/upload`, { 
            method: "POST", 
            body: formData 
        });
        if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
        }
        const data = await response.json();
        const columnSelection = document.getElementById("columnSelection");
        if (columnSelection) {
            columnSelection.style.display = "block";
        }
        if (document.getElementById("colLeft")) {
            populateDropdown("colLeft", data.columns);
        }
        if (document.getElementById("colRight")) {
            populateDropdown("colRight", data.columns);
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
            if (!anovaFile) {
                alert("Please upload a file.");
                return;
            }
            formData.append("file", anovaFile);
            formData.append("dependent_var", document.getElementById("dependentVar").value);
            formData.append("independent_var", document.getElementById("independentVar").value);
            endpoint = "/anova";
            break;
        
        case "SPM":
            const file1 = document.getElementById("fileInput1").files[0];
            const file2 = document.getElementById("fileInput2").files[0];
            if (!file1 || !file2) {
                alert("Please upload both files.");
                return;
            }
            formData.append("file1", file1);
            formData.append("file2", file2);
            formData.append("col1", document.getElementById("colLeft").value);
            formData.append("col2", document.getElementById("colRight").value);
            endpoint = "/moving_avg_overlay";
            break;

        default:
            alert("Invalid analysis type.");
            return;
    }
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);
        const response = await fetch(`${backendUrl}${endpoint}`, {
            method: "POST",
            body: formData,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Analysis failed with status: ${response.status}`);
        }
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        outputDiv.innerHTML = `
            <img src="${imageUrl}" alt="${page} Analysis Result">
            <button onclick="downloadImage('${imageUrl}', '${page}_result.png')">Download Result</button>
        `;
    } catch (error) {
        console.error("Fetch error:", error);
        outputDiv.innerHTML = "";
        alert("Error: " + error.message);
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



