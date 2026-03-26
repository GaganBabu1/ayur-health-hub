# 🏥 E-Ayurvedic Health Hub - User Walkthrough Guide

## Quick Start - Test Credentials

### Default Test Users (For Testing)

#### **Patient Account**
- **Email:** patient@test.com
- **Password:** password123
- **Role:** Patient

#### **Doctor Account**
- **Email:** doctor@test.com
- **Password:** password123
- **Role:** Doctor

#### **Admin Account**
- **Email:** admin@test.com
- **Password:** password123
- **Role:** Admin

---

## 📋 Complete User Journey Examples

### **SCENARIO 1: New Patient Registration & First Consultation**

#### Step 1: Sign Up
1. Go to **Home Page** (`/`)
2. Click **"Get Started"** or **"Sign Up"** button
3. Fill in registration form:
   - **Email:** newtestpatient@example.com
   - **Name:** Rajesh Kumar
   - **Password:** MyPassword123
   - **Confirm Password:** MyPassword123
4. Click **"Create Account"**
5. ✅ Account created, redirected to **Profile Setup** page

#### Step 2: Complete Profile Setup
1. On **Profile Setup** page (`/profile-setup` or auto-redirected):
   - **Name:** Rajesh Kumar (pre-filled from signup)
   - **Age:** 35
   - **Gender:** Male
   - **Height:** 170 cm
   - **Weight:** 75 kg
   - **Lifestyle:** Moderate
   - **Sleep Quality:** 5/10
   - **Chronic Conditions:** Acid reflux
   - **Allergies:** Dairy
   - **Disease History:** Hypertension (family history)
2. Click **"Save Profile"**
3. ✅ Redirected to **Dashboard**

#### Step 3: View Dashboard
- **URL:** `/dashboard`
- **See:**
  - Welcome message with your name
  - Quick stats cards (pending consultations, health score, etc.)
  - Quick action buttons
  - Floating AI Chatbot in bottom-right corner

#### Step 4: Start a New Consultation
1. Click **"New Consultation"** button or navigate to `/consultation/new`
2. Fill consultation form:
   - **Select Symptoms** (multi-select):
     - Fever (click to add)
     - Cough (click to add)
     - Fatigue (click to add)
   - **Mental State Questions:**
     - Stress Level: 6/10
     - Sleep Quality: 5/10
     - Mood: Anxious
   - **Additional Notes:** "Symptoms started 3 days ago after exposure to cold weather"
3. Click **"Analyze with AI"**
4. ✅ Results page loads with AI analysis

#### Step 5: Review Consultation Results
- **URL:** `/consultation/:id`
- **See:**
  - **Header:** Date, Triage Level badge (Normal/Doctor/Urgent)
  - **Symptoms:** All selected symptoms displayed as badges
  - **AI Disease Analysis:** 
    - Disease predictions with confidence percentages
    - Progress bars showing confidence levels
  - **Herbal Recommendations:** Herbs with dosage and benefits
  - **Dietary Recommendations:** Foods to consume and avoid
  - **Lifestyle Recommendations:** Daily practices and yoga exercises

#### Step 6: Additional Features on Result Page
1. **Print Consultation:**
   - Click **"Print"** button (top-right)
   - Browser print dialog appears
   - Save as PDF or print to physical printer
   - ✅ Print-friendly layout shows only consultation content

2. **Download PDF:**
   - Click **"Download PDF"** button
   - Toast notification: "Download will be implemented with backend"
   - Ready for backend integration

3. **Share with Doctor:**
   - Click **"Share with Doctor"** button
   - Modal opens with doctor dropdown
   - Select: "Dr. Sharma"
   - Add optional message: "Please review my consultation"
   - Click **"Share Consultation"**
   - ✅ Toast: "Consultation shared successfully"

4. **Add Personal Notes:**
   - Scroll to **"Your Notes"** section
   - Enter feedback: "I've been following the recommendations for 2 days and feeling better already"
   - Click **"Save Notes"**
   - ✅ Toast: "Your notes have been saved successfully"

