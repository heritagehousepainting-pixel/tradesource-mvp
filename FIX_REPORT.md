# FIX_REPORT - Document Visibility Gap Fix

## Date: 2026-03-24

## PROBLEM STATEMENT

Admin cannot view uploaded documents (insurance, W9, license) submitted by contractors during application. This makes the "vetted network" claim invalid.

---

## PROBLEMS FIXED

### 1. Admin Has No Post-Approval Control ✅ FIXED (Prior Fix)
- **Before:** Admin could only approve or reject, no way to revoke or manage approved contractors
- **After:** Added full CRUD controls to admin panel with Approve, Reject, Revoke buttons per user status
- **Implementation:** Updated `app/admin/page.tsx` with action buttons that change based on user status

### 2. Approval State Not Propagating ✅ FIXED (Prior Fix)
- **Before:** Admin approves contractor → contractor still sees "Application Under Review"
- **After:** Admin action immediately updates user status in store and current user session
- **Implementation:** New functions in `lib/store.ts`: `approveContractor()`, `rejectContractor()`, `revokeContractor()`

### 3. No Approval Notification ✅ FIXED (Prior Fix)
- **Before:** No feedback after admin approval - user had to manually check
- **After:** Shows in-app notification when user logs in after being approved
- **Implementation:** New functions `checkApprovalNotification()` and `markApprovalNotificationSeen()` in store, integrated into login flow

### 4. No State Transition ✅ FIXED (Prior Fix)
- **Before:** User stuck in pending state forever
- **After:** Proper lifecycle: pending → approved → active, with polling on pending/rejected pages
- **Implementation:** Pages now poll every 5 seconds to check for status changes

### 5. Document Visibility Gap ✅ FIXED (NEW)
- **Before:** Admin cannot view uploaded documents (insurance, W9, license) submitted by contractors
- **After:** Admin can view document status, see uploaded documents, and download/view them before approval
- **Implementation:** New document management system in store + document viewing UI in admin panel

---

## IMPLEMENTATIONS COMPLETED

### 1. Document Storage System (`lib/store.ts`)

Added new interfaces and functions:

```typescript
// New document interface
export interface UserDocument {
  name: string
  data: string
  uploadedAt: string
}

export interface UserDocuments {
  insurance?: UserDocument
  w9?: UserDocument
  license?: UserDocument
}

// Extended User interface (added documents field)
export interface User {
  ...
  documents?: UserDocuments
}

// Document management functions
export function saveDocument(
  userId: string, 
  docType: 'insurance' | 'w9' | 'license', 
  fileData: string, 
  fileName: string
): void

export function getUserDocuments(userId: string): UserDocuments
```

Also maintains backward compatibility with legacy `w9Data` and `insuranceData` fields.

### 2. Contractor Application (`app/apply/page.tsx`)

Extended form to include:
- **W-9 Upload** (existing)
- **Insurance Upload** (existing)
- **Business License Upload** (NEW)

Updated submit handler to:
- Save documents using new `saveDocument()` function
- Store document metadata (name, data, uploadedAt) in structured format
- Also maintain legacy fields for backward compatibility

### 3. Admin Document View (`app/admin/page.tsx`)

New features added:
- **Document Status Display:** Shows status (Uploaded/Not submitted) for each document type
- **Document Viewer Modal:** Click to view or download uploaded documents
- **Warning Banner:** Shows warning when no documents are submitted before approval
- **All Users Tab:** Documents visible for all users (not just pending)

UI structure per contractor:
```
[Contractor Name]
...
Documents:
  - Insurance: Uploaded (view) / Not submitted
  - W-9: Uploaded (view) / Not submitted
  - License: Uploaded (view) / Not submitted

⚠️ No documents submitted - verify manually before approving
```

### 4. Approval Requires Review

Before showing "Approve" button:
- Display document status for each document type
- If no documents uploaded, show warning: "No documents submitted - verify manually before approving"

### 5. Profile Integration

After approval:
- Documents remain linked to contractor
- Admin can always view documents from All Users list

---

## FILES MODIFIED

1. **`lib/store.ts`**
   - Added `UserDocument` and `UserDocuments` interfaces
   - Extended `User` interface with `documents` field
   - Added `saveDocument()` and `getUserDocuments()` functions

2. **`app/apply/page.tsx`**
   - Added `licenseFile` to form state
   - Added license file upload input
   - Updated submit handler to save documents using new system

3. **`app/admin/page.tsx`**
   - Added document status checking functions
   - Added document viewer modal
   - Updated pending users card to show documents
   - Added warning banner for missing documents

---

## VALIDATION CHECKLIST

| Requirement | Status |
|-------------|--------|
| Contractor can upload document during application | ✅ Implemented |
| File is stored in localStorage | ✅ Implemented (base64) |
| Admin can see document status before approving | ✅ Implemented |
| Admin can view/download document | ✅ Implemented (modal) |
| Documents persist after approval | ✅ Implemented |

---

## TESTING NOTES

- All pages build successfully (`npm run build` passes)
- Static generation works for all 15 routes
- Admin code: `TSADMIN2024`
- Document viewer supports PDF and images
- Backward compatible with existing user data (w9Data/insuranceData fields)

---

## USAGE FLOW

### Contractor Application
1. Navigate to `/apply`
2. Fill out business information
3. Upload required documents (W-9, Insurance, License)
4. Submit application
5. Status: Pending (waiting for admin review)

### Admin Review
1. Navigate to `/admin` and enter code `TSADMIN2024`
2. Go to "Vetting" tab to see pending applications
3. Review contractor details AND uploaded documents
4. If documents missing → warning shown, verify manually
5. If documents present → click to view in modal
6. Click Approve or Reject

### After Approval
1. Contractor logs in
2. Sees approval notification: "🎉 Congratulations! You're approved!"
3. Can access all jobs with documents still linked to profile
4. Admin can view documents anytime from All Users tab