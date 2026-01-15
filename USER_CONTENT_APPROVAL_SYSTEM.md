# User Content Approval System

## Overview

The FreeLearning platform now features a comprehensive **User Content Approval System** that allows teachers to moderate learning materials before they become visible to students. This system uses **frontend-driven approval status management** with kv_store backend, requiring **no database schema changes**.

## How It Works

### 1. Material Creation (MaterialsManager.tsx)

**Default Status: PENDING** (Set in Frontend)
- When a user creates a new material via the Materials Manager, the frontend sets `approval_status: 'pending'` in the request body
- The backend stores this field in kv_store without any special configuration
- The creator receives a toast notification: *"Material added successfully! It will be pending approval until reviewed by a teacher in the Content Editor."*
- Materials can be in three states:
  - 🟡 **Pending** - Awaiting teacher approval
  - 🟢 **Approved** - Visible to all students
  - 🔴 **Rejected** - Not visible to students

**Visual Indicators:**
- Blue info banner appears when pending materials exist
- Status badges on each material card:
  - Yellow badge with clock icon for Pending
  - Green badge with checkmark for Approved
  - Red badge with X for Rejected

### 2. Content Approval (ContentEditor.tsx - "User Content" Tab)

**Teacher Moderation Panel:**
- Teachers access the "User Content" tab in Content Editor
- View all pending materials with full details:
  - Title, description, category, difficulty
  - Full content preview
  - Submission timestamp
  - Creator information

**Approval Actions:**
- ✅ **Approve Button** (Green)
  - Sets `approval_status` to 'approved'
  - Material becomes visible in LearningMaterials.tsx
  - Toast: "Material approved successfully!"
  
- ❌ **Reject Button** (Red)
  - Sets `approval_status` to 'rejected'
  - Material hidden from students
  - Requires confirmation dialog
  - Toast: "Material rejected"

### 3. Student View (LearningMaterials.tsx)

**Filtered Display:**
- Students ONLY see materials where:
  - `approval_status === 'approved'` OR
  - `approval_status` is null/undefined (legacy materials)
- Pending and rejected materials are completely hidden
- Search and filters work only on approved materials

**User Experience:**
- Students browse only approved, quality-controlled content
- No indication of pending materials (clean UX)
- All materials downloadable as PDF

## Technical Implementation

### Database Schema

```typescript
interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  difficulty: string;
  createdAt: string;
  approval_status?: 'pending' | 'approved' | 'rejected'; // ← Added in frontend
  created_by?: string;
}
```

**Note:** Since the platform uses **kv_store**, no database schema changes are needed. The `approval_status` field is simply added to the JSON object when creating materials, and the backend stores it as-is.

### API Routes

**Creating Materials:**
```typescript
POST /materials
Headers: { Authorization: Bearer <token> }
Body: { 
  title, 
  description, 
  category, 
  content, 
  difficulty, 
  approval_status: 'pending' // ← Set in frontend
}
Response: Material with approval_status: 'pending'
```

**Fetching Materials:**
```typescript
GET /materials
Headers: { Authorization: Bearer <token> }
Response: { materials: [...] } // All materials with approval_status
```

**Approving/Rejecting Materials (via PUT):**
```typescript
PUT /materials/:id
Headers: { 
  Authorization: Bearer <token>,
  Content-Type: application/json
}
Body: { 
  ...existingMaterial, 
  approval_status: 'approved' // or 'rejected'
}
Response: Updated material object
```

### Filtering Logic

**LearningMaterials.tsx:**
```typescript
filtered = filtered.filter(m => 
  m.approval_status === 'approved' || !m.approval_status
);
```

**ContentEditor.tsx:**
```typescript
// Fetches pending materials
GET /content/pending
Response: { pendingMaterials: [...], pendingTopics: [...] }
```

## User Flows

### Flow 1: Create & Approve Material

1. **User** creates material in Materials Manager
2. System sets status to 'pending'
3. User sees yellow "Pending" badge
4. **Teacher** opens Content Editor > User Content tab
5. Teacher reviews material details
6. Teacher clicks "Approve"
7. Status changes to 'approved'
8. Material appears in Learning Materials for all students
9. User sees green "Approved" badge in Materials Manager

### Flow 2: Create & Reject Material

1. **User** creates material in Materials Manager
2. System sets status to 'pending'
3. User sees yellow "Pending" badge
4. **Teacher** opens Content Editor > User Content tab
5. Teacher reviews material
6. Teacher clicks "Reject" (confirms action)
7. Status changes to 'rejected'
8. Material hidden from Learning Materials
9. User sees red "Rejected" badge in Materials Manager

