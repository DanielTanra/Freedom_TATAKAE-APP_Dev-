# Deployment Checklist for Video Module Fix

## ✅ Files Modified
- [x] `/supabase/functions/server/kv_store.tsx` - Fixed getByPrefix to not overwrite id
- [x] `/supabase/functions/server/index.tsx` - Fixed kv.list → kv.getByPrefix (4 locations)
- [x] `/components/VideoPlayer.tsx` - Added debug logging
- [x] `/components/VideoManager.tsx` - Added debug logging

## 📋 Pre-Deployment Checks

### 1. Verify Code Changes
```bash
# Check that kv.list is no longer used
grep -n "kv\.list" supabase/functions/server/index.tsx
# Should return: (no results)

# Check that getByPrefix is used correctly
grep -n "kv\.getByPrefix" supabase/functions/server/index.tsx
# Should return: 4 results (lines ~2377, 2468, 2493, 2534)
```

### 2. Check Supabase Authentication
```bash
# Verify you're logged in
supabase --version
supabase login

# List projects and verify you're connected to the right one
supabase projects list

# Link to your project if needed
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Test Build Locally (Optional)
```bash
# Install Deno if not already installed
curl -fsSL https://deno.land/x/install/install.sh | sh

# Test the function locally
cd supabase/functions/make-server
deno run --allow-net --allow-env index.tsx
```

## 🚀 Deployment Steps

### Option A: Deploy via CLI (Recommended)
```bash
# Deploy the edge function
supabase functions deploy make-server

# Expected output:
# ✓ Deployed Function make-server
# Function URL: https://YOUR_PROJECT.supabase.co/functions/v1/make-server
```

### Option B: Deploy via Dashboard (If CLI fails with 403)
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/functions
2. Click "Deploy a new function"
3. Function name: `make-server`
4. Copy contents from `/supabase/functions/server/index.tsx`
5. Click "Deploy"

## 📊 Post-Deployment Verification

### 1. Check Function Logs
```bash
# Watch logs in real-time
supabase functions logs make-server --tail

# Look for successful deployment and no errors
```

### 2. Test Video Loading
1. Open your FreeLearning application
2. Login as a **teacher** first
3. Open browser DevTools (F12) → Console tab
4. Navigate to "Urus Video" tab
5. Look for console messages:
   ```
   [VideoManager] Loading videos...
   [VideoManager] Response status: 200
   [VideoManager] Videos loaded: X
   ```

6. If no videos exist, upload one:
   - Title: "Test Video"
   - URL: `https://www.youtube.com/embed/dQw4w9WgXcQ`
   - Duration: "5:00"
   - Topic: "Test"
   - Category: "Tutorial"

7. **Logout** and login as a **student**
8. Navigate to "Video Pembelajaran" tab
9. Look for console messages:
   ```
   Loading videos...
   Video list response status: 200
   Videos loaded: 1
   ```

### 3. Verify Database
```sql
-- In Supabase SQL Editor
-- Check if videos exist
SELECT key, value->'title' as title 
FROM kv_store_d59960c4 
WHERE key LIKE 'video:%';
```

### 4. Test Video Features
- [ ] Videos display correctly
- [ ] Can select and play a video
- [ ] Progress saves when marking as watched
- [ ] Understanding rating prompts appear
- [ ] Progress persists after page refresh
- [ ] Related videos show in sidebar
- [ ] Download button works
- [ ] Category badges display correctly

## 🐛 Troubleshooting Failed Deployment

### Error: 403 Forbidden
```bash
# Re-authenticate
supabase logout
supabase login

# Verify project access
supabase projects list

# Re-link project
supabase link --project-ref YOUR_PROJECT_REF

# Try deployment again
supabase functions deploy make-server
```

### Error: kv_store_d59960c4 table not found
```sql
-- Create the table in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS kv_store_d59960c4 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

### Error: Videos still not loading
1. **Clear browser cache**
   - DevTools → Application → Clear storage
   - Or: Ctrl+Shift+Delete

2. **Check network requests**
   - DevTools → Network tab
   - Look for POST to `/make-server-d59960c4/videos/list`
   - Check response status and body

3. **Verify session token**
   ```javascript
   // In browser console
   const session = JSON.parse(localStorage.getItem('sb-YOUR_PROJECT_REF-auth-token'));
   console.log('Session exists:', !!session);
   console.log('Access token:', session?.access_token?.substring(0, 20) + '...');
   ```

## 📝 Success Criteria

✅ **Deployment is successful when:**
1. Edge function deploys without errors
2. Teacher can see video management interface
3. Teacher can upload videos
4. Student can see uploaded videos on login
5. Student can see videos after page refresh
6. Progress tracking works correctly
7. No console errors related to video loading

## 🎯 Next Steps After Successful Deployment

1. **Test with real users**
   - Create test teacher and student accounts
   - Upload multiple videos
   - Test on different browsers

2. **Monitor usage**
   ```bash
   # Check function invocations
   supabase functions logs make-server --limit 100
   ```

3. **Optimize performance** (if needed)
   - Add caching for video list
   - Implement pagination for large video libraries
   - Add loading states

4. **Document for users**
   - Create user guide for video upload
   - Add tooltips in the UI
   - Create video tutorial

## 🆘 Still Having Issues?

Refer to:
- `/VIDEO_MODULE_FIX.md` - Detailed explanation of changes
- `/VIDEO_TROUBLESHOOTING.md` - Comprehensive troubleshooting guide
- Supabase Discord: https://discord.supabase.com
- Supabase Docs: https://supabase.com/docs/guides/functions

## 📞 Support Checklist

When asking for help, provide:
1. [ ] Output of `supabase functions logs make-server --limit 50`
2. [ ] Browser console logs (screenshot)
3. [ ] Network tab showing failed requests
4. [ ] Result of database query for videos
5. [ ] Deployment command output
