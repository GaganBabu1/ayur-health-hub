# Profile Pages - Frontend-Backend Integration Guide

## Overview
All profile-related pages have been successfully integrated with the real backend userService API.

## Updated Files

### 1. **src/pages/Profile/ProfilePage.tsx** ✅
**Changes Made:**
- Added import: `import userService from '@/services/userService'`
- Replaced mock fetch with real API call: `userService.getProfile()`
- Updated profile form to accept backend data
- Array fields (chronicConditions, allergies) now properly converted between backend arrays and form strings
- Real profile update with `userService.updateProfile()`

**Features:**
- Loads user profile on mount
- Displays all health metrics
- Edit mode with validation
- Saves changes to backend via PUT /user/profile
- Error handling with user-friendly messages

### 2. **src/pages/Profile/ProfileHistoryPage.tsx** ✅
**Changes Made:**
- Added import: `import userService from '@/services/userService'`
- Removed mock data (mockHealthHistory)
- Replaced fetch with real API call: `userService.getHealthHistory()`
- Updated HealthRecord interface to match backend format (_id instead of id)

**Features:**
- Loads health history timeline on mount
- Displays weight, activity level, sleep quality trends
- Shows chronic conditions for each entry
- Interactive timeline visualization
- Sorted by date (newest first)

### 3. **src/pages/Profile/ProfileSetupPage.jsx** ✅
**Changes Made:**
- Added import: `import userService from '@/services/userService'`
- Replaced mock submit with real API call: `userService.updateProfile()`
- Proper data transformation (string arrays for form input)

**Features:**
- Setup wizard for new users
- Full health profile configuration
- Validation on all fields
- Redirects to dashboard on success

## API Endpoints Used

### Profile Endpoints
| Method | Endpoint | Purpose | Service Function |
|--------|----------|---------|-------------------|
| GET | /api/user/profile | Fetch user profile | `userService.getProfile()` |
| PUT | /api/user/profile | Update user profile | `userService.updateProfile(data)` |
| GET | /api/user/health-history | Fetch health history | `userService.getHealthHistory()` |
| POST | /api/user/health-history | Add health entry | `userService.addHealthEntry(data)` |

## Data Flow

### Getting Profile
```typescript
const profileData = await userService.getProfile();
// Returns:
{
  _id: "user-id",
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  gender: "Male",
  height: 170,
  weight: 70,
  lifestyle: "Moderate",
  sleepQuality: 7,
  chronicConditions: ["Acid reflux"],
  allergies: ["Peanuts"],
  diseaseHistory: "Mild asthma in childhood"
}
```

### Updating Profile
```typescript
await userService.updateProfile({
  age: 30,
  gender: "Male",
  height: 170,
  weight: 70,
  lifestyle: "Moderate",
  sleepQuality: 7,
  chronicConditions: ["Acid reflux"],
  allergies: ["Peanuts"],
  diseaseHistory: "Mild asthma in childhood"
});
```

### Health History
```typescript
const history = await userService.getHealthHistory();
// Returns: Array of HealthHistoryEntry objects
[
  {
    _id: "entry-id",
    date: "2025-12-01T00:00:00Z",
    weight: 70,
    activityLevel: "moderate",
    sleepQuality: 7,
    notes: "Feeling great",
    chronicConditions: ["Acid reflux"]
  },
  ...
]
```

## Testing Instructions

### Prerequisites
✅ Backend server running on `http://localhost:5000`
✅ Frontend running on `http://localhost:8080`
✅ MongoDB connected and seeded with sample data

### Test Credentials
```
Patient User:
  Email: patient@ayur.com
  Password: Patient123

Doctor User:
  Email: doctor@ayur.com
  Password: Doctor123
```

### Test Scenario 1: View Profile
1. Login with patient credentials
2. Navigate to "My Profile" in dashboard sidebar
3. **Expected:** Profile loads with all user data from backend
4. **Verify:** All fields are populated correctly

### Test Scenario 2: Edit Profile
1. Click "Edit Profile" button on ProfilePage
2. Modify any field (e.g., age, weight)
3. Click "Save Changes"
4. **Expected:** 
   - Success toast appears
   - Changes are saved to backend
   - Profile refreshes with updated data
5. **Verify:** Reload page and confirm changes persisted

### Test Scenario 3: View Health History
1. From dashboard, click "Health History"
2. **Expected:** Timeline appears with health entries
3. **Verify:** 
   - Entries sorted chronologically (newest first)
   - Weight chart displays correctly
   - All metrics visible

### Test Scenario 4: Error Handling
1. Try to submit profile with empty required fields
2. **Expected:** Validation error toast appears
3. **Verify:** Form does not submit

2. Disconnect backend and try to save profile
3. **Expected:** Error message appears
4. **Verify:** Error is user-friendly

## Architecture

### userService.ts - Core Service Layer
```typescript
// Location: src/services/userService.ts
// 4 functions for user profile management

userService.getProfile()           // GET /user/profile
userService.updateProfile(data)    // PUT /user/profile
userService.getHealthHistory()     // GET /user/health-history
userService.addHealthEntry(data)   // POST /user/health-history
```

### API Client - HTTP Layer
```typescript
// Location: src/services/apiClient.ts
// Handles:
// - Automatic JWT token injection from localStorage
// - 401 redirect to /login on auth errors
// - Error parsing and clean messages
// - TypeScript generics for type safety
```

### Auth Context - State Management
```typescript
// Location: src/context/AuthContext.tsx
// Provides:
// - Current user from localStorage
// - Auth status
// - Login/signup/logout functions
// - Auto-loads user on app startup
```

## Response Status Codes

| Code | Meaning | Handled By |
|------|---------|-----------|
| 200 | Success | Success toast |
| 400 | Bad request | Error message |
| 401 | Unauthorized | Redirect to /login |
| 404 | Not found | Error message |
| 500 | Server error | Error message |

## Troubleshooting

### Issue: "Failed to load profile"
**Solution:**
1. Check backend is running on http://localhost:5000
2. Check MongoDB connection: `mongod --dbpath "C:\data\db"`
3. Check user is authenticated (token in localStorage)
4. Check browser console for detailed error

### Issue: Changes not saving
**Solution:**
1. Check backend server is running
2. Check network tab in DevTools for failed requests
3. Verify form validation passes (0 errors)
4. Check terminal for backend error messages

### Issue: Chronic Conditions/Allergies not displaying
**Solution:**
1. These are arrays in backend but strings in form
2. Conversion is automatic: `join(', ')` for display
3. Re-split: `split(',').map(x => x.trim())` on save
4. This is already implemented in current code

## Future Enhancements

1. **Real-time sync:** WebSocket for live updates
2. **File upload:** Profile picture/documents
3. **Export:** Download health history as PDF
4. **Integrations:** Apple Health, Fitbit sync
5. **Notifications:** Health metrics alerts
6. **Analytics:** Personal health dashboards

## Build & Deployment

### Development
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: MongoDB
mongod --dbpath "C:\data\db"
```

### Production
```bash
npm run build
# Outputs to dist/ folder
# Deploy with: serve dist/ or integrate with backend
```

## Summary

All profile pages are now **fully integrated** with the backend API:
- ✅ Real API calls replacing mock data
- ✅ Automatic JWT authentication
- ✅ Error handling with user feedback
- ✅ Form validation and submission
- ✅ Data transformation for arrays
- ✅ Type-safe TypeScript interfaces
- ✅ Clean, maintainable architecture

The system is ready for:
1. **User testing** - All core features working
2. **Additional features** - Consultation, appointments ready to connect
3. **Deployment** - Build is clean, no errors
