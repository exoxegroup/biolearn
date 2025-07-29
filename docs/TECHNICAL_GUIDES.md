# Technical Guides

This document contains technical setup and deployment guides for the BioLearn AI project.

## Cloudinary Setup Guide

1.  **Cloudinary Account:**
    *   Create a free Cloudinary account.
    *   Navigate to **Settings → Upload**.
    *   Add an **unsigned upload preset**. It is critical to set the `resource_type` to `raw` for handling files like PDF and DOCX.
    *   Note your **Cloud Name**, **API Key**, and **API Secret**.

2.  **Backend Environment Variables:**
    *   In your backend's `.env` file, add the following keys with the values from your Cloudinary account:
        ```
        CLOUDINARY_CLOUD_NAME=<your_cloud_name>
        CLOUDINARY_API_KEY=<your_api_key>
        CLOUDINARY_API_SECRET=<your_api_secret>
        CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@<your_cloud_name>
        ```

3.  **Backend Implementation:**
    *   The `materialController.ts` is configured to use these environment variables to connect to Cloudinary.
    *   It uses `multer` for handling in-memory file uploads and `streamifier` to pipe the file buffer directly to Cloudinary's upload stream. This is an efficient method that avoids saving temporary files on the server.

## Deployment Guide (Render.com)

This project is designed for easy deployment on Render's free tier.

1.  **Frontend Service:**
    *   Create a new **Web Service** on Render.
    *   Connect your Git repository.
    *   **Build Command:** `npm run build`
    *   **Start Command:** `npm start` (or `next start` if you were using Next.js's server).
    *   Add the necessary frontend environment variables (e.g., `GEMINI_API_KEY` if it were still used on the frontend).

2.  **Backend Service:**
    *   Create another new **Web Service** on Render.
    *   Connect the same Git repository, but specify the backend directory.
    *   **Build Command:** `npm install`
    *   **Start Command:** `node dist/index.js` (since the output directory in `tsconfig.json` is `dist`).
    *   Add all backend environment variables from your `.env` file, including `DATABASE_URL`, `JWT_SECRET`, and all `CLOUDINARY_*` variables.

3.  **Database Service:**
    *   Create a new **PostgreSQL** service on Render.
    *   Render will provide you with a `DATABASE_URL`. Use this URL for the `DATABASE_URL` environment variable in your backend service.
