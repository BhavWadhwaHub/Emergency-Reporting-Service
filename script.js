// Store the MD5-hashed admin password
const adminPasswordHash = CryptoJS.MD5("remove").toString(); // Hash the password
const passwordBox = document.querySelector(".admin");
const accidentDisplay = document.querySelector(".accidentDisplay");

const map = L.map("map").setView([49.276765, -122.917957], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let reports = JSON.parse(localStorage.getItem("emergencyReports")) || []; 
const markers = {}; 
reports.forEach((report) => {
    addMarkerAndRow(report);
});

map.on("moveend", filterReportsByMapBounds);
map.on("zoomend", filterReportsByMapBounds);

const submitButton = document.querySelector(".submitButton");

submitButton.addEventListener("click", (event) => {
    event.preventDefault(); 

    const name = document.querySelector("#Name").value.trim();
    const phone = document.querySelector("#Phone").value.trim();
    const emergency = document.querySelector("#Emergency").value.trim();
    const location = document.querySelector("#Location").value.trim();
    const longitude = document.querySelector("#Longitude").value.trim();
    const latitude = document.querySelector("#Latitude").value.trim();
    const comments = document.querySelector("#comment").value.trim();
    const imageInput = document.querySelector("#Image").files[0];

    if (!name || !phone || !emergency || !location) {
        alert("Please fill in all the required fields: Name, Phone, Emergency Type, and Location.");
        return;
    }

    let lat, lng;

    if (longitude && latitude) {
        lat = parseFloat(latitude);
        lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            alert("Invalid latitude or longitude. Please enter numerical values.");
            return;
        }
        handleReport(lat, lng);
    } else {
        const geocoder = L.Control.Geocoder.nominatim();
        geocoder.geocode(location, (results) => {
            if (results.length === 0) {
                alert("Could not find the location. Please try:\n- Using coordinates\n- Being more specific (e.g., '123 Main St, Burnaby, BC')");
                return;
            }
            const { lat: geocodedLat, lng: geocodedLng } = results[0].center;
            handleReport(geocodedLat, geocodedLng);
        });
    }

    function handleReport(lat, lng) {
        if (imageInput) {
            const reader = new FileReader();
            reader.onload = () => {
                saveAndRenderReport({
                    lat,
                    lng,
                    name,
                    phone,
                    image: reader.result,
                    emergency,
                    location,
                    comments,
                });
                console.log("✅ Report added with image");
            };
            reader.readAsDataURL(imageInput);
        } else {
            saveAndRenderReport({
                lat,
                lng,
                name,
                phone,
                image: null,
                emergency,
                location,
                comments,
            });
            console.log("✅ Report added without image");
        }
    }
});
function saveAndRenderReport(report) {
    const currentTime = new Date().toLocaleString();
    const newReport = { ...report, time: currentTime, status: "OPEN" };

    reports.push(newReport);
    localStorage.setItem("emergencyReports", JSON.stringify(reports));

    addMarkerAndRow(newReport);
    document.querySelector("#Name").value = "";
    document.querySelector("#Phone").value = "";
    document.querySelector("#Image").value = "";
    document.querySelector("#Emergency").value = "";
    document.querySelector("#Location").value = "";
    document.querySelector("#Longitude").value = "";
    document.querySelector("#Latitude").value = "";
    document.querySelector("#comment").value = "";
}
function addMarkerAndRow(report, addMarker = true) {
    const { lat, lng, name, phone, image, emergency, location, comments, time, status } = report;

    if (addMarker) {
        const newMarker = L.marker([lat, lng]).addTo(map);
        newMarker.bindPopup(`<b>${emergency}</b><br>${location}`).openPopup();
        markers[time] = newMarker;
    }

    const reportTable = document.querySelector(".reportTable tbody");
    const newRow = document.createElement("tr");

    const locationCell = document.createElement("td");
    locationCell.innerText = location;

    const emergencyCell = document.createElement("td");
    emergencyCell.innerText = emergency;

    const timeCell = document.createElement("td");
    timeCell.innerText = time;

    const statusCell = document.createElement("td");
    statusCell.innerText = status;

    const linkCell = document.createElement("td");

    const accidentDisplayInfoText = document.createElement("p");
    accidentDisplayInfoText.innerText = "More Info";
    accidentDisplayInfoText.style.color = "blue";
    accidentDisplayInfoText.style.textDecoration = "underline";
    accidentDisplayInfoText.style.cursor = "pointer";

    const crossImage = document.createElement("img");
    crossImage.src = "cross.svg";
    crossImage.alt = "Resolve";
    crossImage.style.width = "24px";
    crossImage.style.cursor = "pointer";

    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";

    div.appendChild(accidentDisplayInfoText);

    if (status === "OPEN") {
        div.appendChild(crossImage);
    } else {
        accidentDisplayInfoText.style.display = "none"; 
    }

    linkCell.appendChild(div);

    newRow.appendChild(locationCell);
    newRow.appendChild(emergencyCell);
    newRow.appendChild(timeCell);
    newRow.appendChild(statusCell);
    newRow.appendChild(linkCell);
    reportTable.appendChild(newRow);
    accidentDisplayInfoText.addEventListener("click", () => {
        moreInfoClick(name, phone, image, emergency, location, comments, time, lat, lng);
    });
    crossImage.addEventListener("click", () => {
        showPasswordBox(() => {
            statusCell.innerText = "RESOLVED";
            crossImage.style.display = "none";
            accidentDisplayInfoText.style.display = "none"; 
            hideAccidentDisplay(); 
            map.removeLayer(markers[time]);
            delete markers[time];

            reports = reports.map((r) =>
                r.time === time ? { ...r, status: "RESOLVED" } : r
            );
            localStorage.setItem("emergencyReports", JSON.stringify(reports));
        });
    });
}

