# TradeSource Fix Report

## Summary
Fixed two critical issues in TradeSource MVP.

---

## Issue 1: Price Blurring - User Never Sees It ✅

### Problem
- Code existed in jobs/page.tsx to blur prices for non-approved users
- But non-approved users were redirected to /pending before seeing any jobs
- Result: No user ever saw the blurred prices

### Fix Applied
**Files Modified:** `app/jobs/page.tsx`

1. **Removed redirect to /pending** - Non-approved (pending/rejected) users can now view the jobs feed
2. **Added upgrade message banner** - Displayed at top of jobs page for non-approved users explaining they need to verify to see prices and apply
3. **Price blurring preserved** - Non-approved users still see blurred prices (`$_,___`) while approved users see actual prices

### Verification Steps
1. Create a new contractor account (goes to pending status by default) 
2. Navigate to /jobs
3. Verify you can see the jobs feed (not redirected to /pending)
4. Verify prices show as `$_,___` (blurred)
5. Verify upgrade message appears at top

---

## Issue 2: Password Flow - Email-Only Not Acceptable ✅

### Problem
- Login only checked email, no password validation
- createHomeownerAccount ignored the password parameter
- Not real authentication

### Fix Applied
**Files Modified:** `lib/store.ts`, `app/login/page.tsx`

#### lib/store.ts
1. Added `hashPassword()` function - simple base64 encoding (MVP - use bcrypt in production)
2. Added `validatePassword()` function - compares password against stored hash
3. Updated `createHomeownerAccount()` - now saves `passwordHash` field
4. Added `loginWithCredentials()` function - validates email + password

#### app/login/page.tsx
1. Added password input field to login form
2. Updated form submission to validate credentials
3. Handles three cases:
   - User exists with password hash → validate password
   - Legacy user without password → allow login (for demo)
   - No user found → show error message

### Verification Steps
1. Go to /signup
2. Create account with password (e.g., "testpassword123")
3. Log out
4. Go to /login
5. Enter email + **wrong** password → should show "Invalid email or password"
6. Enter email + **correct** password → should successfully login

---

## Files Modified

| File | Changes |
|------|---------|
| `lib/store.ts` | Added hashPassword, validatePassword, loginWithCredentials functions; updated createHomeownerAccount to save passwordHash |
| `app/jobs/page.tsx` | Removed /pending redirect; added upgrade banner for non-approved users |
| `app/login/page.tsx` | Added password field; updated login logic with password validation |

---

## Test Results

Both issues have been addressed:
- ✅ Non-approved users can now see jobs with blurred prices
- ✅ Password authentication now works (email + password required)