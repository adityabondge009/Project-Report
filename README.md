#Project-Report
#Project-Report

# Intelligent Academic Portfolio & Course Analytics Platform

## Project Overview

The **Intelligent Academic Portfolio & Course Analytics Platform** is a full-stack web application designed to transform a traditional academic portfolio into a dynamic, data-driven system.
The platform showcases a professor’s profile, courses, works, and lectures while intelligently tracking user interactions and generating personalized recommendations.

Unlike static portfolio websites, this system provides analytics, content intelligence, and persistence without relying on heavy databases, making it suitable for academic environments and easy deployment.

---

## Features

* Dynamic academic profile display
* Course listing with view tracking
* Intelligent homepage slides
* Personalized course recommendations
* Visitor analytics (per-user and global)
* Persistent contact form messages
* Modular and extensible architecture

---

## Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla)

### Backend

* Node.js
* Express.js

### Data Storage

* JSON-based persistence (no database dependency)

### Other Tools

* RESTful APIs
* Git & GitHub

---

## Project Structure

```
project-root/
│
├── backend/
│   ├── data/
│   │   ├── users.json
│   │   ├── visits.json
│   │   ├── courses.json
│   │   ├── messages.json
│   │
│   ├── middleware/
│   │   └── attachUser.js
│   │
│   ├── routes/
│   │   ├── home.js
│   │   ├── courses.js
│   │   ├── slides.js
│   │   ├── professor.js
│   │   └── contact.js
│   │
│   ├── utils/
│   │   └── storage.js
│   │
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── works.html
│   ├── courses.html
│   ├── contact.html
│   ├── style.css
│   └── script.js
│
├── README.md
```

---

## How It Works

### User Identification

* Each visitor is assigned a unique ID via middleware
* ID persists across page reloads
* Used for analytics and personalization

### Analytics & Tracking

* Tracks course views, slide interactions, and visits
* Maintains per-user and global statistics
* Prevents duplicate tracking per user

### Recommendations

* Uses interaction history to suggest courses
* Ranks content based on popularity and recency

### Slides Intelligence

* Homepage slides are dynamically loaded
* Supports auto-rotation and manual navigation
* Slides link to relevant content

### Contact Form

* Messages are validated and stored persistently
* Data saved in JSON for later access

---

## Installation & Running the Project

### Prerequisites

* Node.js (v18+ recommended)
* Git

### Steps

1. Clone the repository:

```
git clone https://github.com/adityabondge009/Project-Report.git
```

2. Navigate to backend directory:

```
cd backend
```

3. Install dependencies:

```
npm install
```

4. Start the server:

```
node server.js
```

5. Open the frontend in browser:

```
http://localhost:8080
```

---

## Testing

* Manual functional testing
* API testing via browser and curl
* Verified:

  * User ID persistence
  * Analytics accuracy
  * Course tracking
  * Contact message storage

---

## Limitations

* JSON storage is not scalable for large datasets
* No authentication or role-based access
* Single-admin assumption

---

## Future Enhancements

* Migration to PostgreSQL or MongoDB
* Authentication & authorization
* Admin dashboard
* Cloud deployment
* Advanced recommendation algorithms

---

## Author

**Aditya Bondge**
Department of Computer Science, PUCSD

---

## References

* Node.js Documentation – [https://nodejs.org](https://nodejs.org)
* Express.js Documentation – [https://expressjs.com](https://expressjs.com)
* MDN Web Docs – [https://developer.mozilla.org](https://developer.mozilla.org)
* REST API Design Principles
