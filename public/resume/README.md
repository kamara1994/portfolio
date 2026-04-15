# 📁 /public/resume/

## Add Your Resume PDF Here

Drop your resume PDF in this folder and name it:

```
Joseph_Allan_Kamara_Resume.pdf
```

The "Download Resume" button in the Hero section will automatically link to it.

### To update the filename:
Open `components/Hero.tsx` and find:
```tsx
href="/resume/Joseph_Allan_Kamara_Resume.pdf"
```
Change it to match your filename.

### Tips:
- Keep one master PDF here and update it whenever you tailor your resume
- For job-specific versions, you can name them like:
  - `Joseph_Allan_Kamara_SitusAMC.pdf`
  - `Joseph_Allan_Kamara_Hexcel.pdf`
  - Then update the Hero link before each deployment
