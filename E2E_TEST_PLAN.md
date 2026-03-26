# End-to-End Testing Plan - December 6, 2025

## Test Environment
- **Backend:** Running on http://localhost:5000 ✅
- **Frontend:** Running on http://localhost:8080 ✅
- **Database:** MongoDB connected ✅

## Test Flows

### FLOW 1: PATIENT - Complete Journey
- [ ] **Signup:** POST /api/auth/register → Create new patient account
- [ ] **Login:** POST /api/auth/login → Authenticate patient
- [ ] **Profile Setup:** PUT /api/user/profile → Update patient profile with health info
- [ ] **View Profile:** GET /api/user/profile → Retrieve profile
- [ ] **New Consultation:** POST /api/consultations → Submit symptoms & health info
- [ ] **See AI Result:** GET /api/consultations/my → View AI assessment in consultation
- [ ] **See History:** GET /api/consultations/my → View all consultations
- [ ] **Book Appointment:** POST /api/appointments → Create appointment with doctor
- [ ] **View Appointments:** GET /api/appointments/my → See booked appointments
- [ ] **Cancel Appointment:** PUT /api/appointments/:id/cancel → Cancel appointment

### FLOW 2: DOCTOR - Complete Journey
- [ ] **Login:** POST /api/auth/login → Authenticate with seeded doctor account
  - Email: doctor@ayur.com
  - Password: Doctor123
- [ ] **View Consultations:** GET /api/doctor/consultations → Get pending/doctor/urgent consultations
- [ ] **Add Feedback:** PUT /api/doctor/consultations/:id/feedback → Submit doctor notes
- [ ] **View Appointments:** GET /api/appointments/doctor/list → Get doctor's appointments
- [ ] **View Profile:** GET /api/doctor/profile → Get doctor stats

### FLOW 3: ADMIN - Complete Journey
- [ ] **Login:** POST /api/auth/login → Authenticate with seeded admin account
  - Email: admin@ayur.com
  - Password: Admin123
- [ ] **Seed Data:** POST /api/admin/seed → Populate test data (symptoms, diseases)
- [ ] **View Users:** GET /api/admin/users → List all users
- [ ] **Change Role:** PUT /api/admin/users/:id/role → Update user role
- [ ] **Manage Symptoms:** 
  - [ ] GET /api/admin/symptoms → View symptoms
  - [ ] POST /api/admin/symptoms → Create symptom
  - [ ] PUT /api/admin/symptoms/:id → Update symptom
  - [ ] DELETE /api/admin/symptoms/:id → Delete symptom
- [ ] **Manage Diseases:**
  - [ ] GET /api/admin/diseases → View diseases
  - [ ] POST /api/admin/diseases → Create disease
  - [ ] PUT /api/admin/diseases/:id → Update disease
  - [ ] DELETE /api/admin/diseases/:id → Delete disease
- [ ] **Manage Treatments:**
  - [ ] GET /api/admin/treatments → View treatments
  - [ ] POST /api/admin/treatments → Create treatment
  - [ ] PUT /api/admin/treatments/:id → Update treatment
  - [ ] DELETE /api/admin/treatments/:id → Delete treatment
- [ ] **View All Consultations:** GET /api/admin/consultations → Admin view of all consultations

## Issues to Watch For
- [ ] URL mismatches (endpoints vs frontend calls)
- [ ] Payload shape mismatches (required fields, data types)
- [ ] Missing fields in responses
- [ ] JWT token handling
- [ ] Authorization errors (role-based access)
- [ ] CORS issues
- [ ] MongoDB connection/validation errors

## Test Results

### Backend Health
- Health endpoint (GET /api/health): ✅ 200 OK

### Test Execution Notes
(To be updated during testing)

