# Upload Feature Implementation Guide

## Current Status
✅ Folders created: `backend/uploads/{hotels,rooms,profiles}`  
❌ Multer NOT installed  
❌ Upload endpoint NOT built  
❌ Static file serving NOT configured  

---

## Step 1: Install Dependencies

```bash
cd backend
npm install multer
npm install -D @types/multer
```

---

## Step 2: Create Upload Utility (src/utils/upload.ts)

```typescript
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = ['uploads/hotels', 'uploads/rooms', 'uploads/profiles'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get folder from query params: ?folder=hotels
    const folder = (req.query.folder as string) || 'general';
    const uploadPath = path.join(__dirname, `../../uploads/${folder}`);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random.ext
    const unique = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Only allow images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});
```

---

## Step 3: Create Upload Controller (src/modules/upload/upload.controller.ts)

```typescript
import { env } from "@/config/env";

/**
 * Handle file upload
 * Expected query param: ?folder=hotels|rooms|profiles
 * Expected body: multipart/form-data with "file" field
 * Returns: { url: "http://localhost:3000/uploads/hotels/..." }
 */
export async function uploadFile(req: any, res: any) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
        error: { code: "NO_FILE" },
        data: null,
      });
    }

    const folder = (req.query.folder as string) || 'general';
    const url = `http://localhost:${env.PORT}/uploads/${folder}/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url,
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
      error: { code: "UPLOAD_ERROR" },
      data: null,
    });
  }
}
```

---

## Step 4: Create Upload Routes (src/modules/upload/upload.routes.ts)

```typescript
import { Router } from "express";
import { uploadFile } from "./upload.controller";
import { upload } from "@/utils/upload";

const router = Router();

/**
 * POST /api/upload?folder=hotels
 * POST /api/upload?folder=rooms
 * POST /api/upload?folder=profiles
 * 
 * Expected form-data:
 *   file: <binary image>
 * 
 * Returns:
 * {
 *   "success": true,
 *   "data": {
 *     "url": "http://localhost:3000/uploads/hotels/12345-abc123.jpg",
 *     "filename": "12345-abc123.jpg",
 *     "size": 245000
 *   }
 * }
 */
router.post("/", upload.single("file"), uploadFile);

export default router;
```

---

## Step 5: Update app.ts

Add static file serving and upload routes:

```typescript
import path from 'path';
import uploadRouter from "@/modules/upload/upload.routes";

// ... existing middleware ...

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount upload routes
app.use('/api/upload', uploadRouter);

// ... rest of routes ...
```

---

## Step 6: Update .gitignore

Add to `backend/.gitignore`:
```
uploads/
```

---

## Testing

### Test with cURL

```bash
# Upload hotel image
curl -X POST http://localhost:3000/api/upload?folder=hotels \
  -F "file=@/path/to/image.jpg"

# Response:
{
  "success": true,
  "data": {
    "url": "http://localhost:3000/uploads/hotels/1678123456-abc123.jpg",
    "filename": "1678123456-abc123.jpg",
    "size": 245000
  }
}
```

### Test with Frontend

```tsx
const uploadImage = async (file: File, folder: string) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`http://localhost:3000/api/upload?folder=${folder}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (data.success) {
    return data.data.url; // Use this URL in hotel/room creation
  } else {
    throw new Error(data.message);
  }
};

// Usage in form
const [imageUrl, setImageUrl] = useState('');

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    try {
      const url = await uploadImage(file, 'hotels');
      setImageUrl(url);
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  }
};

return (
  <>
    <Input type="file" accept="image/*" onChange={handleImageUpload} />
    {imageUrl && <img src={imageUrl} alt="preview" />}
  </>
);
```

---

## File Structure After Setup

```
backend/
├── src/
│   ├── modules/
│   │   └── upload/
│   │       ├── upload.controller.ts
│   │       └── upload.routes.ts
│   ├── utils/
│   │   └── upload.ts
│   ├── app.ts (updated)
│   └── routes.ts
├── uploads/
│   ├── hotels/
│   ├── rooms/
│   └── profiles/
├── .gitignore (updated)
└── package.json (multer added)
```

---

## Notes

- Files are stored on disk, not in database
- URLs are stored in database (as designed)
- Max file size: 5MB (configurable in upload.ts)
- Only image files allowed (configurable via fileFilter)
- Files persist on server restart
- For production: Consider Cloudinary or S3 instead
- Multer can be swapped out later without breaking anything

