#!/usr/bin/env python3
"""data/appearances.json に出演を 1 件差し込む。

キー順・インデント・日付順を既存に揃えるためのもので、バリデーションは
lib/appearances.ts の parseOne の写し。あちらが唯一の正なので、
スキーマを変えるときは両方を直すこと。
"""

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

ROLES = ("DJ", "VJ", "DJVJ")
REAL_SUFFIX = " <Real>"
FLYER_PATTERN = re.compile(r"^[\w-]+\.webp$")

REPO = Path(__file__).resolve().parents[3]
JSON_PATH = REPO / "data" / "appearances.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", required=True, help="開催日 (YYYY-MM-DD)")
    parser.add_argument("--title", required=True, help="イベント名")
    parser.add_argument("--role", required=True, choices=ROLES)
    parser.add_argument("--real", action="store_true", help="リアル会場での出演")
    parser.add_argument("--url", help="主催側の告知ツイートの URL")
    parser.add_argument("--flyer", help="public/flyers/ 配下のファイル名")
    parser.add_argument("--dry-run", action="store_true", help="書き込まずに差分だけ出す")
    return parser.parse_args()


def die(message: str) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(1)


def build_entry(args: argparse.Namespace) -> dict:
    try:
        date.fromisoformat(args.date)
    except ValueError:
        die(f"--date: 実在する YYYY-MM-DD が必要です ({args.date!r})")

    title = args.title.strip()
    if not title:
        die("--title: 空でない文字列が必要です")

    # real と title 末尾の <Real> は二重に持つので、片方だけだとビルドが落ちる
    if title.endswith(REAL_SUFFIX) != args.real:
        die(
            f'--real と --title 末尾の "{REAL_SUFFIX.strip()}" が食い違っています'
            f" (real: {args.real}, title: {title!r})"
        )

    if args.url is not None and not args.url.startswith("https://"):
        die(f"--url: https:// で始まる URL が必要です ({args.url!r})")

    if args.flyer is not None:
        if not FLYER_PATTERN.match(args.flyer):
            die(f"--flyer: public/flyers/ 配下の .webp のファイル名が必要です ({args.flyer!r})")
        if not (REPO / "public" / "flyers" / args.flyer).is_file():
            die(f"--flyer: public/flyers/{args.flyer} がありません（先に fetch-flyer.sh を通す）")

    entry = {"date": args.date, "title": title, "role": args.role}
    if args.real:
        entry["real"] = True
    if args.url is not None:
        entry["url"] = args.url
    if args.flyer is not None:
        entry["flyer"] = args.flyer
    return entry


def main() -> None:
    args = parse_args()
    entry = build_entry(args)

    appearances = json.loads(JSON_PATH.read_text(encoding="utf-8"))

    for existing in appearances:
        if existing["date"] == entry["date"] and existing["title"] == entry["title"]:
            die(f"同じ回が既にあります: {entry['date']} {entry['title']}")

    appearances.append(entry)
    # 表示側 (loadAppearances) と同じ並びにしておく
    appearances.sort(key=lambda a: (a["date"], a["title"]))

    rendered = json.dumps(appearances, ensure_ascii=False, indent=2) + "\n"

    print(json.dumps(entry, ensure_ascii=False, indent=2))
    if args.dry_run:
        print("--dry-run: 書き込んでいません", file=sys.stderr)
        return

    JSON_PATH.write_text(rendered, encoding="utf-8")
    print(f"{JSON_PATH.relative_to(REPO)}: {len(appearances)} 件", file=sys.stderr)


if __name__ == "__main__":
    main()
