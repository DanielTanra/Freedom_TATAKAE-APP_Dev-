# Video Playback Implementation Guide

## How Video Playback Works

The video player intelligently detects the video type and uses the appropriate playback method:

### 1. **Uploaded Video Files** (Supabase Storage)
- **Detection**: URL contains `supabase.co/storage`
- **Player**: HTML5 `<video>` element
- **Features**: 
  - Native browser controls
  - Download prevention via `controlsList="nodownload"`
  - Supports multiple formats: mp4, webm, ogg
  - Full screen support
  - Play/pause tracking

**Example:**
```typescript
<video className="w-full h-full" controls controlsList="nodownload">
  <source src="https://xxx.supabase.co/storage/v1/object/public/video-resources/videos/123.mp4" type="video/mp4" />
</video>
```

### 2. **YouTube Videos**
- **Detection**: URL contains `youtube.com` or `youtu.be`
- **Player**: iframe with embed URL
- **Conversion**: Watch URL → Embed URL
  - From: `https://www.youtube.com/watch?v=VIDEO_ID`
  - To: `https://www.youtube.com/embed/VIDEO_ID`

**Example:**
```typescript
<iframe 
  src="https://www.youtube.com/embed/VIDEO_ID"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

### 3. **Other External URLs** (Vimeo, etc.)
- **Detection**: Not Supabase Storage and not YouTube
- **Player**: iframe with original URL
- **Note**: URL must be embeddable

## Helper Functions

### `isStorageUrl(url: string): boolean`
Checks if URL is from Supabase Storage.
```typescript
const isStorageUrl = (url: string): boolean => {
  return url.includes('supabase.co/storage');
};
```

### `isYouTubeUrl(url: string): boolean`
Checks if URL is from YouTube.
```typescript
const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};
```

### `getYouTubeEmbedUrl(url: string): string`
Converts YouTube watch URL to embed URL.
```typescript
const getYouTubeEmbedUrl = (url: string): string => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[7].length === 11) ? match[7] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};
```

## Troubleshooting

### Video Won't Play

#### **Uploaded Videos (Supabase Storage)**

1. **Check Storage Bucket**
   - Bucket name must be `video-resources`
   - Bucket must be PUBLIC
   - File must exist in bucket

2. **Verify URL Format**
   ```
   https://[PROJECT_ID].supabase.co/storage/v1/object/public/video-resources/videos/[filename]
   ```

3. **Check File Format**
   - Supported: mp4, webm, ogg
   - Recommended: mp4 (H.264 codec)
   - Browser compatibility varies

4. **Test Direct Access**
   - Copy video URL
   - Paste in new browser tab
   - Should download or play directly

5. **Check CORS Settings**
   - Supabase Storage should allow CORS by default
   - If issues persist, check bucket CORS configuration

#### **YouTube Videos**

1. **Verify URL Conversion**
   - Open browser console
   - Check if URL is being converted to embed format
   - Look for: `https://www.youtube.com/embed/VIDEO_ID`

2. **Check Video Availability**
   - Video must not be private
   - Video must allow embedding
   - Some videos have regional restrictions

3. **Test Embed URL Directly**
   ```
   https://www.youtube.com/embed/dQw4w9WgXcQ
   ```

4. **Common YouTube URL Formats**
   - Watch: `https://www.youtube.com/watch?v=VIDEO_ID`
   - Short: `https://youtu.be/VIDEO_ID`
   - Embed: `https://www.youtube.com/embed/VIDEO_ID` ✅

### Thumbnails Not Displaying

#### **Uploaded Thumbnails**

1. **Check Upload Success**
   - Look for console log: `[VideoManager] Thumbnail uploaded successfully`
   - Verify public URL is generated

2. **Check Bucket Path**
   ```
   thumbnails/{timestamp}-thumb-{random}.{ext}
   ```

3. **Verify URL in Database**
   - Thumbnail URL should be stored in video metadata
   - URL should be accessible (public bucket)

#### **YouTube Thumbnails**

1. **Auto-Generated URL Format**
   ```
   https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
   ```

2. **Fallback Thumbnails**
   - If `maxresdefault.jpg` fails, try:
   - `https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg`
   - `https://img.youtube.com/vi/VIDEO_ID/mqdefault.jpg`

### Download Not Working

#### **Uploaded Videos**

1. **Check Storage URL**
   - Must be valid Supabase Storage URL
   - Bucket must be public
   - File must exist

