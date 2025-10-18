# ZombiePic Starter (Next.js + Replicate)

## Quick start

1. Clone this repo
2. `npm install`
3. Add environment variable `REPLICATE_API_TOKEN` (see https://replicate.com/account)
4. `npm run dev`

## Deploy

- Push to GitHub and connect to Vercel. Add REPLICATE_API_TOKEN in Vercel Environment Variables.
- Use a small GPU-backed Replicate plan for better speed, or rely on Replicate’s hosted inference.

## Notes
- This starter calls Replicate's Predictions API. Replace the `version` in `pages/api/zombify.js` with the model version ID you prefer (text-to-image or image-to-image).
- For production, implement rate-limiting, queueing, and temporary file cleanup. Consider storing generated images in S3 and deleting after 24 hours.
