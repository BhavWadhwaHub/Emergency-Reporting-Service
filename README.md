# Emergency Reporting Service

A web-based emergency incident reporting platform that allows users to submit emergency reports through an interactive map interface.

The application enables users to:

* Report emergencies in real time
* Pin incidents directly onto a map
* Upload supporting images
* Store incident information locally
* View active emergency reports
* Mark emergencies as resolved through admin authentication

This project combines mapping technology, geolocation, local storage, and emergency management features into a simple and interactive reporting system.

---

# Project Overview

The Emergency Reporting Service is designed to simulate a lightweight emergency management and incident tracking system.

Users can:

1. Enter emergency details
2. Provide a location or coordinates
3. Upload evidence images
4. Submit the report
5. View incidents displayed on a live interactive map

Administrators can:

* Authenticate using a password
* Mark incidents as resolved
* Manage displayed reports

The system uses:

* Leaflet.js for interactive maps
* OpenStreetMap for map tiles
* LocalStorage for client-side data persistence
* JavaScript for dynamic report management

---

# Features

## Emergency Reporting

* Submit emergency incidents
* Add emergency type and details
* Include optional comments
* Upload incident images

## Interactive Map

* Real-time marker placement
* OpenStreetMap integration
* Location search and geocoding
* Automatic coordinate conversion

## Incident Management

* Incident status tracking
* Open/Resolved report states
* Dynamic report table updates
* Marker synchronization with reports

## Authentication

* Session-based login protection
* Admin password verification
* Restricted incident resolution access

## Local Data Persistence

* Reports saved in browser localStorage
* Data retained after page refresh
* Persistent incident records

---

# Technologies Used

## Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)

## Libraries and APIs

* Leaflet.js
* OpenStreetMap
* Leaflet Control Geocoder
* CryptoJS
* XLSX.js

---

# Project Structure

```text
Emergency-Reporting-Service-main/
│
├── index.html          # Main emergency reporting interface
├── login.html          # Login/authentication page
├── script.js           # Core application logic
├── style.css           # Styling and UI layout
├── README.md           # Project documentation
└── WhatsApp Image...   # Supporting image asset
```

---

# System Workflow

# 1. User Authentication

When users open the application:

```javascript
if (sessionStorage.getItem('authenticated') !== 'true') {
    window.location.href = 'login.html';
}
```

The system checks whether the user is authenticated.

If not authenticated:

* The user is redirected to the login page.

Authentication state is stored using:

```javascript
sessionStorage
```

---

# 2. Interactive Map Initialization

The application initializes a Leaflet map:

```javascript
const map = L.map("map").setView([49.276765, -122.917957], 12);
```

Features include:

* Zoom controls
* Map dragging
* Incident markers
* Geolocation search

The map uses OpenStreetMap tiles:

```javascript
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
```

---

# 3. Emergency Submission Form

Users can submit:

| Field          | Description              |
| -------------- | ------------------------ |
| Name           | Reporter name            |
| Phone          | Contact number           |
| Emergency Type | Type of incident         |
| Location       | Address or location name |
| Longitude      | Optional coordinate      |
| Latitude       | Optional coordinate      |
| Image          | Optional uploaded image  |
| Comments       | Additional details       |

Required fields:

* Name
* Phone
* Emergency Type
* Location

Validation is performed before submission.

---

# 4. Geolocation and Coordinate Handling

The system supports two location methods.

## Method 1: Manual Coordinates

Users can directly enter:

* Latitude
* Longitude

Example:

```text
Latitude: 49.2827
Longitude: -123.1207
```

---

## Method 2: Address Geocoding

If coordinates are not provided:

```javascript
geocoder.geocode(location, callback)
```

The system converts the address into coordinates automatically using:

* Leaflet Control Geocoder
* OpenStreetMap Nominatim API

---

# 5. Report Creation

Once validated:

```javascript
saveAndRenderReport(report)
```

The report object contains:

```javascript
{
  lat,
  lng,
  name,
  phone,
  image,
  emergency,
  location,
  comments,
  time,
  status
}
```

Default status:

```text
OPEN
```

---

# 6. Local Storage Persistence

Reports are stored locally in the browser:

```javascript
localStorage.setItem("emergencyReports", JSON.stringify(reports));
```

Benefits:

* Reports persist after refresh
* No backend server required
* Lightweight implementation

---

# 7. Marker Rendering

Each report creates:

* A map marker
* A report table entry

Markers visually represent incidents on the map.

When clicked:

* Incident details can be displayed
* Images and comments can be viewed

---