2. **Test Download Mechanism**
   ```typescript
   const link = document.createElement('a');
   link.href = video.url;
   link.download = `${video.title}.mp4`;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   ```

3. **Browser Restrictions**
   - Some browsers block automatic downloads
   - User may need to allow pop-ups/downloads
   - Large files may timeout

#### **YouTube Videos**

- YouTube videos cannot be downloaded directly
- Download button opens video in new tab
- This is expected behavior

## Browser Compatibility

### HTML5 Video Support

| Browser | MP4 (H.264) | WebM | Ogg |
|---------|-------------|------|-----|
| Chrome  | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Safari  | ✅ | ❌ | ❌ |
| Edge    | ✅ | ✅ | ✅ |

**Recommendation**: Upload videos in MP4 format (H.264 codec) for best compatibility.

### iframe Support

All modern browsers support iframe for YouTube embedding.

## Performance Optimization

### Video File Size

1. **Recommended Maximum**: 500MB per file
2. **Optimal Size**: 50-200MB
3. **Compression**: Use H.264 codec with medium quality

### Thumbnail Size

1. **Recommended Size**: 1280x720 (720p)
2. **Maximum Size**: 2MB
3. **Format**: JPEG for photos, PNG for graphics

### Loading Optimization

1. **Lazy Loading**: Videos only load when selected
2. **Progressive Download**: HTML5 video allows streaming
3. **Thumbnail Caching**: Browser caches thumbnail images

## Testing Checklist

### Upload Testing

- [ ] Upload MP4 video with custom thumbnail
- [ ] Upload WebM video with custom thumbnail  
- [ ] Upload video without thumbnail (verify fallback)
- [ ] Add YouTube URL (verify auto-thumbnail)
- [ ] Check console for upload success messages
- [ ] Verify files appear in Supabase Storage bucket

### Playback Testing

- [ ] Play uploaded MP4 video
- [ ] Play uploaded WebM video
- [ ] Play YouTube video
- [ ] Test play/pause controls
- [ ] Test fullscreen mode
- [ ] Test volume controls
- [ ] Verify video completes without errors

### Download Testing

- [ ] Download uploaded MP4 video
- [ ] Download uploaded WebM video
- [ ] "Download" YouTube video (opens new tab)
- [ ] Verify download count increments
- [ ] Check toast notifications

### Cross-Browser Testing

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile browsers

## Common Error Messages

### "Pelayar anda tidak menyokong pemain video"
- **Cause**: Browser doesn't support HTML5 video
- **Solution**: Update browser or try different browser
- **Note**: Very rare with modern browsers

### Video plays but no sound
- **Cause**: Browser autoplay policy
- **Solution**: User must interact with page first
- **Note**: This is browser security feature

### CORS Error in Console
- **Cause**: Supabase Storage CORS misconfiguration
- **Solution**: Check bucket CORS settings in Supabase Dashboard

### 404 Error for Video URL
- **Cause**: Video file doesn't exist in storage
- **Solution**: Re-upload video or check file path

## Security Considerations

### Content Security Policy (CSP)

If you have CSP headers, ensure they allow:
```
frame-src https://www.youtube.com https://player.vimeo.com;
media-src https://*.supabase.co;
img-src https://*.supabase.co https://img.youtube.com;
```

### Storage Bucket Policies

The `video-resources` bucket should:
- ✅ Allow public READ access
- ❌ Restrict WRITE access to authenticated users only
- ✅ Use RLS policies to control uploads

Example RLS Policy:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'video-resources');

-- Allow public to read
CREATE POLICY "Public can read videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'video-resources');
```

---

## Quick Reference

### Supported Video Sources

| Type | Example URL | Player | Download |
|------|-------------|--------|----------|
| Supabase Storage | `https://xxx.supabase.co/storage/...` | HTML5 Video | ✅ Yes |
| YouTube | `https://youtube.com/watch?v=...` | iframe Embed | ❌ Opens in Tab |
| Vimeo | `https://vimeo.com/...` | iframe Embed | ❌ Opens in Tab |

### File Format Support

| Format | Extension | MIME Type | Browser Support |
|--------|-----------|-----------|-----------------|
| MP4 | .mp4 | video/mp4 | ✅ Excellent |
| WebM | .webm | video/webm | ✅ Good |
| Ogg | .ogg | video/ogg | ⚠️ Limited |

---

**For issues not covered here, check browser console for detailed error messages.**
