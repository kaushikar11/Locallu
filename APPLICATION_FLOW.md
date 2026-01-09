# Locallu - Complete Application Flow Documentation

## 🏗️ Architecture Overview

**Frontend**: React.js SPA (Single Page Application)
- **Port**: 3001 (development), served from `/dist` (production)
- **Build Tool**: Webpack + Babel
- **Styling**: Inline styles (no external CSS dependencies)
- **State Management**: React Context (AuthContext, ThemeContext)
- **Routing**: React Router DOM

**Backend**: Node.js + Express.js
- **Port**: 3000
- **Database**: Firebase Firestore (NoSQL)
- **Storage**: Firebase Cloud Storage (for profile pictures)
- **Authentication**: Firebase Admin Auth + JWT tokens
- **API**: RESTful endpoints under `/api/*`

---

## 🔄 Complete User Journey

### **Phase 1: Landing & Authentication**

#### 1.1 Landing Page (`/index` - `HomePage.js`)
- **User Action**: Enters email address
- **UI**: Two-column layout (hero text left, auth card right)
- **Features**:
  - Login/Signup tabs
  - Email input with validation
  - Optional name field for signup
- **Backend Call**: `GET /api/users/getUserId?email={email}`
- **Backend Process**:
  1. Firebase Admin Auth looks up user by email
  2. If user exists → returns user info (uid, email, displayName, photoURL)
  3. If user doesn't exist → Firebase creates new user automatically
  4. JWT token generated with 24h expiration
  5. Token includes: `{ uid, email, displayName, photoURL }`
- **Frontend Storage**:
  - JWT token → `localStorage.setItem('token', token)`
  - User data → `localStorage.setItem('user', JSON.stringify(user))`
- **Next Step**: Navigate to `/select-role`

#### 1.2 Role Selection (`/select-role` - `IndexPage.js`)
- **User Action**: Chooses "Business" or "Employee"
- **Backend Checks**:
  - Business: `GET /api/businesses/check-email/{email}` → checks if business profile exists
  - Employee: `GET /api/employees/check-email/{email}` → checks if employee profile exists
- **Routing Logic**:
  - **If profile exists** → Navigate to dashboard (`/business/dashboard` or `/employee/dashboard`)
  - **If profile doesn't exist** → Navigate to form (`/business/form` or `/employee/form`)

---

### **Phase 2: Profile Creation/Management**

#### 2.1 Business Form (`/business/form` - `BusinessFormPage.js`)
- **Fields Collected**:
  - Business Name (required)
  - Company Description (required)
  - Payment Information (required)
  - Product Purpose
  - Industry (comma-separated array)
  - Location (comma-separated array)
  - Contact Information (comma-separated array)
  - Website URL
  - Business Image (optional, uploaded to Firebase Storage)
- **Backend Call**: `POST /api/businesses` (with JWT in Authorization header)
- **Backend Process**:
  1. `authMiddleware` verifies JWT token
  2. Creates Business document in Firestore `businesses` collection
  3. Links businessId to user document: `users/{uid}.businessId = {businessId}`
  4. If image provided → uploads to Firebase Storage: `businesses/{businessId}/profilePicture/profilePicture.jpg`
- **Next Step**: Navigate to `/business/dashboard`

#### 2.2 Employee Form (`/employee/form` - `EmployeeFormPage.js`)
- **Fields Collected**:
  - First Name, Last Name (required)
  - Skills (comma-separated array)
  - Payment Information (required)
  - Purpose
  - Location (comma-separated array)
  - Contact Information (comma-separated array)
  - GitHub Link
  - Previous Jobs
  - Qualifications
  - About Employee
  - Profile Image (optional)
- **Backend Call**: `POST /api/employees` (with JWT)
- **Backend Process**: Similar to business, creates in `employees` collection
- **Next Step**: Navigate to `/employee/dashboard`

