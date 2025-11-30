Employee Attendance System

Name : Narendra Mudda

College Name : Vignan's Lara Institute of Technology and Science

Contact No : 9381209533

Description : A full-stack web application for managing employee attendance with features like check-in, check-out, admin dashboard, reports, and CSV export.

Built using React js, Node.js, Express, MongoDB, and Tailwind CSS.

-------------------------------------------------------------------------Username and Password---------------------------------------------------------------------------------------------------------------------

Manager

username:alice.manager@example.com

password:password123

Employee

Username:employee3@example.com

password:password123

------------------------------------------------------------------------------Features------------------------------------------------------------------------------------------------------------------------------

✅ Employee


Check-In and Check-Out


Prevent multiple check-ins/check-outs on the same day


View attendance history


Secure login & JWT authentication


✅ Admin


View full attendance records


Export attendance as CSV


Monitor daily check-ins


Search and filter by date or employee


-------------------------------------------------------------------Tech Stack---------------------------------------------------------------------------------------------------------------------------------------


Backend

Node.js

Express.js


MongoDB + Mongoose


JWT Authentication


json2csv for report export


Frontend


HTML, CSS, JS


Tailwind CSS


EJS Templates (or React if you used it)


Tools


Git & GitHub


VS Code


Postman (for API testing)

------------------------------------------------------------------------Project Structure-------------------------------------------------------------------------------------------------------------------------

employee-attendance/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── attendanceController.js
│   │   └── authController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── role.js
│   ├── models/
│   │   ├── Attendance.js
│   │   └── User.js
│   ├── routes/
│   │   ├── attendance.js
│   │   └── auth.js
│   ├── tools/
│   │   └── hashPlainPassword.js
│   ├── seed/
│   │   └── seed.js
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── app/
│       │   └── store.js
│       ├── components/
│       │   ├── Employee/
│       │   │   ├── CalendarView.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── MarkAttendance.jsx
│       │   │   ├── MyHistory.jsx
│       │   │   ├── Profile.jsx
│       │   │   └── StatusBadge.jsx
│       │   └── Manager/
│       │       ├── AllEmployees.jsx
│       │       ├── ManagerDashboard.jsx
│       │       ├── Reports.jsx
│       │       ├── TeamCalendar.jsx
│       │       └── TeamDashboard.jsx
│       ├── features/
│       │   ├── attendance/
│       │   └── auth/
│       ├── routes/
│       ├── utils/
│       │   └── api.js
│       ├── App.js
│       ├── index.js
│       └── tailwind.config.js
│
├── package.json
└── README.md
-------------------------------------------------------------------------How to Run Application------------------------------------------------------------------------------------------------------------------

Backend Setup

1️⃣ Go to backend folder

cd backend

npm install


2️⃣ Create .env file

MONGO_URI=your_mongo_connection_string

JWT_SECRET=your_secret

PORT=5000


3️⃣ Run the backend

npm start


🎨 Frontend Setup (React + Redux + Tailwind)

1️⃣ Go to frontend

cd frontend

npm install


2️⃣ Start the React app

npm start


🔗 API Endpoints (Summary)

Auth


POST /api/auth/register


POST /api/auth/login


Attendance


POST /api/attendance/check-in


POST /api/attendance/check-out


GET /api/attendance/my-history


GET /api/attendance/all (Admin)


🔐 Authentication & Security


JWT-based authentication


Middleware: auth.js for token validation


Role middleware: prevents employee from accessing admin pages


Protected routes in React using ProtectedRoute.jsx


📊 UI Features


Tailwind CSS


Reusable components


Manager & Employee separate dashboards


Calendar-based UI for attendance


Redux Toolkit for global state


Custom Axios API handler


📝 Scripts


-------------------Backend-----


npm start



-----------Frontend-----------


npm start

---------------------------------------------------------------------seed.js----------------------------------------------------------------------------------------------------------------------------------------

const managerData = {

    name: 'Alice Manager',
    email: 'alice.manager@example.com',
    password: 'password123',
    role: 'manager',
    employeeId: 'EMP001',
    department: 'HR'
    
  };
  const EmployeeData={
  
     name: 'Employee3',
    email: 'employee3@example.com',
    password: 'password123',
    employeeId: 'EMP003',
    department: 'Engineer'
    
  }
  Like these I have created 22 employees and marking 15days attendance for each Employee and each employee will be related to the following departments 
  
  const departments = ['Engineering', 'Sales', 'Support'];
  
