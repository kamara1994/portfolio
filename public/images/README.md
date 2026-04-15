# 📁 /public/images/

## General Images Folder

Use this folder for any other images used across the site:

- Cert badge images (if you download them from Credly)
- Company logos
- Background textures
- Any other visual assets

### Cert badges:
If you download your badge PNGs from Credly, name them:
- `badge-securityplus.png`
- `badge-ccna.png`
- `badge-psaa.png`
- `badge-pentest.png`

Then reference them in `components/Certs.tsx` using:
```tsx
<Image src="/images/badge-securityplus.png" alt="Security+" width={60} height={60} />
```
