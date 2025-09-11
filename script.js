// Store the MD5-hashed admin password
const adminPasswordHash = CryptoJS.MD5("remove").toString(); // Hash the password
const passwordBox = document.querySelector(".admin");
const accidentDisplay = document.querySelector(".accidentDisplay");
const map = L.map("map").setView([49.276765, -122.917957], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let reports = JSON.parse(localStorage.getItem("emergencyReports")) || []; // Load reports from localStorage
const markers = {}; // Object to keep track of markers

// Render existing reports
reports.forEach((report) => {
    addMarkerAndRow(report);
});

// Attach filtering functionality to map events
map.on("moveend", filterReportsByMapBounds);
map.on("zoomend", filterReportsByMapBounds);

const submitButton = document.querySelector(".submitButton");

submitButton.addEventListener("click", () => {
    const name = document.querySelector("#Name").value;
    const phone = document.querySelector("#Phone").value;
    const emergency = document.querySelector("#Emergency").value;
    const location = document.querySelector("#Location").value;
    const longitude = document.querySelector("#Longitude").value;
    const latitude = document.querySelector("#Latitude").value;
    const comments = document.querySelector("#comment").value;
    const imageInput = document.querySelector("#Image").files[0];

    if (!name || !phone || !emergency || !location) {
        alert("Please fill in all the required fields: Name, Phone, Emergency Type, and Location.");
        return; // Stop execution if validation fails
    }

    let lat, lng;

    // Use provided latitude/longitude or geocode the location
    if (longitude && latitude) {
        lat = parseFloat(latitude);
        lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            alert("Invalid latitude or longitude. Please enter numerical values.");
            return;
        }
    } else {
        const geocoder = L.Control.Geocoder.nominatim();
        geocoder.geocode(location, (results) => {
            if (results.length === 0) {
                alert("Could not find the location. Please enter a valid location name.");
                return;
            }

            const { lat: geocodedLat, lng: geocodedLng } = results[0].center;

            if (imageInput) {
                const reader = new FileReader();
                reader.onload = () => {
                    saveAndRenderReport({
                        lat: geocodedLat,
                        lng: geocodedLng,
                        name,
                        phone,
                        image: reader.result,
                        emergency,
                        location,
                        comments,
                    });
                };
                reader.readAsDataURL(imageInput);
            } else {
                saveAndRenderReport({
                    lat: geocodedLat,
                    lng: geocodedLng,
                    name,
                    phone,
                    image: null,
                    emergency,
                    location,
                    comments,
                });
            }
        });
        return;
    }

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
    }
});

function filterReportsByMapBounds() {
    const bounds = map.getBounds();
    const reportTable = document.querySelector(".reportTable tbody");
    reportTable.innerHTML = ""; // Clear the table

    let visibleReports = 0;

    reports.forEach((report) => {
        const { lat, lng } = report;
        if (bounds.contains([lat, lng])) {
            addMarkerAndRow(report, false); // Avoid re-adding markers
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
    crossImage.src = "cross.png";
    crossImage.alt = "cross image";
    crossImage.style.width = "50px";
    crossImage.style.cursor = "pointer";

    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";

    div.appendChild(accidentDisplayInfoText);

    if (status === "OPEN") {
        div.appendChild(crossImage);
    } else {
        accidentDisplayInfoText.style.display = "none"; // Hide "More Info" text for resolved emergencies
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
            accidentDisplayInfoText.style.display = "none"; // Hide "More Info" text
            hideAccidentDisplay(); // Hide accidentDisplay if visible
            map.removeLayer(markers[time]);
            delete markers[time];
            reports = reports.map((r) =>
                r.time === time ? { ...r, status: "RESOLVED" } : r
            );
            localStorage.setItem("emergencyReports", JSON.stringify(reports));
        });
    });
}

function hideAccidentDisplay() {
    accidentDisplay.innerHTML = ""; // Clear content
    accidentDisplay.style.visibility = "hidden";
    delete accidentDisplay.dataset.lat;
    delete accidentDisplay.dataset.lng;
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
        } else alert("Incorrect password!");
    }
}
function moreInfoClick(name, phone, image, emergency, location, comments, time, lat, lng) {
    accidentDisplay.innerHTML = "";
    accidentDisplay.dataset.lat = lat; // Store lat and lng for visibility checks
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