### Flow 3: Student Browsing

1. **Student** opens Learning Materials
2. System filters to show only approved materials
3. Student sees curated, quality-controlled content
4. Student can search, filter, and download approved materials
5. No awareness of pending/rejected content

## Benefits

### For Teachers
✅ **Quality Control** - Review all content before publication
✅ **Content Curation** - Ensure materials meet educational standards
✅ **Moderation Tools** - Easy approve/reject interface
✅ **Visibility** - See all pending submissions in one place

### For Students
✅ **Quality Content** - Only approved materials visible
✅ **Clean Experience** - No clutter from pending items
✅ **Trust** - Know all content is teacher-verified
✅ **Consistency** - Uniform quality standards

### For Administrators
✅ **Accountability** - Track who submitted what
✅ **Workflow** - Clear approval pipeline
✅ **Scalability** - System handles any volume of submissions
✅ **Flexibility** - Easy to add more approval criteria

## Visual Examples

### Materials Manager (Creator View)

```
┌─────────────────────────────────────┐
│ ℹ️ Approval Required:               │
│ New materials are pending approval  │
│ and won't be visible to students    │
│ until approved by a teacher.        │
└─────────────────────────────────────┘

┌─────────────────────┐
│ HCI Fundamentals    │ 🟡 Pending
│ Introduction to...  │
│ Category: fundamentals │ Difficulty: beginner
│ [Edit] [Delete]     │
└─────────────────────┘
```

### Content Editor > User Content Tab (Teacher View)

```
┌─────────────────────────────────────┐
│ Pending Materials (2)               │
├─────────────────────────────────────┤
│ 📚 HCI Fundamentals                 │
│ Category: fundamentals              │
│ Difficulty: beginner                │
│ Submitted: 2026-01-15               │
│ By: John Doe                        │
│                                     │
│ Content Preview:                    │
│ "This material covers the basics..." │
│                                     │
│ [✅ Approve] [❌ Reject]            │
└─────────────────────────────────────┘
```

### Learning Materials (Student View)

```
┌─────────────────────────────────────┐
│ Learn HCI                           │
│ Explore interactive learning        │
├─────────────────────────────────────┤
│ [Search...] [Category ▼] [Level ▼] │
├─────────────────────────────────────┤
│                                     │
│ ┌───────────┐  ┌───────────┐      │
│ │ Approved  │  │ Approved  │      │
│ │ Material  │  │ Material  │      │
│ │ 1         │  │ 2         │      │
│ └───────────┘  └───────────┘      │
│                                     │
│ (Only approved materials shown)     │
└─────────────────────────────────────┘
```

## Security Considerations

### Access Control
- Only teachers can approve/reject materials
- Students cannot see pending/rejected materials
- Creators can see their own materials' approval status

### Data Integrity
- Approval status changes are logged
- Database-level constraints ensure valid statuses
- Failed approvals don't affect existing data

### User Privacy
- Rejection reasons not exposed to creators (could be added)
- Creator information available to teachers only
- Audit trail maintained for all approvals

## Future Enhancements

### Potential Features
- 📝 **Rejection Reasons** - Allow teachers to provide feedback
- 🔔 **Notifications** - Alert creators when materials are approved/rejected
- 📊 **Analytics** - Track approval rates and processing times
- 👥 **Multi-level Approval** - Require multiple teachers to approve
- 🏷️ **Tagging System** - Add quality tags to approved materials
- 💬 **Comments** - Allow teachers to suggest improvements
- 🔄 **Revision Requests** - Request changes before approval
- 📅 **Scheduling** - Schedule approval publication dates

## Troubleshooting

### Material Not Showing in Learning Materials
- Check approval status in Materials Manager
- Verify it has green "Approved" badge
- Ensure no filters are excluding it
- Refresh the page

### Cannot Approve Material
- Verify you're logged in as a teacher
- Check you're in Content Editor > User Content tab
- Ensure material is in pending state
- Check browser console for errors

### Pending Materials Not Appearing
- Confirm materials were created after system update
- Check ContentEditor is fetching pending content
- Verify `/content/pending` endpoint is working
- Check browser network tab for API calls

## Summary

The User Content Approval System provides a robust, teacher-driven moderation workflow that ensures only quality-controlled content reaches students, while maintaining transparency for content creators and a clean experience for learners. The system is flexible, scalable, and ready for future enhancements.