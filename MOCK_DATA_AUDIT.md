# Mock Data & Placeholder Features - Complete Audit

## Summary
The project uses real data for **core features** (auth, consultations, profiles) but has **mock/placeholder implementations** for secondary features. Below is the complete breakdown:

---

## 🟢 REAL DATA (Using Backend API)

### Core Features - Fully Implemented
1. **Authentication**
   - ✅ User signup with health data
   - ✅ User login
   - ✅ JWT token management
   - ✅ Role-based access

2. **User Profile**
   - ✅ View profile data (from backend)
   - ✅ Update profile (height, weight, lifestyle, sleep quality, medical history)
   - ✅ Real database persistence

3. **Consultations**
   - ✅ Create new consultation
   - ✅ Submit symptoms & health data
   - ✅ AI recommendations (via backend)
   - ✅ View consultation history
   - ✅ View consultation details
   - ✅ Real MongoDB storage

4. **Knowledge Base**
   - ✅ Fetch symptoms from real API (`/api/admin/symptoms`)
   - ✅ Fetch diseases from real API (`/api/admin/diseases`)
   - ✅ Real database data

5. **Doctor Dashboard**
   - ✅ Fetch consultations for doctor (via `doctorService.getConsultationsForDoctor()`)
   - ✅ Add doctor notes
   - ✅ Real backend API calls

---

## 🟡 MOCK DATA (Placeholder Implementations)

### 1. **Appointments Page** ❌ MOCK
**File:** `src/pages/Appointments/NewAppointmentPage.tsx`

**Mock Data:**
```typescript
// Mock doctors data
const mockDoctors: Doctor[] = [
  { id: '1', name: 'Dr. Sharma', specialization: 'Ayurvedic Physician', experience: 15, rating: 4.8 },
  { id: '2', name: 'Dr. Patel', specialization: 'Holistic Health', experience: 12, rating: 4.7 },
  { id: '3', name: 'Dr. Kumar', specialization: 'Digestive Health', experience: 10, rating: 4.9 },
  { id: '4', name: 'Dr. Singh', specialization: 'Mental Wellness', experience: 8, rating: 4.6 },
];

// Mock time slots
const mockTimeSlots: TimeSlot[] = [
  { id: '1', time: '09:00 AM', available: true },
  { id: '2', time: '09:30 AM', available: true },
  // ... more slots
];
```

**Status:**
- ❌ Does NOT fetch real doctors
- ❌ Does NOT fetch real time slots
- ❌ Simulates API call with `setTimeout()`
- ❌ Appointment booking not persisted

**Lines:**
- Mock doctors: Line 38-57
- Mock slots: Line 70-85
- Fetch logic (placeholder): Line 106-124

---

### 2. **Settings Page** ❌ MOCK
**File:** `src/pages/Settings/SettingsPage.tsx`

**Placeholder Functions:**
```typescript
// Line 134: Change Password
// Placeholder: Call settingsService.changePassword(passwordForm)
// Simulates API call with await new Promise(resolve => setTimeout(resolve, 1000));

// Line 178: Update Preferences
// Placeholder: Call settingsService.updatePreferences(newPreferences)
// Simulates API call with await new Promise(resolve => setTimeout(resolve, 500));

// Line 207: Delete Account
// Placeholder: Call settingsService.deleteAccount()
// Simulates API call with await new Promise(resolve => setTimeout(resolve, 1000));
```

**Status:**
- ❌ Password change not actually implemented
- ❌ Preferences not persisted
- ❌ Account deletion not implemented
- ⚠️ Shows success toasts but doesn't save anything

**Lines:**
- Change password: Line 130-155
- Update preferences: Line 170-195
- Delete account: Line 200-220

---

### 3. **Share Consultation with Doctor** ❌ MOCK
**File:** `src/pages/Consultation/ConsultationResultPage.tsx`

