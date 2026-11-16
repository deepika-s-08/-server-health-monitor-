# Server Health Monitoring Dashboard

A web-based application to monitor website and server availability using a simple dashboard.

## Live Demo

[Open Server Health Dashboard](https://server-health-monitor1.vercel.app)

## Backend API

https://server-health-monitor-crcr.onrender.com

## Features

- Add and manage multiple servers.
- Check server availability manually.
- Display Healthy, Down, and Unknown statuses.
- Measure server response time.
- Display last checked date and time.
- Delete monitored servers.
- Store server information in MongoDB.

## Technologies Used

**Frontend**
- React.js
- CSS
- Vite

**Backend**
- Node.js
- Express.js
- Axios

**Database**
- MongoDB
- Mongoose

**Deployment**
- Vercel (Frontend)
- Render (Backend)

## Project Structure

```text
server-health-monitor/
├── client/
│   └── src/
├── server/
│   ├── models/
│   ├── routes/
│   └── server.js
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/deepika-s-08/-server-health-monitor-.git
cd -server-health-monitor-
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file inside the server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file inside the client folder:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

## Health Status

- **Healthy:** Server responds with a successful HTTP status.
- **Down:** Server request fails or returns an unsuccessful status.
- **Unknown:** Server has not been checked yet.

## Author

**Deepika S.**

GitHub: [deepika-s-08](https://github.com/deepika-s-08)
