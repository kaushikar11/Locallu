# Locallu

**The World's First AI Employer** — Where talent meets opportunity, and tasks get done.

Locallu is a modern task marketplace platform that connects businesses with skilled professionals. Think of it as Upwork meets the future—streamlined, intelligent, and built for speed.

---

## ✨ What Makes Locallu Special?

**For Businesses:**
- Post tasks, set budgets, and watch skilled professionals deliver
- Review and approve solutions with a single click
- Track everything from creation to completion with real-time status updates
- Manage your entire workflow in one beautiful dashboard

**For Employees:**
- Browse available opportunities that match your skills
- Claim tasks, work at your pace, submit solutions
- Get paid when your work is approved
- Build your profile and showcase your expertise

**The Platform:**
- Secure Firebase Authentication with JWT-based session management
- Real-time task status tracking (pending → assigned → in progress → submitted → approved)
- Solution review workflow with approve/reject/request changes
- Profile management with image uploads
- Search and filter capabilities
- Responsive design that works beautifully on any device

---

## 🛠️ Built With

### Frontend
- **React 18** — Modern, component-based UI
- **React Router** — Seamless navigation
- **Firebase Client SDK** — Authentication (email/password, Google OAuth)
- **Axios** — Reliable API communication
- **Webpack** — Optimized bundling and hot reload
- **Tailwind CSS** — Utility-first styling

### Backend
- **Node.js + Express** — Fast, scalable server
- **Firebase Firestore** — NoSQL database for flexible data structures
- **Firebase Storage** — Secure file uploads
- **Firebase Auth (REST API)** — Token verification
- **JWT** — Stateless session management
- **Multer** — File handling middleware

### Architecture
- **MVC Pattern** — Clean separation of concerns
- **RESTful API** — Standard, predictable endpoints
- **Protected Routes** — Secure access control
- **Token Refresh** — Seamless session management

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase project with Firestore, Storage, and Auth enabled

### Installation

1. **Clone and install:**
```bash
git clone <repository-url>
cd database-schema-2
npm install
```

2. **Environment setup:**
Create a `.env` file in the root:
```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (optional)
EMAIL=your_email@example.com
EMAIL_PASS=your_email_password
```

3. **Firebase configuration:**
- Place your `serviceAccountKey.json` in the `config/` directory (for backend operations)
- Ensure Firestore, Storage, and Auth are enabled in your Firebase console
- Configure Firebase Auth to allow Email/Password and Google OAuth providers

### Running Locally

**Development (both frontend & backend):**
```bash
npm run dev:all
```
- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000`

**Individual servers:**
```bash
# Frontend only (webpack dev server)
npm run dev

# Backend only (Express server)
npm run start
```

**Production:**
```bash
npm run build
npm run start
```

---

## 🔐 Authentication Flow

Locallu uses **Firebase Client SDK** for authentication with a backend token verification system:

### Email/Password Authentication

1. **Sign Up:**
   - User enters email, password, and optional name
   - Frontend calls `createUserWithEmailAndPassword()` from Firebase Client SDK
   - Firebase creates the user account
   - Frontend obtains Firebase ID token
   - ID token is sent to backend `/api/users/verify-token` endpoint
   - Backend verifies token and creates/updates user document in Firestore
   - Backend generates JWT token for application session
   - JWT token stored in cookies and localStorage

2. **Login:**
   - User enters email and password
   - Frontend calls `signInWithEmailAndPassword()` from Firebase Client SDK
   - Firebase authenticates the user
   - Frontend obtains Firebase ID token
   - ID token is sent to backend `/api/users/verify-token` endpoint
   - Backend verifies token and updates user document
   - Backend generates JWT token for application session

### Google OAuth Authentication

1. User clicks "Sign in with Google"
2. Frontend uses `signInWithPopup()` from Firebase Client SDK
3. Google OAuth popup appears
4. User authorizes with Google
5. Firebase returns authenticated user
6. Frontend obtains Firebase ID token
7. ID token is sent to backend `/api/users/verify-token` endpoint
8. Backend verifies token and creates/updates user document
9. Backend generates JWT token for application session

### Session Management

- **JWT Tokens** — Secure, stateless authentication (24h expiration)
- **Token Storage** — Stored in cookies (httpOnly) and localStorage
- **Token Refresh** — Automatic session renewal before expiration
- **Protected Routes** — Middleware guards sensitive endpoints
- **Activity-Based Sessions** — Stay logged in while you work

---

## 📁 Project Structure

```
database-schema-2/
├── src/                    # React application
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React contexts (Auth, Theme)
│   ├── pages/             # Page components
│   ├── styles/            # Global styles & design system
│   ├── utils/             # Utilities (API service)
│   ├── config/            # Firebase Client SDK config
│   └── App.js             # Main app component
├── api/                    # Vercel serverless function
│   └── index.js           # Express app wrapper for Vercel
├── config/                 # Firebase & service account
├── controllers/            # Business logic
├── middleware/             # Auth middleware
├── models/                 # Data models
├── routes/                 # API route definitions
├── utils/                 # Backend utilities (Firebase Auth REST API)
├── app.js                  # Express server entry point
└── vercel.json             # Vercel deployment configuration
```

---

## 📊 Task Lifecycle

```
┌─────────┐
│ Pending │  ← Task created, waiting for assignment
└────┬────┘
     │
     ▼
┌──────────┐
│ Assigned │  ← Employee claimed the task
└────┬─────┘
     │
     ▼
