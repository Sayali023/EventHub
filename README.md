
# EventHub – College Event Management System

**Plan. Publish. Participate.**

EventHub is a web-based college event management system designed to make it easier for students to discover college events and register for them. It provides an interface for viewing, searching, filtering, creating, updating, and deleting events.

## Project Overview

College events are an important part of campus life, but managing event information and registrations manually can be time-consuming. EventHub provides a centralized platform where event details and student registrations can be managed efficiently.

The project demonstrates full-stack web development using React, Node.js, Express.js, and MongoDB.

## Objectives

- Provide a centralized platform for college events.
- Display event details such as title, description, date, venue, and department.
- Allow users to search and filter events.
- Enable students to register for events.
- Support creating, updating, and deleting events.
- Store event and registration data in MongoDB.
- Build a responsive and user-friendly interface.

## Features

- **Event Listing:** View available college events.
- **Search Events:** Find events using search functionality.
- **Department Filter:** Filter events by department.
- **Create Events:** Add new events with relevant details.
- **Update Events:** Edit existing event information.
- **Delete Events:** Remove events when required.
- **Event Registration:** Register for an event using student details.
- **My Registrations:** View registrations associated with the entered email.
- **REST API:** Communicate between the frontend and backend.
- **Responsive UI:** Access the interface on different screen sizes.

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios

### Backend
- Node.js
- Express.js
- Mongoose

### Database
- MongoDB

### Development Tools
- Visual Studio Code
- npm
- Git and GitHub

## Project Structure

```text
campus-event-registration/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── index.html
│   └── package.json
│
├── package.json
├── package-lock.json
└── README.md
```

*Note: The structure above represents the main project files. Other files may be present in the actual project.*

## System Architecture

The application follows a client-server architecture.

1. **Frontend:** React provides the user interface and uses Axios to send HTTP requests.
2. **Backend:** Express.js handles API requests, validates incoming data, and performs application operations.
3. **Database:** MongoDB stores event and registration records.
4. **Mongoose:** Connects the backend application to MongoDB and provides data models.

### Data Flow

```text
User
  ↓
React Frontend
  ↓
Axios HTTP Requests
  ↓
Express.js REST API
  ↓
Mongoose
  ↓
MongoDB Database
```

## Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Community Server running locally, or an accessible MongoDB database
- Visual Studio Code (recommended)

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd campus-event-registration
```

Replace the placeholder with your actual repository URL. If you already have the project locally, skip this step.

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` folder and add the MongoDB connection variable expected by `server.js`.

For a local MongoDB setup, the value may be:

```env
MONGO_URI=mongodb://127.0.0.1:27017/campus_events
```

**Important:** The variable name must match the one used in your backend code. If your `server.js` uses `MONGODB_URI` instead of `MONGO_URI`, use that name instead.

Do not upload database passwords or other secrets to a public repository.

### 4. Start the Backend

From the `backend` directory, run the start command defined in its `package.json`. If the project uses `nodemon` with `server.js`, run:

```bash
npx nodemon server.js
```

The backend should start on the port configured in `server.js`, typically port 5000.

### 5. Install Frontend Dependencies

Open a **second terminal** in Visual Studio Code and run:

```bash
cd frontend
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

Open the local URL printed by Vite in your browser. It may be `http://localhost:5173/` or another port if that port is already in use.

Keep both the backend and frontend terminals running while using the application.

## API Endpoints

The backend provides the following REST API endpoints.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend health |
| GET | `/api/events` | Retrieve all events |
| GET | `/api/events/:id` | Retrieve a specific event |
| POST | `/api/events` | Create an event |
| PUT | `/api/events/:id` | Update an event |
| DELETE | `/api/events/:id` | Delete an event |
| POST | `/api/registrations` | Register for an event |
| GET | `/api/registrations` | Retrieve registrations |
| GET | `/api/events/:id/registrations` | Retrieve registrations for a specific event |

## Database Design

The application uses MongoDB to store event and registration information.

### Event Collection

The event records include fields such as:

- `title` – Name of the event.
- `description` – Details about the event.
- `date` – Scheduled event date.
- `venue` – Event location.
- `department` – Department associated with the event.

### Registration Collection

The registration records include fields such as:

- `studentName` – Name of the student.
- `email` – Student's email address.
- `eventId` – Reference to the registered event.

The application also uses a unique index on the combination of email and event ID to help prevent duplicate registrations for the same event.

## Testing

The following checks can be performed before submission:

- Verify that the homepage loads correctly.
- Check whether existing events are displayed.
- Create an event and verify that it appears in the event list.
- Edit an event and confirm that the changes are visible.
- Delete an event and confirm that it is removed.
- Search for events using keywords.
- Filter events by department.
- Register for an event using student details.
- Check whether the registration appears in My Registrations.
- Try registering the same email for the same event again.
- Verify that the backend connects successfully to MongoDB.
- Check browser and terminal consoles for errors.

## Limitations

- User authentication and role-based access control are not currently implemented.
- Event creation, editing, and deletion are not restricted to authorized administrators.
- Registration data is managed through the application without a complete student account system.
- The project requires a running backend and accessible MongoDB database.
- The current implementation is intended as an academic mini project rather than a production-ready public service.

## Future Enhancements

- Add student, faculty, and administrator authentication.
- Introduce role-based permissions.
- Add event capacity and waiting-list management.
- Send email confirmations and event reminders.
- Add an administrator dashboard and event analytics.
- Improve registration privacy and security.
- Deploy the application with secure configuration and access controls.

## Conclusion

EventHub demonstrates how a full-stack web application can simplify college event discovery and registration. By combining React, Express.js, Node.js, and MongoDB, the project brings event information and registration management into one platform.

The project also provides practical experience with REST APIs, database integration, CRUD operations, frontend development, and client-server communication.

---

**Project:** EventHub – College Event Management System  
**Project Type:** Full-Stack Web Development Mini Project  
**Technology:** React.js, Node.js, Express.js, MongoDB