**Mock Data:**
```typescript
// Line 143: Mock doctors data
setDoctors([
  { id: '1', name: 'Dr. Sharma' },
  { id: '2', name: 'Dr. Patel' },
  { id: '3', name: 'Dr. Kumar' },
]);
```

**Status:**
- ❌ Doctors list is hardcoded
- ❌ Sharing functionality is placeholder
- ⚠️ Shows success message but doesn't actually share

**Lines:**
- Mock doctors fetch: Line 139-150
- Share handler (placeholder): Line 173-195

---

### 4. **Doctor Modal in Consultation Result** ❌ MOCK
**File:** `src/pages/Consultation/ConsultationResultPage.tsx`

**Status:**
- ❌ Doctor selection has placeholder logic
- ❌ Sending notes to doctor not implemented

**Lines:**
- Doctor sharing logic: Line 173-195

---

## 📊 Mock Data Locations Summary

| Feature | File | Lines | Type | Status |
|---------|------|-------|------|--------|
| Doctors List | `NewAppointmentPage.tsx` | 38-57 | Array | ❌ Mock |
| Time Slots | `NewAppointmentPage.tsx` | 70-85 | Array | ❌ Mock |
| Doctors List | `ConsultationResultPage.tsx` | 143-151 | Array | ❌ Mock |
| Password Change | `SettingsPage.tsx` | 130-155 | Logic | ❌ Placeholder |
| Preferences Update | `SettingsPage.tsx` | 170-195 | Logic | ❌ Placeholder |
| Account Deletion | `SettingsPage.tsx` | 200-220 | Logic | ❌ Placeholder |

---

## 🔧 How to Replace Mock Data

### 1. **Appointments - Doctors List**
**Current (Mock):**
```typescript
setDoctors(mockDoctors);
```

**Replace with:**
```typescript
// Create doctorService.ts
const doctors = await doctorService.getDoctors();
setDoctors(doctors);
```

### 2. **Appointments - Time Slots**
**Current (Mock):**
```typescript
setAvailableSlots(mockTimeSlots);
```

**Replace with:**
```typescript
const slots = await appointmentService.getAvailableSlots(doctorId, date);
setAvailableSlots(slots);
```

### 3. **Settings - Password Change**
**Current (Placeholder):**
```typescript
await new Promise(resolve => setTimeout(resolve, 1000));
```

**Replace with:**
```typescript
await settingsService.changePassword(passwordForm);
```

### 4. **Settings - Preferences**
**Current (Placeholder):**
```typescript
await new Promise(resolve => setTimeout(resolve, 500));
```

**Replace with:**
```typescript
await settingsService.updatePreferences(newPreferences);
```

### 5. **Settings - Delete Account**
**Current (Placeholder):**
```typescript
await new Promise(resolve => setTimeout(resolve, 1000));
```

**Replace with:**
```typescript
await settingsService.deleteAccount();
```

---

## 📋 Implementation Checklist

- [ ] Create `doctorService.ts` with `getDoctors()` method
- [ ] Create `appointmentService.ts` with `getAvailableSlots()` and `createAppointment()` methods
- [ ] Create `settingsService.ts` with `changePassword()`, `updatePreferences()`, `deleteAccount()` methods
- [ ] Backend endpoints for doctors list
- [ ] Backend endpoints for available appointment slots
- [ ] Backend endpoints for settings operations
- [ ] Database schema for appointments
- [ ] Replace all placeholder setTimeout() calls with actual API calls
- [ ] Add proper error handling for each service
- [ ] Test end-to-end workflows

---

## 🎯 Current Progress

**Working Features (Real Data):** ✅
- Authentication
- Profile Management  
- Consultations
- Knowledge Base
- Doctor Dashboard

**Placeholder Features (Mock Data):** ❌
- Appointment Booking
- Settings Management
- Doctor Sharing (partially)

**Estimated Completion:** 70% of core features done, 30% of secondary features need backend integration