function filterReportsByMapBounds() {
    const bounds = map.getBounds();
    const reportTable = document.querySelector(".reportTable tbody");
    reportTable.innerHTML = "";

    let visibleReports = 0;

    reports.forEach((report) => {
        const { lat, lng } = report;
        if (bounds.contains([lat, lng])) {
            addMarkerAndRow(report, false);
            visibleReports++;
        }
    });

    if (
        visibleReports === 0 ||
        (accidentDisplay.dataset.lat &&
            accidentDisplay.dataset.lng &&
            !bounds.contains([parseFloat(accidentDisplay.dataset.lat), parseFloat(accidentDisplay.dataset.lng)]))
    ) {
        hideAccidentDisplay();
    }
}
function showPasswordBox(onSuccess) {
    passwordBox.style.display = "block";
    const enterButton = document.querySelector(".passwordButton");
    const exitButton = document.querySelector(".exitButton");
    const passwordInput = document.querySelector(".password");

    passwordInput.onkeypress = (event) => {
        if (event.key === "Enter") validatePassword(onSuccess);
    };
    enterButton.onclick = () => validatePassword(onSuccess);
    exitButton.onclick = () => {
        passwordBox.style.display = "none";
        passwordInput.value = "";
    };

    function validatePassword(onSuccess) {
        const hashedInput = CryptoJS.MD5(passwordInput.value).toString();
        if (hashedInput === adminPasswordHash) {
            passwordBox.style.display = "none";
            passwordInput.value = "";
            onSuccess();
        } else {
            alert("Incorrect password!");
        }
    }
}

function moreInfoClick(name, phone, image, emergency, location, comments, time, lat, lng) {
    accidentDisplay.innerHTML = "";
    accidentDisplay.dataset.lat = lat;
    accidentDisplay.dataset.lng = lng;

    if (image) {
        const accidentImage = document.createElement("img");
        accidentImage.src = image;
        accidentImage.alt = "Accident Photo";
        accidentImage.style.maxWidth = "100%";
        accidentImage.style.border = "1px solid #ccc";
        accidentImage.style.marginBottom = "10px";
        accidentDisplay.appendChild(accidentImage);
    }

    const emergencyType = document.createElement("p");
    emergencyType.innerText = "Type: " + emergency;
    emergencyType.style.fontWeight = "bold";

    const infoLocation = document.createElement("p");
    infoLocation.innerText = "Location: " + location;
    infoLocation.style.fontWeight = "bold";

    const reporter = document.createElement("p");
    reporter.innerText = "Reported by: " + name + " (" + phone + ")";
    reporter.style.fontWeight = "bold";

    const timeReported = document.createElement("p");
    timeReported.innerText = "Time: " + time;
    timeReported.style.fontWeight = "bold";

    const extraInfo = document.createElement("p");
    extraInfo.innerText = "Comments: " + comments;
    extraInfo.style.fontWeight = "bold";

    accidentDisplay.appendChild(emergencyType);
    accidentDisplay.appendChild(infoLocation);
    accidentDisplay.appendChild(reporter);
    accidentDisplay.appendChild(timeReported);
    accidentDisplay.appendChild(extraInfo);

    accidentDisplay.style.visibility = "visible";
}
function hideAccidentDisplay() {
    accidentDisplay.innerHTML = "";
    accidentDisplay.style.visibility = "hidden";
    delete accidentDisplay.dataset.lat;
    delete accidentDisplay.dataset.lng;
}


function exportToExcel() {
    if (reports.length === 0) {
        alert("No reports to export!");
        return;
    }

    const excelData = reports.map((report, index) => ({
        'Report #': index + 1,
        'Name': report.name,
        'Phone': report.phone,
        'Emergency Type': report.emergency,
        'Location': report.location,
        'Latitude': report.lat,
        'Longitude': report.lng,
        'Time Reported': report.time,
        'Status': report.status,
        'Comments': report.comments || 'N/A',
        'Has Image': report.image ? 'Yes' : 'No'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet['!cols'] = [
        { wch: 10 },  // Report #
        { wch: 20 },  // Name
        { wch: 15 },  // Phone
        { wch: 20 },  // Emergency Type
        { wch: 30 },  // Location
        { wch: 12 },  // Latitude
        { wch: 12 },  // Longitude
        { wch: 20 },  // Time Reported
        { wch: 10 },  // Status
        { wch: 30 },  // Comments
        { wch: 10 }   // Has Image
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Emergency Reports');
    const date = new Date().toISOString().split('T')[0];
    const filename = `Emergency_Reports_${date}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    console.log(`✅ Exported ${reports.length} reports to ${filename}`);
    alert(`Successfully exported ${reports.length} reports to ${filename}`);
}
