# Project video workflow

Record actual running projects, not mock functionality. Use demo accounts and synthetic data only; never include credentials, private customer data, visitor IPs or coursework that cannot be shared.

Install Python Playwright and Chromium, plus FFmpeg on PATH:
```sh
python -m pip install playwright
python -m playwright install chromium
python scripts/record_project_demo.py pandie-foundation https://pandiefoundation.org
```

For local projects, start the actual application and pass its localhost URL instead. Optional `--selector` clicks a safe read-only navigation target. Default clip duration is 8 seconds; `--seconds 5` through `--seconds 10` is supported.

Review each recorded MP4, then add the corresponding mapping to data/project-previews.json, for example `"pandie-foundation": "/demos/pandie-foundation.mp4"`. Commit the MP4 and manifest together. The site will show the video on the home page and project detail page; existing screenshots remain as fallback.

Suggested captures:
- blue-soc-p8: lab alert dashboard and investigation view (synthetic data)
- fortress-v2: actual lab CloudWatch metric/alarm evidence, no account details
- blue-x: actual classifier output, using lab data
- pweza-voice-agent: portfolio assistant responding to a sample question
- elitecom: homepage and services
- pandie-foundation: homepage and programs
- enterprise-networking: actual lab topology and verified connectivity

Private sources remain private. Publish only separately approved, sanitized excerpts or public demo repositories. No clip has been recorded by this change.
