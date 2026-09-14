#!/bin/bash
# Waits for the reference photo in /home/user/uploads, bakes the identity
# plate, then renders the master with the real face.
cd /home/user/LUMORA-OTT/film || exit 1

f=""
for i in $(seq 1 180); do
  f=$(ls /home/user/uploads/*.jpg /home/user/uploads/*.jpeg /home/user/uploads/*.png 2>/dev/null | head -1)
  [ -n "$f" ] && break
  sleep 10
done

if [ -z "$f" ]; then
  echo "WATCHER TIMEOUT: no upload appeared"
  exit 0
fi

echo "FOUND UPLOAD: $f"
mkdir -p assets
cp "$f" assets/source.jpg
node tools/prepare-plates.mjs || { echo "PLATE BAKE FAILED"; exit 1; }
echo "PLATE READY"

[ -x /tmp/chromium ] || { node extract.mjs && chmod +x /tmp/chromium; }

echo "STARTING RENDER"
./node_modules/.bin/remotion render PortfolioFilm out/film-face.mp4 \
  --browser-executable=./run-chromium.sh --concurrency=1 --log=info \
  || { echo "RENDER FAILED"; exit 1; }

cp out/film-face.mp4 out/film.mp4
cp out/film-face.mp4 "out/rajveer-ahir-many-systems-film.mp4"
echo "ALLDONE: face master rendered"