# 8. Emergency Report Table

The system dynamically updates the report table.

Displayed information includes:

| Column        | Description            |
| ------------- | ---------------------- |
| Location      | Incident location      |
| Type          | Emergency type         |
| Time Reported | Submission timestamp   |
| Status        | OPEN or RESOLVED       |
| Action        | Administrative actions |

---

# 9. Admin Resolution System

Administrators can mark incidents as resolved.

Password protection uses:

```javascript
CryptoJS.MD5()
```

Example:

```javascript
const adminPasswordHash = CryptoJS.MD5("remove").toString();
```

The system compares:

* Entered password hash
* Stored admin password hash

Once verified:

* The incident status changes
* The UI updates accordingly

---

# Main Files Explained

# index.html

Main application interface.

Contains:

* Map container
* Emergency reporting form
* Reports table
* Admin controls
* Incident display panel

---

# login.html

Handles:

* User authentication
* Session initialization
* Access control

---

# script.js

Core functionality file.

Responsible for:

* Map initialization
* Form validation
* Geocoding
* Report storage
* Marker rendering
* Authentication logic
* Incident status updates

---

# style.css

Defines:

* Layout styling
* Responsive UI
* Form appearance
* Table formatting
* Map dimensions
* Button styling

---

# Key JavaScript Functionalities

# Form Validation

```javascript
if (!name || !phone || !emergency || !location)
```

Ensures required information is entered.

---

# Image Upload Handling

```javascript
const reader = new FileReader();
```

Converts uploaded images into Base64 format.

Benefits:

* Easy browser storage
* Instant preview capability
* No backend dependency

---

# Dynamic Report Rendering

```javascript
addMarkerAndRow(report)
```

Adds:

* Map marker
* Table row
* Interactive report entry

---

# Map Filtering

The application updates visible reports based on:

* Zoom level
* Map boundaries

Events used:

```javascript
map.on("moveend")
map.on("zoomend")
```

---

# Running the Project

# 1. Download or Clone the Repository

```bash
git clone <repository-url>
```

---

# 2. Open the Project Folder

```bash
cd Emergency-Reporting-Service-main
```

---

# 3. Run the Application

Open:

```text
login.html
```

in a web browser.

Recommended browsers:

* Google Chrome
* Microsoft Edge
* Firefox

---

# Example Workflow

## Step 1

Login to the system.

## Step 2

Fill out emergency details.

## Step 3

Provide:

* Address
  OR
* Coordinates

## Step 4

Upload optional image evidence.

## Step 5

Submit the report.

## Step 6

View the incident marker on the map.

## Step 7

Administrators can resolve the incident.

---

# Example Report Object

```javascript
{
  name: "John Doe",
  phone: "123-456-7890",
  emergency: "Car Accident",
  location: "Burnaby, BC",
  lat: 49.2488,
  lng: -122.9805,
  comments: "Two vehicles involved",
  status: "OPEN"
}
```

---

# Security Considerations

Current security implementation includes:

* Session-based authentication
* Password hashing using MD5
* Admin-only resolution actions

However, this project is primarily educational.

Current limitations:

* No backend authentication
* No encrypted database
* LocalStorage vulnerability
* MD5 is not recommended for production security

---

# Limitations

This project is a frontend-only prototype.

Limitations include:

* No backend server
* No database integration
* No real emergency dispatch integration
* No live notifications
* No GPS tracking
* LocalStorage size limitations
* No multi-user synchronization

---

# Future Improvements

Potential enhancements include:

* Firebase or MongoDB integration
* Real-time emergency updates
* SMS/email notifications
* GPS live tracking
* Role-based authentication
* Secure backend API
* Cloud image storage
* Mobile application version
* Heatmap visualization
* Analytics dashboard
* Emergency prioritization system
* Integration with emergency responders

---

# Educational Value

This project demonstrates concepts in:

* Web development
* Interactive maps
* Geolocation systems
* Client-side storage
* JavaScript event handling
* Authentication systems
* Emergency management software
* Frontend application architecture

Useful for:

* Software engineering projects
* Web development portfolios
* GIS/map-based application learning
* Emergency response system prototypes
* Academic demonstrations

---

# Dependencies

## External Libraries

```text
Leaflet.js
Leaflet Control Geocoder
CryptoJS
XLSX.js
```

---

# Browser Support

Supported on modern browsers:

* Chrome
* Firefox
* Edge
* Safari

---

# Author

Developed as a browser-based emergency reporting and incident tracking system.

---

# License

This project is intended for educational and demonstration purposes.
