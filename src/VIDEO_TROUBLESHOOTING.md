# Video Module Troubleshooting Guide

## Quick Diagnosis

### Check 1: Browser Console
Open browser DevTools (F12) and look for:
```
Loading videos...
Video list response status: 200
Videos loaded: X
```

**If you see:**
- ❌ `Videos loaded: 0` → No videos in database (teacher needs to upload)
- ❌ `Video list response status: 401` → Authentication issue
- ❌ `Video list response status: 500` → Backend error (check edge function logs)
- ✅ `Videos loaded: 3` → Working correctly!

### Check 2: Edge Function Logs
```bash
supabase functions logs make-server --tail
```

**Look for:**
- ✅ `Found X videos` → Videos are being retrieved
- ❌ `List videos error:` → Check the error message
- ❌ `kv.list is not a function` → Code wasn't deployed correctly

## Common Issues & Solutions

### Issue 1: Videos Not Showing
**Symptoms:**
- Empty video page
- "Tiada Video Tersedia" message
- Console shows `Videos loaded: 0`

**Solutions:**
1. **No videos uploaded yet**
   - Login as teacher
   - Go to "Urus Video" tab
   - Upload at least one video

2. **Videos in database but not loading**
   - Check edge function is deployed: `supabase functions list`
   - Redeploy: `supabase functions deploy make-server`
   - Check logs: `supabase functions logs make-server`

3. **Authentication issues**
   - Refresh the page
   - Logout and login again
   - Check session is valid in console: `console.log(session)`

### Issue 2: 403 Deployment Error
**Symptoms:**
```
Error: Failed to deploy function
Status: 403 Forbidden
```

**Solutions:**
1. **Re-authenticate with Supabase**
   ```bash
   supabase logout
   supabase login
   ```

2. **Verify project linking**
   ```bash
   supabase projects list
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Check organization permissions**
   - Go to Supabase Dashboard
   - Settings → Team Settings
   - Verify you have deployment permissions

4. **Try alternative deployment**
   - Use Supabase Dashboard: Functions → Deploy New Function
   - Upload `index.tsx` manually

### Issue 3: Videos Show Then Disappear on Refresh
**Symptoms:**
- Videos visible initially
- Disappear after page refresh
- Console shows authentication errors

**Solutions:**
1. **Session persistence issue**
   - Check browser localStorage
   - Clear browser cache and cookies
   - Re-login

2. **CORS or fetch issue**
   - Check Network tab in DevTools
   - Look for failed requests to `/make-server-d59960c4/videos/list`
   - Verify edge function is accessible

### Issue 4: Progress Not Saving
**Symptoms:**
- Watch percentage doesn't persist
- Understanding rating not saved
- Progress resets on refresh

**Solutions:**
1. **Check save-progress endpoint**
   - Open Network tab
   - Watch video to completion
   - Look for POST to `/make-server-d59960c4/videos/save-progress`
   - Check response status (should be 200)

2. **Verify user ID**
   ```javascript
   // In browser console
   console.log(session.user.id);
   ```

3. **Check backend logs**
   ```bash
   supabase functions logs make-server --tail
   ```

## Database Verification

### Check Video Data
```sql
-- In Supabase SQL Editor
SELECT key, value 
FROM kv_store_d59960c4 
WHERE key LIKE 'video:%';
```

**Expected output:**
```
key              | value
video:1234567890 | {"id":"1234567890","title":"Intro to HCI",...}
```

### Check Progress Data
```sql
SELECT key, value 
FROM kv_store_d59960c4 
WHERE key LIKE 'video-progress:%';
```

**Expected output:**
```
key                                    | value
video-progress:user-id:video-id       | {"studentId":"...","videoId":"...","watchPercentage":100,...}
```

## Edge Function Health Check

### Manual Test
```bash
# Get your access token from browser DevTools
# Application → Local Storage → supabase.auth.token

curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-d59960c4/videos/list \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected response:**
```json
{
  "videos": [
    {
      "id": "1234567890",
      "title": "Video Title",
      ...
    }
  ]
}
```

## Developer Mode Debugging

### Enable Verbose Logging
Add to VideoPlayer.tsx:
```typescript
useEffect(() => {
  console.log('Session:', session);
  console.log('Access Token:', session?.access_token?.substring(0, 20) + '...');
  loadVideos();
  loadWatchProgress();
}, []);
```

### Check API Calls
```typescript
// Add to loadVideos function
const response = await fetch('/make-server-d59960c4/videos/list', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  },
  body: JSON.stringify({})
});

console.log('Response:', {
  status: response.status,
  statusText: response.statusText,
  ok: response.ok
});

const data = await response.json();
console.log('Data:', data);
```

## Still Having Issues?

1. **Check this documentation:**
   - `/VIDEO_MODULE_FIX.md` - Details of the fix
   - `/DEPLOYMENT_INSTRUCTIONS.md` - Deployment guide

2. **Verify all fixes were applied:**
   - Open `/supabase/functions/server/index.tsx`
   - Search for `kv.list` - should find 0 results
   - Search for `kv.getByPrefix` - should find 4 results

3. **Create a minimal test:**
   ```typescript
   // In browser console when logged in
   fetch('/make-server-d59960c4/videos/list', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${session.access_token}`
     },
     body: JSON.stringify({})
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error);
   ```

4. **Contact support with:**
   - Browser console logs
   - Edge function logs
   - Network tab screenshots
   - Database query results