#### 2.3 Edit Profile Pages
- **Business Edit** (`/business/edit` - `BusinessEditPage.js`)
- **Employee Edit** (`/employee/edit` - `EmployeeEditPage.js`)
- **Features**:
  - Organized sections (Personal, Professional, Contact, Payment)
  - Click any field to edit in modal
  - Upload/change profile picture
- **Backend Calls**: `PUT /api/businesses/{businessId}` or `PUT /api/employees/{employeeId}`

---

### **Phase 3: Dashboard & Task Management**

#### 3.1 Business Dashboard (`/business/dashboard` - `BusinessDashboardPage.js`)

**Layout**:
- Header: Business name, description, "Edit Profile" button
- Stats Grid: Total Tasks, Pending, To Review, Approved
- Tasks Grid: All tasks created by this business

**Data Flow**:
1. `GET /api/users/{uid}` → Gets `businessId` from user document
2. `GET /api/businesses/{businessId}` → Gets business details
3. `GET /api/tasks/business/{businessId}` → Gets all tasks for this business

**Actions**:
- **Create Task**: Opens modal → `POST /api/tasks`
  - Fields: name, description, price, dueDate
  - Initial status: `'pending'`
  - Creates task document in Firestore `tasks` collection
- **View Task**: Click task card → Navigate to `/business/task/{taskId}`
- **Edit Profile**: Navigate to `/business/edit`

#### 3.2 Employee Dashboard (`/employee/dashboard` - `EmployeeDashboardPage.js`)

**Layout**:
- Header: Employee name, "Edit Profile" button
- Stats Grid: Available Tasks, Assigned, In Progress, Completed
- Tabs: "Available Tasks" | "My Tasks"
- Tasks Grid: Filtered by active tab

**Data Flow**:
1. `GET /api/users/emp/{uid}` → Gets `employeeId`
2. `GET /api/employees/{employeeId}` → Gets employee details
3. `GET /api/tasks/notassigned` → Gets available tasks (for "Available" tab)
4. `GET /api/tasks/assigned/{employeeId}` → Gets assigned tasks (for "My Tasks" tab)

**Actions**:
- **Claim Task**: `PUT /api/tasks/assign/{taskId}/{employeeId}`
  - Updates task: `isAssigned = true`, `assignedTo = employeeId`, `status = 'assigned'`
- **Start Working**: `PUT /api/tasks/status/{taskId}` → `status = 'in_progress'`
- **Submit Solution**: Opens modal → `PUT /api/tasks/submit/{taskId}` → `status = 'submitted'`

---

### **Phase 4: Task Lifecycle**

#### Task Status Workflow

```
pending → assigned → in_progress → submitted → reviewed → approved/rejected
   ↑         ↑           ↑                              ↓
   └─────────┴───────────┴─────────────────────────────┘
         (can unassign/reassign)
```

**Status Definitions**:
- **pending**: Task created, not yet assigned
- **assigned**: Task claimed by employee, not started
- **in_progress**: Employee actively working
- **submitted**: Solution submitted, awaiting review
- **reviewed**: Business reviewed the solution
- **approved**: Task completed, payment processed
- **rejected**: Solution rejected, can reassign

#### 4.1 Business Task View (`/business/task/{taskId}` - `BusinessTaskPage.js`)

**Data Flow**:
- `GET /api/tasks/{taskId}` → Gets full task details

**Actions**:
- **Update Task**: `PUT /api/tasks/update/{taskId}` → Updates description, price, dueDate
- **Delete Task**: `DELETE /api/tasks/delete/{taskId}`
- **Review Solution** (if status = 'submitted'):
  - `PUT /api/tasks/review/{taskId}`
  - Actions: `'approve'`, `'reject'`, `'request_changes'`
  - Updates status and adds `reviewComments`

#### 4.2 Employee Task View (`/employee/task/{taskId}` - `DoTaskPage.js`)

**Data Flow**:
- `GET /api/tasks/{taskId}` → Gets task details