┌─────────────┐
│ In Progress │  ← Employee started working
└────┬────────┘
     │
     ▼
┌───────────┐
│ Submitted │  ← Solution ready for review
└────┬──────┘
     │
     ├─→ Approved ✅ → Payment processed
     └─→ Rejected ❌ → Can be reassigned or updated
```

---

## 🎯 Key Features

### Task Management
- Create tasks with descriptions, budgets, and deadlines
- Assign tasks to employees or let them claim opportunities
- Track progress through the entire workflow
- Review, approve, or request changes on submissions

### Profile System
- Rich business profiles with company info, industry, location
- Detailed employee profiles with skills, qualifications, portfolio links
- Profile picture uploads with preview
- Editable fields with inline editing modals

### Dashboard Analytics
- Real-time stats: total tasks, pending, in progress, completed
- Visual status indicators with color-coded badges
- Search functionality to find tasks quickly
- Filter by status, date, or keywords

### User Experience
- Smooth page transitions and micro-interactions
- Responsive design that adapts to any screen size
- Dark mode support
- Loading states and error handling throughout
- Empty states with helpful CTAs

---

## 🔌 API Overview

### Authentication
- `POST /api/users/verify-token` — Verify Firebase ID token and get JWT session token
- `POST /api/users/refresh-token` — Refresh JWT token
- `GET /api/users/getUserId?email=<email>` — Legacy endpoint (deprecated)

### Businesses
- `POST /api/businesses` — Create business profile
- `GET /api/businesses/:id` — Get business details
- `GET /api/businesses/check-email/:email` — Check if business profile exists
- `PUT /api/businesses/:id` — Update business field
- `PUT /api/businesses/:id/updateProfilePicture` — Upload logo

### Employees
- `POST /api/employees` — Create employee profile
- `GET /api/employees/:id` — Get employee details
- `GET /api/employees/check-email/:email` — Check if employee profile exists
- `PUT /api/employees/:id` — Update employee field
- `PUT /api/employees/:id/updateProfilePicture` — Upload photo

### Tasks
- `POST /api/tasks` — Create new task
- `GET /api/tasks/:id` — Get task details
- `GET /api/tasks/business/:businessId` — Get all business tasks
- `GET /api/tasks/notassigned` — Browse available tasks
- `GET /api/tasks/assigned/:employeeId` — Get employee's tasks
- `PUT /api/tasks/assign/:taskId/:empId` — Assign task
- `PUT /api/tasks/unassign/:taskId` — Unassign task
- `PUT /api/tasks/submit/:taskId` — Submit solution
- `PUT /api/tasks/review/:taskId` — Review solution
- `PUT /api/tasks/status/:taskId` — Update status
- `PUT /api/tasks/update/:taskId` — Update task details
- `DELETE /api/tasks/delete/:taskId` — Delete task

---

## 🚀 Deployment

### Vercel Deployment

This project is configured for deployment on Vercel:

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard (same as `.env` file)
3. **Deploy** — Vercel will automatically:
   - Run `npm run build` to build the React app
   - Deploy the Express API as serverless functions
   - Serve static files from `dist/` directory
   - Handle routing for React Router (SPA)

**Vercel Configuration (`vercel.json`):**
- API routes (`/api/*`) → Serverless function
- Static assets → Served from `/dist/`
- All other routes → Serve `index.html` for React Router

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Firebase errors?**
- Verify `serviceAccountKey.json` is in `config/`
- Check Firebase console for enabled services
- Ensure Firestore rules allow your operations
- Verify Firebase Auth providers are enabled (Email/Password, Google)

**Authentication not working?**
- Check browser console for Firebase errors
- Verify Firebase configuration in `src/config/firebase.js`
- Ensure Firebase Auth domain is whitelisted in Firebase console
- Check backend logs for token verification errors

**Build issues?**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**API not responding?**
- Check backend is running on port 3000
- Verify CORS settings in `app.js`
- Check browser console for network errors
- Verify environment variables are set correctly

**Vercel deployment issues?**
- Check `vercel.json` configuration
- Verify build command in `package.json`
- Check Vercel function logs for errors
- Ensure all environment variables are set in Vercel dashboard

---

## 📝 Development Notes

- Frontend runs on port 3001 in development (webpack-dev-server)
- Backend runs on port 3000 (Express)
- API requests are proxied from frontend to backend automatically
- Production build serves React app from `dist/` folder
- All protected routes require valid JWT token in Authorization header
- Firebase Client SDK handles authentication on frontend
- Backend verifies Firebase ID tokens and manages application sessions

---

## 🎨 Design Philosophy

Locallu is built with attention to detail. Every interaction is intentional, every transition is smooth, and every pixel serves a purpose. The interface is clean, modern, and designed to get out of your way so you can focus on what matters: getting work done.

- **Consistent spacing** — 8px grid system for perfect alignment
- **Fluid typography** — Responsive text that scales beautifully
- **Semantic colors** — Status indicators that make sense at a glance
- **Micro-interactions** — Subtle animations that provide feedback
- **Accessibility** — Keyboard navigation, focus states, screen reader support

---

## 🤝 Contributing

This is a private project, but if you're here, welcome! Feel free to open issues or submit pull requests.

---

## 📄 License

MIT License — Use it, learn from it, build something amazing.

---

## 👨‍💻 Built By

**Kaushik**

*Crafting digital experiences, one component at a time.*

---

**Locallu** — Where work gets done, and talent gets paid. 🚀