5. **Chat with AI Assistant:**
   - Click floating chatbot button (bottom-right)
   - Chat panel opens
   - Type: "What can I do for fever relief?"
   - AI responds with ayurvedic suggestions
   - Chat history maintained in panel

#### Step 7: View Consultation History
1. Click **"Consultation History"** in sidebar or navigate to `/consultation/history`
2. **See:**
   - List of all past consultations
   - Each card shows: date, symptoms, triage level, status
   - Click card to view full results again
   - Can filter by status or date range

---

### **SCENARIO 2: Book an Appointment**

#### Step 1: Navigate to Appointments
1. Click **"Appointments"** in sidebar or go to `/appointments`
2. **See:**
   - Upcoming appointments (if any)
   - Past appointments list
   - **"Book New Appointment"** button

#### Step 2: Book New Appointment
1. Click **"Book New Appointment"** or go to `/appointments/new`
2. **Select Doctor:**
   - Click doctor dropdown
   - Select: "Dr. Sharma - Ayurvedic Physician"
   - **See:** Doctor details appear (15 years experience, 4.8 rating)
3. **Choose Date:**
   - Click date picker
   - Select future date: Dec 15, 2025
   - Date must be tomorrow or later
4. **Select Time Slot:**
   - After choosing date, time slots appear
   - Click **"10:30 AM"** (green button)
   - **See:** Selected slot highlighted in green
   - Confirmation: "10:30 AM with Dr. Sharma on Dec 15"
5. **Reason/Notes:**
   - Add optional notes: "Follow-up for digestive health - want to discuss dietary changes"
6. Click **"Confirm Appointment"**
7. ✅ Toast: "Your appointment has been booked successfully"
8. Redirected to `/appointments`

#### Step 3: Manage Appointments
1. On **Appointments** page:
   - **Upcoming Tab:** Shows your appointment with Dr. Sharma
   - Card displays: Doctor name, date, time, status badge
   - **Cancel Appointment button** available
2. **Cancel Option:**
   - Click **"Cancel Appointment"** button
   - Confirmation dialog: "Are you sure?"
   - Status changes from "Scheduled" to "Cancelled"

---

### **SCENARIO 3: Manage Profile & Health History**

#### Step 1: View/Edit Profile
1. Click **"Profile"** in sidebar or go to `/profile`
2. **See:**
   - Profile card with your name and email
   - **Edit Profile** button
3. Click **"Edit Profile":**
   - Update any field (e.g., weight from 75 to 73 kg)
   - Change sleep quality from 5 to 7
   - Click **"Save Changes"**
   - ✅ Toast: "Profile updated successfully"
4. Click **"View Health History"** button

#### Step 2: View Health History
1. **URL:** `/profile/history`
2. **See:**
   - **Progress Summary Cards:**
     - Weight change: "2.0 kg ⬇️" (positive trend)
     - Sleep improvement: "+2.0 points ⬆️"
   - **Weight Over Time Chart:** Line chart showing weight progression
   - **Sleep Quality Chart:** Line chart showing sleep improvement
   - **Health Timeline:** 
     - Vertical timeline with colored dots
     - Latest entry (green), older entries (blue)
     - Each entry shows: date, weight, activity level, sleep, notes
     - Chronic conditions displayed as badges

---

### **SCENARIO 4: Settings & Account Management**

#### Step 1: Go to Settings
1. Click **"Settings"** in sidebar or go to `/settings`
2. **Three-column layout appears:**

#### Step 2: Preferences
1. Click **"Preferences"** in left menu
2. **See toggle switches:**
   - "Email health tips" - Toggle ON/OFF
   - "Appointment notifications" - Toggle ON/OFF
3. Change status and see immediate feedback

#### Step 3: Change Password
1. Click **"Password"** in left menu
2. **Fill form:**
   - Current Password: password123
   - New Password: NewPassword456
   - Confirm Password: NewPassword456