**Actions**:
- **Start Working**: `PUT /api/tasks/status/{taskId}` → `status = 'in_progress'`
- **Submit Solution**: `PUT /api/tasks/submit/{taskId}` → Updates `solution` field, `status = 'submitted'`
- **View Submission**: If already submitted, shows solution and review comments

---

### **Phase 5: Session Management**

#### JWT Token Lifecycle

1. **Token Generation** (Login):
   - Backend: `jwt.sign({ uid, email, displayName, photoURL }, JWT_SECRET, { expiresIn: '24h' })`
   - Frontend: Stored in `localStorage`

2. **Token Validation** (Every API Call):
   - Request interceptor adds: `Authorization: Bearer {token}`
   - Backend `authMiddleware` verifies token
   - If invalid/expired → 401/403 response

3. **Automatic Token Refresh**:
   - Checks every 5 minutes
   - If token expires within 1 hour → Auto-refreshes
   - `POST /api/users/refresh-token` → Gets new 24h token
   - Updates `localStorage` automatically

4. **Activity-Based Extension**:
   - Monitors: mouse, keyboard, scroll, touch events
   - After 30 minutes of activity → Extends session
   - Keeps session alive during active use

5. **Error Recovery**:
   - 401 Unauthorized → Attempts token refresh
   - If refresh succeeds → Retries original request
   - If refresh fails → Logout and redirect to `/index`

---

## 📊 Data Models

### **Firestore Collections**

#### `users/{uid}`
```javascript
{
  businessId: "abc123",  // If user is a business
  employeeId: "xyz789"   // If user is an employee
}
```

#### `businesses/{businessId}`
```javascript
{
  businessName: "Acme Corp",
  companyDescription: "...",
  paymentInfo: "...",
  industry: ["Technology", "Finance"],
  location: ["New York", "USA"],
  contactInfo: ["+1-234-567-8900"],
  websiteURL: "https://...",
  uid: "firebase-uid",
  email: "business@example.com",
  // ... other fields
}
```

#### `employees/{employeeId}`
```javascript
{
  firstName: "John",
  lastName: "Doe",
  skills: ["JavaScript", "React"],
  paymentInfo: "...",
  qualifications: "...",
  previousJobs: "...",
  aboutEmployee: "...",
  uid: "firebase-uid",
  email: "employee@example.com",
  // ... other fields
}
```

#### `tasks/{taskId}`
```javascript
{
  name: "Build React Component",
  description: "...",
  price: 500,
  dueDate: "2025-01-15T10:00:00Z",
  dateCreated: "2025-01-10T10:00:00Z",
  status: "in_progress",  // String status
  isAssigned: true,
  assignedTo: "employeeId",
  businessId: "businessId",
  solution: "// Code solution here",
  reviewComments: "Great work!",
  reviewedAt: "2025-01-14T10:00:00Z"
}
```

---

## 🔐 Authentication Flow

### **Request Flow**:
```
1. User enters email on HomePage
2. Frontend: apiService.getUserId(email)
3. Backend: GET /api/users/getUserId?email={email}
4. Backend: Firebase Admin Auth → getUserByEmail(email)
5. Backend: Generate JWT token (24h expiration)
6. Frontend: Store token + user in localStorage
7. Frontend: All subsequent API calls include: Authorization: Bearer {token}
8. Backend: authMiddleware verifies token on protected routes
```

### **Protected Routes** (require JWT):
- All `/api/businesses/*` (except check-email)
- All `/api/employees/*` (except check-email)
- All `/api/tasks/*`
- `/api/users/{uid}` and `/api/users/emp/{uid}`
- `/api/users/refresh-token`

### **Public Routes**:
- `/api/users/getUserId` (login/signup)
- `/api/businesses/check-email/{email}`
- `/api/employees/check-email/{email}`

---

## 🎨 UI/UX Flow

### **Theme System**:
- Light/Dark mode toggle in Navbar
- Stored in `localStorage` as `'locallu-theme'`
- Applied via `body.theme-light` or `body.theme-dark` classes
- All components use inline styles that adapt to `isDark` state

