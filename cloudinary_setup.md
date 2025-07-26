1. Cloudinary Setup
- Create a free Cloudinary account (I used exoxegroupinc@gmail.com).
- Under Settings → Upload, add an unsigned upload preset (set resource_type to raw).
- Note your cloud name, API key, and API secret.

2. Configure Environment Variables on Render
In Render’s dashboard, for both your services (frontend & backend), add:
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
CLOUDINARY_UPLOAD_PRESET=<your_unsigned_preset>

3. Prisma Schema for File Metadata
Edit schema.prisma to store uploads:
model Document {
  id         Int      @id @default(autoincrement())
  filename   String
  url        String
  uploadedAt DateTime @default(now())
}

Then run:
npx prisma migrate dev --name add_documents

4. Backend: Express + Node.js Upload Route
Install dependencies:
npm install express multer streamifier cloudinary @prisma/client

In index.ts use this example:
import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

const app = express();
const upload = multer();
const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const stream = cloudinary.uploader.upload_stream({
      resource_type: 'raw',
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      folder: 'docs',
    }, async (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      // Save metadata to PostgreSQL via Prisma
      const doc = await prisma.document.create({
        data: {
          filename: req.file.originalname,
          url:      result.secure_url,
        },
      });

      res.json({ id: doc.id, url: doc.url });
    });

    streamifier.createReadStream(req.file.buffer).pipe(stream);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Backend listening on ${port}`));

5. In the frontend plug in the upload using our own design template (Here is an example):
// components/DocumentUploader.js
import { useState } from 'react';

export default function DocumentUploader() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage('Select a file first.');

    const form = new FormData();
    form.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form,
    });

    const data = await res.json();
    if (res.ok) setMessage(`Uploaded! URL: ${data.url}`);
    else setMessage(`Error: ${data.error}`);
  };

  return (
    <form onSubmit={upload}>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button type="submit">Upload Document</button>
      {message && <p>{message}</p>}
    </form>
  );
}

6. Test the Integration
- Upload a test PDF/DOCX file using your frontend.
- Verify the file appears in your Cloudinary Media Library.
- Check that the file URL is correctly stored in your database.