3. Click **"Change Password"**
4. ✅ Toast: "Password changed successfully"

#### Step 4: Delete Account
1. Click **"Account"** in left menu
2. **See red danger zone:**
   - Warning: "This action cannot be undone"
   - Click **"Delete My Account"**
3. **Confirmation dialog:**
   - Shows your email
   - Asks for confirmation
   - Click **"Delete Account"** to confirm
4. ✅ Toast: "Account deleted" and redirect to login

---

### **SCENARIO 5: Doctor Portal (Doctor View)**

#### Step 1: Doctor Login
1. Go to login page
2. Enter credentials:
   - **Email:** doctor@test.com
   - **Password:** password123
3. ✅ Redirected to **Doctor Dashboard** (`/doctor`)

#### Step 2: Review Dashboard
1. **See summary cards:**
   - Pending Review: 4 consultations
   - Urgent Cases: 1
   - Needs Doctor: 2
   - Reviewed Today: 1
2. **Stats by consultation status**

#### Step 3: Filter Consultations
1. **Use filter toolbar:**
   - Search by patient name: "Rajesh" → Shows matching consultations
   - Triage Level: Select "Urgent" → Shows only urgent cases
   - Status: Select "Pending" → Shows only pending reviews
   - Date Range: Select from Dec 1 to Dec 31
2. Results update in real-time

#### Step 4: Review Consultation
1. **Consultations list shows:**
   - Patient name and ID
   - Consultation date
   - Symptoms (fever, cough, fatigue)
   - Top predicted disease with confidence %
   - Triage level and status badges
2. Click **"Review"** button on any consultation
3. **Detail modal opens showing:**
   - Patient symptoms
   - AI predicted diseases with confidence bars
   - Mental condition: Stress (6/10), Sleep (5/10), Mood (Anxious)
   - Disease history
   - AI recommendations

#### Step 5: Add Doctor Feedback
1. **In detail modal, scroll down to:**
   - "Your Notes & Recommendations" textarea
   - Type: "Patient showing signs of common cold with anxiety. Recommend herbal steam therapy, ashwagandha supplement, and stress management techniques. Follow-up in 3 days."
2. **Select Follow-up:**
   - Dropdown: "Follow-up in 1 Week"
3. Click **"Save Feedback"**
4. ✅ Green checkmark: "Feedback saved successfully"
5. Status badge changes to "Reviewed"

#### Step 6: Export/Share
- Print consultation results
- Download for records
- Share with specialists (if needed)

---

### **SCENARIO 6: Admin Portal (Admin View)**

#### Step 1: Admin Login
1. Go to login page
2. Enter credentials:
   - **Email:** admin@test.com
   - **Password:** password123
3. ✅ Redirected to **Admin Dashboard** (`/admin`)

#### Step 2: Navigate Admin Pages
1. **Sidebar menu shows:**
   - Dashboard
   - Symptoms Management
   - Diseases Management
   - Treatments Management
   - Users Management
   - Consultations Management

#### Step 3: Manage Symptoms (Example)
1. Click **"Symptoms Management"** → `/admin/symptoms`
2. **See table/list:**
   - Add symptoms
   - Edit existing symptoms
   - Delete symptoms
   - Search and filter

#### Step 4: Manage Users
1. Click **"Users Management"** → `/admin/users`
2. **See:**
   - All registered users
   - User details (name, email, role)
   - Actions: Edit, Delete, Change role
   - Can promote patient to doctor

#### Step 5: View Consultations
1. Click **"Consultations Management"** → `/admin/consultations`
2. **See:**
   - All consultations (including private ones)
   - Filter by status, date, doctor
   - View consultation details
   - Generate reports

---

## 🎨 Feature Highlights to Test

### **1. Responsive Design**
- Open on desktop (full layout)
- Resize to tablet (stacked layout)
- Test on mobile (hamburger menu)

