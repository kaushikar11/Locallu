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
- Secure JWT-based authentication that keeps your session alive
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
- **Axios** — Reliable API communication
- **Webpack** — Optimized bundling and hot reload
- **Custom Design System** — Cohesive, polished interface

### Backend
- **Node.js + Express** — Fast, scalable server
- **Firebase Firestore** — NoSQL database for flexible data structures
- **Firebase Storage** — Secure file uploads
- **Firebase Auth** — Enterprise-grade authentication
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
JWT_SECRET=your_super_secret_jwt_key_here
EMAIL=your_email@example.com
EMAIL_PASS=your_email_password
PORT=3000
```

3. **Firebase configuration:**
- Place your `serviceAccountKey.json` in the `config/` directory
- Ensure Firestore, Storage, and Auth are enabled in your Firebase console

### Running Locally

**Development (both frontend & backend):**
```bash
npm run dev:all
```
- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000`

**Production:**
```bash
npm run build
npm run start
```

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
│   └── App.js             # Main app component
├── config/                 # Firebase & service account
├── controllers/            # Business logic
├── middleware/             # Auth middleware
├── models/                 # Data models
├── routes/                 # API route definitions
└── app.js                  # Express server entry point
```

---

## 🔐 Authentication & Security

- **JWT Tokens** — Secure, stateless authentication
- **Authorization Headers** — Tokens sent via `Authorization: Bearer <token>`
- **Token Refresh** — Automatic session renewal
- **Protected Routes** — Middleware guards sensitive endpoints
- **Activity-Based Sessions** — Stay logged in while you work

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
- Dark mode support (because night owls need love too)
- Loading states and error handling throughout
- Empty states with helpful CTAs

---

## 🔌 API Overview

### Authentication
- `GET /api/users/getUserId?email=<email>` — Get user ID and JWT token
- `POST /api/users/refresh-token` — Refresh JWT token

### Businesses
- `POST /api/businesses` — Create business profile
- `GET /api/businesses/:id` — Get business details
- `PUT /api/businesses/:id` — Update business field
- `PUT /api/businesses/:id/updateProfilePicture` — Upload logo

### Employees
- `POST /api/employees` — Create employee profile
- `GET /api/employees/:id` — Get employee details
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

## 🎨 Design Philosophy

Locallu is built with attention to detail. Every interaction is intentional, every transition is smooth, and every pixel serves a purpose. The interface is clean, modern, and designed to get out of your way so you can focus on what matters: getting work done.

- **Consistent spacing** — 8px grid system for perfect alignment
- **Fluid typography** — Responsive text that scales beautifully
- **Semantic colors** — Status indicators that make sense at a glance
- **Micro-interactions** — Subtle animations that provide feedback
- **Accessibility** — Keyboard navigation, focus states, screen reader support

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Firebase errors?**
- Verify `serviceAccountKey.json` is in `config/`
- Check Firebase console for enabled services
- Ensure Firestore rules allow your operations

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

---

## 📝 Development Notes

- Frontend runs on port 3001 in development (webpack-dev-server)
- Backend runs on port 3000 (Express)
- API requests are proxied from frontend to backend automatically
- Production build serves React app from `dist/` folder
- All protected routes require valid JWT token in Authorization header

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
