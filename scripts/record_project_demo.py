#!/usr/bin/env python3
"""Record an authentic 8-second browser demo. Review before publishing."""
import argparse, json, re, subprocess, tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

p = argparse.ArgumentParser()
p.add_argument("project")
p.add_argument("url", help="Public demo or locally running project URL")
p.add_argument("--selector", help="Optional safe navigation target to click")
p.add_argument("--seconds", type=int, default=8, choices=range(5,11))
args = p.parse_args()
root = Path(__file__).resolve().parents[1]
if not re.fullmatch(r"[a-z0-9-]+", args.project):
    p.error("Invalid project ID")
if not re.search(r"id:\s*['\"]" + re.escape(args.project) + r"['\"]", (root/"data/projects.ts").read_text()):
    p.error("Unknown portfolio project ID")
out = root/"public/demos"/(args.project+".mp4")
out.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory() as tmp, sync_playwright() as pw:
    browser = pw.chromium.launch()
    context = browser.new_context(viewport={"width":1280,"height":720}, record_video_dir=tmp, record_video_size={"width":1280,"height":720})
    page = context.new_page()
    page.goto(args.url, wait_until="domcontentloaded", timeout=45000)
    page.wait_for_timeout(3000)
    page.evaluate("window.scrollTo(0,0)")
    if args.selector:
        page.locator(args.selector).first.click(timeout=5000)
    else:
        page.mouse.wheel(0, 420)
    page.wait_for_timeout(args.seconds*1000+1000)
    video = page.video
    context.close()
    browser.close()
    subprocess.run(["ffmpeg","-y","-sseof",str(-args.seconds),"-i",str(video.path()),"-t",str(args.seconds),"-an","-c:v","libx264","-pix_fmt","yuv420p","-crf","23","-movflags","+faststart",str(out)],check=True)
print(f"Recorded {out}. Review for sensitive data and accurate content before adding it to data/project-previews.json.")