### **2. Form Validation**
- Try submitting empty fields → Error messages appear
- Try invalid email → Validation error
- Try passwords that don't match → Error
- Try past date for appointment → Disabled

### **3. Toast Notifications**
- Successfully save data → Green toast appears
- Error occurs → Red error toast
- Check corner positioning and auto-dismiss

### **4. Loading States**
- Watch loading spinner while fetching data
- Buttons disabled during submission
- "Saving..." text appears

### **5. Print Functionality**
1. Go to consultation results
2. Click "Print" button
3. Browser print dialog opens
4. Verify layout is clean and print-ready
5. Save as PDF to test

### **6. Data Persistence**
- Edit profile and refresh page → Changes persist
- Save notes and go back → Notes are saved
- Cancel appointment then rebook → Works correctly

### **7. Navigation**
- Test back buttons
- Test sidebar links
- Test breadcrumb navigation
- Try direct URL navigation

---

## 🧪 Quick Test Checklist

### Authentication
- [ ] Sign up with new email
- [ ] Login with credentials
- [ ] Logout
- [ ] Try accessing protected route without login (redirects to login)

### Patient Features
- [ ] Complete profile setup
- [ ] Start consultation
- [ ] View results
- [ ] Print results
- [ ] Share with doctor
- [ ] Add notes
- [ ] Chat with AI bot
- [ ] Book appointment
- [ ] View health history
- [ ] Change password
- [ ] Update preferences

### Doctor Features
- [ ] Login as doctor
- [ ] View consultations list
- [ ] Filter consultations
- [ ] Add feedback
- [ ] Set follow-up recommendation

### Admin Features
- [ ] Login as admin
- [ ] View all management pages
- [ ] Navigate dashboard

---

## 💾 Test Data Summary

**Consultation AI Results Include:**
- 2-3 predicted diseases with confidence scores
- Herbal recommendations (3 herbs with dosage)
- Foods to consume (6+ items)
- Foods to avoid (4+ items)
- Lifestyle recommendations (3+ items)
- Yoga practices (3+ suggestions)
- Triage level assignment (Normal/Doctor/Urgent)

**Available Doctors for Appointment:**
1. Dr. Sharma - Ayurvedic Physician (15 years, 4.8★)
2. Dr. Patel - Holistic Health (12 years, 4.7★)
3. Dr. Kumar - Digestive Health (10 years, 4.9★)
4. Dr. Singh - Mental Wellness (8 years, 4.6★)

**Available Doctors for Sharing:**
- Same list as above

---

## 🚀 Performance Notes

- **Load Time:** All pages should load within 2 seconds
- **Chatbot:** Responds within 500ms
- **Form Submission:** Completes within 1 second
- **Chart Rendering:** Charts load smoothly with animations

---

## 🐛 Common Test Scenarios

### Appointment Booking Edge Cases
- Try booking appointment with past date → Disabled
- Try booking same time slot with another doctor → Works (different doctor)
- Cancel appointment then try to rebook same slot → Slot available again

### Profile Updates
- Upload new weight → Chart updates
- Change sleep quality → History updates
- Add chronic condition → Reflects in next consultation

### Consultation Sharing
- Share same consultation with multiple doctors → Each gets notification (in mock)
- Share without optional message → Works fine
- Try to share without selecting doctor → Error message

---

## 📞 Support Contacts (For Testing)

If you encounter issues:
1. Check browser console (F12) for errors
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try incognito/private mode
4. Check all fields are filled correctly
5. Verify date/time selections are valid

---

## ✅ Final Notes

- **All features are frontend-only** - No backend required for testing
- **All data is mock/simulated** - Won't persist across page refreshes
- **API calls are placeholder** - Ready for backend integration
- **No authentication backend** - Any email works for signup
- **No payment processing** - Appointments are mock bookings

---

**Happy Testing! 🎉**

This is a fully functional demo/MVP frontend ready for:
- Design review
- User feedback
- Backend integration
- Deployment
