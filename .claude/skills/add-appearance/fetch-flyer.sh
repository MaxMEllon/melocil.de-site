#!/usr/bin/env bash
# 告知フライヤーを public/flyers/<name>.webp として取り込む。
#
#   fetch-flyer.sh <media-id>                 X の CDN から落として変換する
#   fetch-flyer.sh <name> <path/to/image>     手元の画像から変換する
#
# 既存の 80 枚に合わせて「長辺 640px の lossy webp」に揃える。
set -euo pipefail

name=${1:?usage: fetch-flyer.sh <media-id|name> [source-image]}
source=${2:-}

repo=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
out="$repo/public/flyers/$name.webp"

# lib/appearances.ts の FLYER_PATTERN と同じ（ディレクトリを跨がせない）
if [[ ! $name =~ ^[A-Za-z0-9_-]+$ ]]; then
  echo "flyer 名に使えない文字が入っています: $name" >&2
  exit 1
fi

if [[ -e $out ]]; then
  echo "既にあります: public/flyers/$name.webp" >&2
  echo "$name.webp"
  exit 0
fi

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

if [[ -z $source ]]; then
  source="$tmp/src"
  # name=large は最大 2048px。orig は消えている画像があるので large を使う
  curl -fsSL -o "$source" "https://pbs.twimg.com/media/$name?format=jpg&name=large"
fi

ffmpeg -v error -i "$source" \
  -vf 'scale=w=640:h=640:force_original_aspect_ratio=decrease' \
  -q:v 80 "$out" -y

echo "public/flyers/$name.webp: $(file -b "$out")" >&2
echo "$name.webp"
