#!/usr/bin/env bash
# showcase の動画を HLS（fMP4）に書き出す。
#   scripts/encode-hls.sh 2108964926547239315-1
# → public/showcase/hls/<name>/index.m3u8 と画質ごとのプレイリスト・セグメント
# 画質は 720p60 / 540p60 / 360p30 の 3 段。キーフレームを 2 秒ごとに揃えて段の切り替えを滑らかにする
set -euo pipefail

name="$1"
root="$(cd "$(dirname "$0")/.." && pwd)"
src="$root/public/showcase/$name.mp4"
out="$root/public/showcase/hls/$name"

rm -rf "$out"
mkdir -p "$out"

ffmpeg -hide_banner -y -i "$src" \
  -filter_complex "[0:v]split=3[v0][v1][v2];[v1]scale=-2:540[v1o];[v2]scale=-2:360,fps=30[v2o]" \
  -map "[v0]" -map "[v1o]" -map "[v2o]" -map 0:a -map 0:a -map 0:a \
  -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -sc_threshold 0 \
  -force_key_frames "expr:gte(t,n_forced*2)" \
  -b:v:0 2500k -maxrate:v:0 2750k -bufsize:v:0 5000k \
  -b:v:1 1400k -maxrate:v:1 1540k -bufsize:v:1 2800k \
  -b:v:2 600k -maxrate:v:2 660k -bufsize:v:2 1200k \
  -c:a aac -b:a 128k -ac 2 \
  -f hls -hls_time 4 -hls_playlist_type vod \
  -hls_segment_type fmp4 -hls_flags independent_segments+single_file \
  -var_stream_map "v:0,a:0,name:720p v:1,a:1,name:540p v:2,a:2,name:360p" \
  -master_pl_name index.m3u8 \
  -hls_segment_filename "$out/%v.m4s" \
  "$out/%v.m3u8"
