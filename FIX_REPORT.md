# FIX_REPORT.md - URGENCY ENGINE Implementation

## Summary
Implemented the URGENCY ENGINE for TradeSource to transform the platform from a passive job board to an active urgency-driven matching system.

---

## 1. CONTRACTOR AVAILABILITY STATUS ✅

### Changes to `lib/store.ts`:
- Added `AvailabilityStatus` type: `'available_now' | 'available_today' | 'available_this_week' | 'unavailable'`
- Extended `User` interface with:
  - `availabilityStatus?: AvailabilityStatus`
  - `lastActiveAt?: string`

### New Functions:
- `setAvailability(userId: string, status: AvailabilityStatus): void` - Saves availability and updates lastActiveAt
- `getAvailableContractors(): User[]` - Returns contractors with availability set (not 'unavailable')
- `getContractorsByAvailability(status: AvailabilityStatus): User[]` - Returns contractors with specific status

### UI Updates (`app/profile/page.tsx`):
- Added availability selector section in contractor profile
- Four options with visual indicators (green/yellow/blue/gray dots)
- Status labels:
  - **Available Now** - "Ready to start immediately"
  - **Available Today** - "Can start within today"
  - **Available This Week** - "Can start within the week"
  - **Unavailable** - "Not looking for work"
- Clicking a status option updates the user's availability via `setAvailability()`

---

## 2. URGENT JOB MODE ✅

### Changes to `lib/store.ts`:
- Extended `Job` interface with:
  - `isUrgent?: boolean` (optional for backward compatibility)
  - `urgentResponseDeadline?: number` (timestamp in milliseconds)

### Changes to `app/post-job/page.tsx`:
- Added `isUrgent` field to form state
- Added "URGENT — Need help ASAP" toggle in the job form
- When enabled:
  - Shows expected response time: "Responses expected within 15 minutes"
  - Sets `urgentResponseDeadline` to `now + 15 minutes` (15 * 60 * 1000 ms)
- Toggle styled with red accent when active
- Calls `notifyContractorsOfNewJob(job)` after saving to notify contractors

---

## 3. RESPONSE TIMER ✅

### Changes to `app/jobs/[id]/page.tsx`:
- Added `formatTimeRemaining()` helper function
- Added `timeRemaining` state for countdown display
- Added `useEffect` that runs interval every 1 second for urgent jobs
- Displays countdown in "M:SS" format (minutes:seconds)

### UI Display:
- When `job.isUrgent` is true, shows red banner:
  ```
  ┌─────────────────────────────────────┐
  │ ⚠️ URGENT                           │
  │ Responses expected within  12:45   │
  └─────────────────────────────────────┘
  ```
- Timer updates every second
- Shows "Expired" when deadline passes

---

## 4. NOTIFICATION SYSTEM (MVP) ✅

### Changes to `lib/store.ts`:
- Extended `Notification` interface with:
  - Added `urgent_job` and `selected` types
  - Added `userId?: string` field
- Added new functions:
  - `createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): void`
  - `getNotificationsForUser(userId: string): Notification[]`
  - `notifyContractorsOfNewJob(job: Job): void` - Notifies all available contractors
  - `notifyContractorSelected(contractorId: string, job: Job): void` - Notifies selected contractor

### Notification Triggers:
- **New job posted** → Notifies all contractors with availability set
- **Urgent job posted** → Uses `urgent_job` type, prioritized notification
- Notification includes job title, location, and price

### UI Updates (`app/jobs/page.tsx`):
- Added notification bell icon in header
- Shows unread count badge (red circle with number, max "9+")
- Added import for `getUnreadNotificationCount`

---

## 5. PRIORITY MATCHING ✅

### Changes to `lib/store.ts`:
- Updated `getOpenJobs()` to sort:
  1. Urgent jobs first (`isUrgent: true` sorted to top)
  2. Then by creation date (newest first)

### Changes to `app/jobs/page.tsx`:
- Added URGENT badge display on job cards:
  - Red "URGENT" pill badge with icon
  - Left border highlight (red)
- Added availability indicator:
  - Shows "Available now" badge if any interested contractor has `availabilityStatus === 'available_now'`
  - Uses green color scheme to indicate immediate availability
- Priority logic:
  - Jobs with `isUrgent: true` appear at top of feed
  - Jobs with available_now contractors show special badge

---

## 6. NON-APPROVED EXPERIENCE ✅

### Maintained Functionality:
- **Price blurring**: Non-approved users see blurred prices (`$_,___`)
- **Upgrade path banner**: Shows "Your application is pending approval" or "Your application was not approved" with link to update
- **Access maintained**: Non-approved users can view jobs, but prices remain blurred

### Implementation in `app/jobs/page.tsx`:
```tsx
const formatPrice = (price: number, userStatus: string) => {
  if (userStatus !== 'approved') {
    return (
      <span className="blur-sm select-none text-gray-400">
        $_,___
      </span>
    )
  }
  return new Intl.NumberFormat('en-US', { ... }).format(price)
}
```

---

## FILES MODIFIED

1. **`lib/store.ts`**
   - Added AvailabilityStatus type
   - Extended User interface with availabilityStatus, lastActiveAt
   - Extended Job interface with isUrgent, urgentResponseDeadline
   - Extended Notification interface with userId, new types
   - Added setAvailability, getAvailableContractors, getContractorsByAvailability
   - Added createNotification, getNotificationsForUser, notifyContractorsOfNewJob
   - Updated getOpenJobs for urgent-first sorting

2. **`app/jobs/page.tsx`**
   - Added notification import and state
   - Added urgent badge display
   - Added availability badge for contractors
   - Added notification bell in header

3. **`app/post-job/page.tsx`**
   - Added isUrgent to form state
   - Added urgent toggle UI
   - Added notifyContractorsOfNewJob call on submit
   - Sets 15-minute deadline for urgent jobs

4. **`app/profile/page.tsx`**
   - Added availability selector with 4 status options
   - Visual feedback when status is selected

5. **`app/jobs/[id]/page.tsx`**
   - Added formatTimeRemaining helper
   - Added timeRemaining state
   - Added useEffect timer for urgent jobs
   - Added urgent banner with countdown display

6. **`app/layout.tsx`** 
   - (No changes needed - seed data handles backward compatibility via optional fields)

---

## VALIDATION RESULTS

1. ✅ **Contractor sets availability** → Check store: availabilityStatus saved to User in localStorage
2. ✅ **User posts urgent job** → Job has isUrgent=true, urgentResponseDeadline set to now + 15 min
3. ✅ **Timer displays** → Countdown shows on job detail page, updates every second
4. ✅ **Notifications appear** → Bell icon shows unread count, notifications stored in localStorage
5. ✅ **Jobs feed prioritizes** → Urgent jobs sorted to top, availability badges shown on contractor cards

---

## BACKWARD COMPATIBILITY

- `isUrgent` and `urgentResponseDeadline` are optional in Job interface
- Old jobs without these fields default to non-urgent behavior
- Price blurring maintained for non-approved users
- All existing seed data works without migration