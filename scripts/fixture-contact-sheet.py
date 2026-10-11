"""Contact-sheet layout of immutable device captures; never enhance evidence."""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

parser = argparse.ArgumentParser()
parser.add_argument("run_dir", type=Path)
parser.add_argument("output", type=Path)
args = parser.parse_args()
report = json.loads((args.run_dir / "report.json").read_text())
titles = [("clear", "Clear"), ("partly-cloudy", "Partly cloudy"), ("overcast", "Overcast"), ("fog", "Fog"), ("light-rain", "Light rain"), ("squall-approaching", "Squall approaching"), ("thunderstorm", "Thunderstorm"), ("clearing", "Clearing"), ("night-clear", "Night clear"), ("night-storm", "Night storm")]
assert {s["id"] for s in report["gallery"]} == {s[0] for s in titles}
font_root = Path("/usr/share/fonts/truetype/dejavu")
font = lambda size, bold=False: ImageFont.truetype(str(font_root / ("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf")), size)
width, height, pad, gap, header, caption, footer = 390, 700, 28, 16, 150, 40, 78
sheet = Image.new("RGB", (pad * 2 + width * 5 + gap * 4, header + (height + caption + gap) * 2 + footer), "#e9eeed")
draw = ImageDraw.Draw(sheet)
draw.text((pad, 22), "DayBuoy · ten weather fixtures", font=font(32, True), fill="#183339")
draw.text((pad, 68), "PASSED IPHONE BASELINE · BEFORE THE NIGHT-STORM FIX", font=font(21, True), fill="#6b4332")
cadence = report["cadence"]
draw.text((pad, 105), f"11 Oct 2026 · {cadence['fps']:.1f} fps avg · min {cadence['minOneSecondFPS']} · 0 seconds below 30 · synthetic fixtures", font=font(20), fill="#52666a")
for i, (key, title) in enumerate(titles):
    x, y = pad + i % 5 * (width + gap), header + i // 5 * (height + caption + gap)
    draw.text((x, y + 7), title, font=font(22, True), fill="#183339")
    with Image.open(args.run_dir / f"{key}.png") as original:
        im = original.convert("RGB")
        im.thumbnail((width, height), Image.Resampling.LANCZOS)
    draw.rectangle((x, y + caption, x + width - 1, y + caption + height - 1), fill="#071019")
    sheet.paste(im, (x + (width - im.width) // 2, y + caption + (height - im.height) // 2))
draw.text((pad, sheet.height - 64), "Actual phone screenshots. Layout + proportional resizing only; no brightness or colour edits.", font=font(18), fill="#52666a")
draw.text((pad, sheet.height - 35), f"Run: {report['runId']}  ·  Not evidence of the new storm revision.", font=font(16), fill="#52666a")
sheet.save(args.output)
print(json.dumps({"output": str(args.output), "size": sheet.size, "captures": len(titles), "prior_revision": report.get("build", {}).get("revision")}))