### **Navigation**:
- **Landing** (`/index`) → No navbar
- **All other pages** → Navbar with:
  - Logo (links to `/`)
  - Theme toggle
  - User email/name
  - Logout button

### **Responsive Design**:
- Mobile-first approach
- Grid layouts adapt: `1fr` (mobile) → `repeat(auto-fit, minmax(300px, 1fr))` (desktop)
- All inline styles use responsive units (`clamp()`, media queries in `<style>` tags)

---

## 🔄 Complete Task Lifecycle Example

### **Scenario: Business creates task, Employee completes it**

1. **Business Creates Task**:
   - Business Dashboard → "Create Task" button
   - Modal opens → Fill form (name, description, price, dueDate)
   - `POST /api/tasks` → Task created with `status: 'pending'`
   - Task appears in dashboard

2. **Employee Claims Task**:
   - Employee Dashboard → "Available Tasks" tab
   - Sees task → Clicks "Claim Task"
   - `PUT /api/tasks/assign/{taskId}/{employeeId}`
   - Task status → `'assigned'`
   - Task moves to "My Tasks" tab

3. **Employee Starts Working**:
   - "My Tasks" tab → Clicks "Start Working"
   - `PUT /api/tasks/status/{taskId}` → `status: 'in_progress'`

4. **Employee Submits Solution**:
   - Clicks "Submit Solution" → Modal opens
   - Enters solution code/text
   - `PUT /api/tasks/submit/{taskId}` → `status: 'submitted'`
   - Solution stored in task document

5. **Business Reviews**:
   - Business Dashboard → Task shows "To Review" status
   - Clicks task → Views solution
   - Clicks "Approve" / "Reject" / "Request Changes"
   - `PUT /api/tasks/review/{taskId}` → Updates status + reviewComments
   - If approved → `status: 'approved'` (final state)
   - If rejected → `status: 'rejected'` (can reassign)
   - If changes requested → `status: 'in_progress'` (employee can resubmit)

---

## 🛡️ Security & Session Management

### **JWT Token Security**:
- Tokens signed with `JWT_SECRET` (from `.env`)
- 24-hour expiration
- Stored in `localStorage` (survives page refresh)
- Sent via `Authorization: Bearer {token}` header (not URL params)

### **Session Persistence**:
- Token survives browser refresh
- Auto-refreshes before expiration
- Activity-based extension
- Automatic cleanup on expiration

### **Error Handling**:
- 401 Unauthorized → Attempts token refresh → Retries request
- 403 Forbidden → Logout → Redirect to login
- Network errors → User-friendly error messages

---

## 📁 File Structure

```
database-schema-2/
├── src/
│   ├── pages/              # All page components
│   ├── components/         # Reusable UI components
│   ├── contexts/           # AuthContext, ThemeContext
│   ├── utils/              # API service, utilities
│   └── styles/             # Global styles (with Tailwind directives)
├── controllers/            # Backend business logic
├── models/                 # Data models (Task, Business, Employee)
├── routes/                 # Express route definitions
├── middleware/             # authMiddleware for JWT verification
├── config/                 # Firebase configuration
└── app.js                  # Express server setup
```

---

## 🚀 Key Features

1. **Zero External CSS Dependencies**: All styling is inline JavaScript objects
2. **Automatic Session Management**: JWT tokens auto-refresh, activity-based extension
3. **Role-Based Access**: Business vs Employee dashboards with different capabilities
4. **Complete Task Workflow**: From creation → assignment → completion → review → approval
5. **Profile Management**: Organized sections, inline editing, image uploads
6. **Responsive Design**: Works on mobile, tablet, desktop
7. **Dark/Light Mode**: Theme toggle with persistence
8. **Error Recovery**: Automatic token refresh on 401 errors

---

This is the complete flow of the Locallu application from landing page to task completion! 🎉

