async function uploadFile() {
    const fileInput = document.getElementById('fileInput').files[0];
    if (!fileInput) {
        alert("Please select a file.");
        return;
    }
    
    const formData = new FormData();
    formData.append("file", fileInput);
    
    const response = await fetch("http://127.0.0.1:8000/upload/", { method: "POST", body: formData });
    const data = await response.json();

    document.getElementById("columnSelection").style.display = "block";
    const colLeftSelect = document.getElementById("colLeft");
    const colRightSelect = document.getElementById("colRight");

    data.columns.forEach(col => {
        colLeftSelect.add(new Option(col, col));
        colRightSelect.add(new Option(col, col));
    });
}

async function runAnalysis() {
    const colLeft = document.getElementById("colLeft").value;
    const colRight = document.getElementById("colRight").value;
    
    const fileInput = document.getElementById('fileInput').files[0];
    const formData = new FormData();
    formData.append("file", fileInput);
    formData.append("col_left", colLeft);
    formData.append("col_right", colRight);
    
    const response = await fetch("http://127.0.0.1:8000/analyze/", { method: "POST", body: formData });
    
    if (response.ok) {
        const imageUrl = URL.createObjectURL(await response.blob());
        document.getElementById("output").innerHTML = `<img src="${imageUrl}" alt="SPM Analysis Result">`;
    } else {
        alert("Error processing analysis");
    }
}
