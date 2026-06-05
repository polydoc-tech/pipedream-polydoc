# Scheduled URL screenshot

Capture a PNG of any web page on a schedule. Great for visual monitoring, social /
OG images, and change tracking.

## Steps

1. **Trigger: Schedule** - run every 24 hours (or your preferred cadence).
2. **Action: PolyDoc - Capture Screenshot**
   - Connect your PolyDoc account.
   - Source Type: `URL`
   - URL: `https://example.com`
   - Image Type: `png`
   - Full Page: `true`
   - Viewport Width: `1280`, Viewport Height: `800`
   - Filename: `snapshot.png`
   - Delivery Mode: `Download`
3. **Next step (your choice):** the PNG is written to `/tmp/snapshot.png` and the
   step returns `{ path, filename, sizeBytes, contentType }`. Pass `path` to a
   Slack, Google Drive, S3, or email step to deliver or archive it.

## Notes

- For large or high-traffic captures, switch Delivery Mode to `Cloud Storage`
  (presigned URL) so the file never passes through the step output.
- Prefer a base64 string instead of a file? Set Output Encoding to `Base64`; the
  step then returns the image under `data`.

Start free: https://polydoc.tech/?utm_source=pipedream&utm_medium=template&utm_campaign=screenshot
