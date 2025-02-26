const backendUrl = "http://127.0.0.1:5000"; 

// Function to handle file upload and populate column selection
async function uploadFile(page, fileInputId, columnDropdownId) {
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
        populateDropdown(columnDropdownId, data.columns);
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

// Function to handle SPM Moving Average Overlay Analysis
async function runAnalysis(page) {
    const file1 = document.getElementById('fileInput1').files[0];
    const file2 = document.getElementById('fileInput2').files[0];
    const col1 = document.getElementById("colLeft").value;
    const col2 = document.getElementById("colRight").value;

    if (!file1 || !file2 || !col1 || !col2) {
        alert("Please upload both datasets and select columns.");
        return;
    }

    const formData = new FormData();
    formData.append("file1", file1);
    formData.append("file2", file2);
    formData.append("col1", col1);
    formData.append("col2", col2);

    try {
        const response = await fetch(`${backendUrl}/moving_avg_overlay`, { method: "POST", body: formData });
        if (!response.ok) throw new Error("Analysis failed");

        const imageUrl = URL.createObjectURL(await response.blob());
        document.getElementById("output").innerHTML = `<img src="${imageUrl}" alt="SPM Analysis Result">`;
    } catch (error) {
        alert("Error: " + error.message);
    }
}

