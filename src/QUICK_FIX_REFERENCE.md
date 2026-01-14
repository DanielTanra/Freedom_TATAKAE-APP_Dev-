# Quick Fix Reference Card

## What Was Wrong?
```diff
- const videoKeys = await kv.list("video:");  ❌ Function doesn't exist
+ const videos = await kv.getByPrefix("video:");  ✅ Correct function
```

## Deploy Command
```bash
supabase functions deploy make-server
```

## Test Command (Browser Console)
```javascript
// Quick test after login
fetch('/make-server-d59960c4/videos/list', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  },
  body: JSON.stringify({})
})
.then(r => r.json())
.then(console.log);

// Expected: { videos: [...] }
```

## Expected Console Output
```
[VideoManager] Loading videos...
[VideoManager] Response status: 200
[VideoManager] Videos loaded: X
```

Or for students:
```
Loading videos...
Video list response status: 200
Videos loaded: X
```

## 403 Error? Quick Fix
```bash
supabase logout
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy make-server
```

## Verification SQL
```sql
-- Check if videos exist in database
SELECT key, value->'title' as title 
FROM kv_store_d59960c4 
WHERE key LIKE 'video:%';
```

## Files Changed
✅ `/supabase/functions/server/index.tsx` (4 fixes)  
✅ `/supabase/functions/server/kv_store.tsx` (1 fix)  
✅ `/components/VideoPlayer.tsx` (logging)  
✅ `/components/VideoManager.tsx` (logging)

## Success Checklist
- [ ] No `kv.list` in server code
- [ ] 4 instances of `kv.getByPrefix("video:")` exist
- [ ] Function deploys without errors
- [ ] Console shows "Videos loaded: X"
- [ ] Videos visible in UI
- [ ] Videos persist on refresh

## Full Documentation
- `/VIDEO_FIX_SUMMARY.md` - Overview
- `/VIDEO_MODULE_FIX.md` - Technical details
- `/DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `/VIDEO_TROUBLESHOOTING.md` - Debugging guide
