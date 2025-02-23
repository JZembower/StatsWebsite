const backendUrl = "https://spm-backend.onrender.com";

async function uploadFile() {
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
        const colLeftSelect = document.getElementById("colLeft");
        const colRightSelect = document.getElementById("colRight");
        
        colLeftSelect.innerHTML = "";
        colRightSelect.innerHTML = "";
        
        data.columns.forEach(col => {
            colLeftSelect.add(new Option(col, col));
            colRightSelect.add(new Option(col, col));
        });
    } catch (error) {
        alert("Error: " + error.message);
    }
}

async function runAnalysis() {
    const colLeft = document.getElementById("colLeft").value;
    const colRight = document.getElementById("colRight").value;
    
    if (!colLeft || !colRight) {
        alert("Please select both columns.");
        return;
    }
    
    const fileInput = document.getElementById('fileInput').files[0];
    const formData = new FormData();
    formData.append("file", fileInput);
    formData.append("col_left", colLeft);
    formData.append("col_right", colRight);
    
    try {
        const response = await fetch(`${backendUrl}/analyze/`, { method: "POST", body: formData });
        if (!response.ok) throw new Error("Analysis failed");
        
        const imageUrl = URL.createObjectURL(await response.blob());
        document.getElementById("output").innerHTML = `<img src="${imageUrl}" alt="SPM Analysis Result">`;
    } catch (error) {
        alert("Error: " + error.message);
    }
}