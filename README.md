# Job Tracker App

## Features
- Add, view, edit, delete jobs
- Filter jobs by status
- Sort jobs by date
- Loading and error states

## Setup Backend
1. Go to the server folder: `cd server`
2. Install dependencies: `npm install express cors body-parser uuid bcrypt jsonwebtoken dotenv`
3. Run server: `node index.js`
4. Server runs on: http://localhost:5000
5. Create .env file: `JWT_SECRET=(Whatever you want)`

## Setup Frontend
1. Go to the client folder: `cd client`
2. Create React app (if not already created): `npx create-react-app .`
3. Install axios: `npm install axios`
4. Start frontend: `npm start`
5. Open: http://localhost:3000
