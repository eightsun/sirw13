# 🔧 Quick Fix: Profile Edit Error

## 🎯 Problem

**Error:** "Error: Data profil tidak ditemukan. Silakan hubungi admin."

**When:** User login → Redirect ke profile edit → Error shows

**Root Cause:** Profile edit page tidak auto-create warga entry kalau missing.

---

## ✅ Solution (2 Files)

### **File 1: app/dashboard/profile/edit/page.tsx** (PRIORITY!)

**Download:** `profile-edit-page-fixed.tsx`

**Rename to:** `page.tsx`

**Replace:** `app/dashboard/profile/edit/page.tsx`

**What it fixes:**
- Auto-creates warga entry if missing (same as dashboard)
- Shows form instead of error
- Redundant protection (dashboard + profile both auto-create)

---

### **File 2: components/forms/WargaForm.tsx** (BONUS FIX)

**Download:** `WargaForm-clean.tsx`

**Rename to:** `WargaForm.tsx`

**Replace:** `components/forms/WargaForm.tsx`

**What it fixes:**
- Redirect to `/dashboard` after profile update (not `/dashboard/warga`)
- Correct redirect based on `isProfileMode`

---

## 🚀 Installation (5 Minutes)

### **Step 1: Replace Profile Edit Page**

1. Download `profile-edit-page-fixed.tsx`
2. Go to GitHub → `app/dashboard/profile/edit/page.tsx`
3. Delete old file
4. Upload new file (rename to `page.tsx`)

---

### **Step 2: Replace WargaForm**

1. Download `WargaForm-clean.tsx`
2. Go to GitHub → `components/forms/WargaForm.tsx`
3. Delete old file
4. Upload new file (rename to `WargaForm.tsx`)

---

### **Step 3: Commit & Deploy**

```bash
git add .
git commit -m "fix: Auto-create warga in profile edit page"
git push
```

Wait ~2 minutes for deploy.

---

### **Step 4: Test**

1. ✅ Open incognito window
2. ✅ Login with `ichsanyp@gmail.com`
3. ✅ **Should redirect** to Profile Edit page
4. ✅ **Form shows** (no error!) ✅
5. ✅ **Pre-filled** with placeholder data
6. ✅ **Fill required fields:**
   - NIK: Real 16 digits
   - No KK: Real 16 digits
   - Alamat: Real address (not "N/A")
   - No HP: Phone number
   - Other fields as needed
7. ✅ Click "Update Data"
8. ✅ **Redirects to Dashboard** ✅
9. ✅ **Dashboard shows** with your name
10. ✅ Check Data Warga → **You appear in list** ✅

---

## 🔍 Why This Happened

**Flow before fix:**

```
Login
    ↓
Dashboard checks warga → Not found
    ↓
Dashboard auto-creates entry
    ↓
Redirect to /dashboard/profile/edit
    ↓
Profile edit checks warga → getUserWarga() returns null
    ↓
❌ ERROR: "Data profil tidak ditemukan"
```

**Issue:** Timing/race condition. Dashboard created entry but profile edit page couldn't find it.

---

**Flow after fix:**

```
Login
    ↓
Dashboard checks warga → Not found
    ↓
Dashboard auto-creates entry
    ↓
Redirect to /dashboard/profile/edit
    ↓
Profile edit checks warga → Not found (timing issue)
    ↓
Profile edit ALSO auto-creates (redundant protection)
    ↓
✅ Form shows with data
    ↓
User fills & submits
    ↓
✅ Redirects to Dashboard
```

**Double protection:** Both dashboard AND profile edit can create entry if missing!

---

## 💡 Technical Details

### **Profile Edit Auto-Create Logic:**

```typescript
// Check if user has warga entry
const { data: warga } = await supabase
  .from('persons')
  .select('*')
  .eq('email', user.email)
  .is('deleted_at', null)
  .maybeSingle();

// If no entry, create one
if (!warga) {
  const { data: newWarga } = await supabase
    .from('persons')
    .insert({
      email: user.email,
      nama: user.user_metadata?.nama || user.email?.split('@')[0],
      nik: '0000000000000000',
      // ... other placeholder values
    })
    .select()
    .single();
  
  // Use newly created data to show form
  // ... render form with newWarga
}
```

---

### **WargaForm Redirect Fix:**

```typescript
// OLD - Always redirect to /dashboard/warga
window.location.href = '/dashboard/warga';

// NEW - Redirect based on mode
const redirectUrl = isProfileMode ? '/dashboard' : '/dashboard/warga';
window.location.href = redirectUrl;
```

---

## ✅ Success Criteria

After fix:

1. ✅ Login doesn't show error
2. ✅ Profile edit page shows form (not error)
3. ✅ Form pre-filled with placeholder data
4. ✅ Can complete profile
5. ✅ Redirects to dashboard after submit
6. ✅ User appears in Data Warga
7. ✅ Next login goes directly to dashboard (profile complete)

---

## 🚨 Important Note

**If you already installed `dashboard-auto-create-warga.tsx`:**
- You MUST also install this fix
- Dashboard alone is not enough
- Profile edit page needs the same logic

**If you haven't installed dashboard yet:**
- Install ALL THREE files:
  1. `dashboard-auto-create-warga.tsx` → `app/dashboard/page.tsx`
  2. `profile-edit-page-fixed.tsx` → `app/dashboard/profile/edit/page.tsx`
  3. `WargaForm-clean.tsx` → `components/forms/WargaForm.tsx`

---

## 📋 Complete File List

**Files to install (3 total):**

1. ✅ `app/dashboard/page.tsx` 
   - Use: `dashboard-auto-create-warga.tsx`
   
2. ✅ `app/dashboard/profile/edit/page.tsx`
   - Use: `profile-edit-page-fixed.tsx`
   
3. ✅ `components/forms/WargaForm.tsx`
   - Use: `WargaForm-clean.tsx`

**Other files (already installed):**
- `lib/profile-helpers.ts` ✅
- `app/actions/profile.ts` ✅
- `app/auth/register/actions.ts` ✅

---

## 🎊 Summary

**What this fixes:**
- ❌ Error "Data profil tidak ditemukan"
- ❌ Can't access profile edit page
- ❌ Wrong redirect after profile update

**After fix:**
- ✅ Profile edit page works
- ✅ Auto-creates entry if missing
- ✅ Form shows properly
- ✅ Correct redirect to dashboard
- ✅ Complete onboarding flow works

**Time:** ~5 minutes
**Files:** 2 to replace
**Impact:** Fixes critical error!

---

**Install these 2 files NOW to fix profile edit error!** 🚀
