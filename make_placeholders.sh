#!/usr/bin/env bash
# make_placeholders.sh
# Drops a grey placeholder PNG into every image slot that is still a PDF-page
# export (1275x1650). Run from your repo root while you work through retakes.
# Safe to run multiple times — skips slots that already have non-PDF images.

set -euo pipefail

command -v python3 >/dev/null || { echo "python3 required"; exit 1; }
python3 -c "from PIL import Image, ImageDraw, ImageFont" 2>/dev/null || {
  echo "Pillow required: pip install Pillow"
  exit 1
}

IMG_BASE="assets/img/posts"

declare -A IMAGES
IMAGES[committed]="page-3.png page-7.png"
IMAGES[jerseyctf]="page-03.png page-11.png"
IMAGES[hawat]="page-09.png page-19.png"
IMAGES[love-at-first-breach]="page-3.png page-4.png"
IMAGES[brunnerctf]="page-01.png page-02.png"
IMAGES[offsec-fundamental-labs]="page-05.png page-08.png page-14.png page-17.png"
IMAGES[hackerholidays]="page-20.png page-27.png page-33.png page-40.png"
IMAGES[tcm-noob-village]="page-15.png page-16.png page-21.png page-23.png page-25.png page-28.png"
IMAGES[gaslightctf]="01-dashboard.png 02-decrypt-script.png 03-columnar-table.png 04-boxentriq.png 05-spectrogram.png 06-icon-exiftool.png 07-cyberchef-decode.png 08-flag-combine.png 09-biscuit-curl.png 10-biscuit-flag.png"
IMAGES[scriptctf]="01-misdirection-bacon.png 02-ascii-decode.png 03-bruteforced-flag.png 04-john-cena-zsteg.png 05-john-cena-compare.png 06-john-cena-solved.png 07-arnold-cat-map.png 08-inverse-matrix.png 09-ron-harrypotter.png 10-ron-stegseek.png"

placed=0
skipped=0

for folder in "${!IMAGES[@]}"; do
  for img in ${IMAGES[$folder]}; do
    path="$IMG_BASE/$folder/$img"
    mkdir -p "$IMG_BASE/$folder"

    # Check if it's still a PDF-page export (1275x1650)
    if [[ -f "$path" ]]; then
      size=$(python3 -c "from PIL import Image; img=Image.open('$path'); print(f'{img.size[0]}x{img.size[1]}')" 2>/dev/null || echo "error")
      if [[ "$size" != "1275x1650" ]]; then
        echo "  SKIP (already replaced): $folder/$img  [$size]"
        ((skipped++))
        continue
      fi
    fi

    # Write a placeholder
    python3 - "$path" "$folder/$img" << 'PYEOF'
import sys
from PIL import Image, ImageDraw

out_path = sys.argv[1]
label    = sys.argv[2]

w, h = 1200, 675  # 16:9 landscape
img = Image.new("RGB", (w, h), color=(30, 30, 30))
draw = ImageDraw.Draw(img)

# Border
draw.rectangle([4, 4, w-5, h-5], outline=(80, 80, 80), width=2)

# Text
text_main = "[ screenshot pending ]"
text_sub  = label
draw.text((w//2, h//2 - 20), text_main, fill=(160, 160, 160), anchor="mm")
draw.text((w//2, h//2 + 20), text_sub,  fill=(100, 100, 100), anchor="mm")

img.save(out_path, "PNG")
PYEOF

    echo "  PLACEHOLDER: $folder/$img"
    ((placed++))
  done
done

echo ""
echo "Done. $placed placeholders written, $skipped already replaced."
