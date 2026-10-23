#!/usr/bin/env python3
"""Build a compact EN/TH game vocabulary catalog from open dictionaries."""

from __future__ import annotations

import argparse
import csv
import json
import re
import zipfile
from collections import defaultdict
from pathlib import Path


TARGET_PER_CATEGORY = 250

CATEGORY_CONFIG = {
    "food": {
        "files": ["noun.food.json", "verb.consumption.json"],
        "keywords": [
            "food", "drink", "meal", "cook", "restaurant", "dish", "eat",
            "fruit", "vegetable", "meat", "bread", "rice", "soup", "coffee",
            "tea", "juice", "dessert", "taste", "kitchen", "ingredient",
        ],
        "allow_domain_fallback": True,
    },
    "travel": {
        "files": [
            "verb.motion.json", "noun.artifact.json", "noun.location.json",
            "noun.act.json", "noun.communication.json",
        ],
        "keywords": [
            "travel", "journey", "transport", "vehicle", "road", "street",
            "rail", "train", "bus", "aircraft", "airplane", "flight",
            "airport", "ship", "boat", "bicycle", "car", "route", "ticket",
            "passenger", "departure", "arrival", "luggage", "map", "direction",
            "station", "terminal", "drive", "ride", "sail", "voyage", "trip",
        ],
        "allow_domain_fallback": False,
    },
    "accommodations": {
        "files": [
            "noun.artifact.json", "noun.location.json", "noun.state.json",
            "noun.act.json", "verb.social.json",
        ],
        "keywords": [
            "hotel", "motel", "hostel", "resort", "lodging", "accommodation",
            "room", "house", "building", "bed", "bedroom", "bathroom", "guest",
            "rent", "stay", "reception", "service", "clean", "towel", "blanket",
            "furniture", "door", "key", "lobby", "booking", "reserve", "suite",
            "apartment", "shower", "toilet", "balcony", "elevator", "floor",
        ],
        "allow_domain_fallback": False,
    },
    "attractions": {
        "files": [
            "noun.location.json", "noun.artifact.json", "noun.act.json",
            "noun.plant.json", "noun.communication.json",
        ],
        "keywords": [
            "museum", "park", "beach", "mountain", "river", "lake", "monument",
            "temple", "church", "gallery", "zoo", "garden", "island", "forest",
            "waterfall", "historic", "architecture", "festival", "tour", "scenic",
            "sightseeing", "theater", "stadium", "landmark", "attraction",
            "sculpture", "archaeology", "palace", "castle", "market", "square",
            "tower", "bridge", "nature", "trail", "view", "visitor", "exhibition",
        ],
        "allow_domain_fallback": False,
    },
}

WORD_PATTERN = re.compile(r"^[a-z]{3,15}$")
BAD_SENSE_TERMS = {
    "computer", "chess", "military operations", "nautical", "weightlift",
    "baseball", "football", "hockey", "sexual", "slang",
}
THAI_HINTS = {
    "food": [
        "อาหาร", "เครื่องดื่ม", "น้ำผลไม้", "น้ำชา", "ขนมปัง", "เนื้อสัตว์",
        "กิน", "ดื่ม", "รสชาติ", "ผัก", "ผลไม้", "กาแฟ", "ซุป", "ขนม",
    ],
    "travel": [
        "เดินทาง", "สถานี", "สนามบิน", "เครื่องบิน", "รถ", "เรือ", "ถนน",
        "เส้นทาง", "ตั๋ว", "ผู้โดยสาร", "ขนส่ง", "แผนที่", "ขับ", "บิน",
    ],
    "accommodations": [
        "ที่พัก", "โรงแรม", "ห้อง", "บ้าน", "เตียง", "ผ้าห่ม", "แขก",
        "พัก", "จอง", "อาคาร", "ประตู", "กุญแจ", "ห้องน้ำ", "รีสอร์ต",
    ],
    "attractions": [
        "ท่องเที่ยว", "สถานที่", "สวน", "วัด", "พิพิธภัณฑ์", "ชายหาด",
        "ภูเขา", "แม่น้ำ", "เกาะ", "ปราสาท", "พระราชวัง", "โรงละคร",
        "อนุสาวรีย์", "ตลาด", "ลาน", "เที่ยวชม", "ประติมากรรม",
    ],
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lexitron", required=True, type=Path)
    parser.add_argument("--wordnet-zip", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--levels", required=True, type=Path)
    return parser.parse_args()


def normalized_pos(value: str) -> str:
    value = value.upper()
    if value == "N":
        return "n"
    if value in {"V", "VI", "VT"}:
        return "v"
    if value == "ADJ":
        return "a"
    if value == "ADV":
        return "r"
    return ""


def load_thai_translations(path: Path) -> dict[str, list[tuple[str, str]]]:
    translations: dict[str, list[tuple[str, str]]] = defaultdict(list)
    with path.open(encoding="utf-8-sig", newline="") as source:
        for row in csv.DictReader(source):
            word = (row.get("e-entry") or "").strip().lower()
            thai = (row.get("t-entry") or "").strip()
            if WORD_PATTERN.fullmatch(word) and thai:
                translations[word].append((normalized_pos(row.get("e-cat") or ""), thai))

    return dict(translations)


def choose_thai(
    translations: dict[str, list[tuple[str, str]]],
    word: str,
    part_of_speech: str,
    category: str,
) -> str:
    values = translations[word]
    same_pos = [thai for pos, thai in values if pos == part_of_speech]
    choices = same_pos or [thai for _, thai in values]
    scored = [
        (sum(len(hint) for hint in THAI_HINTS[category] if hint in thai), -len(thai), -index, thai)
        for index, thai in enumerate(choices)
    ]
    best = max(scored)
    return best[-1] if best[0] > 0 else choices[0]


def existing_words(path: Path) -> set[str]:
    source = path.read_text(encoding="utf-8")
    return {
        match.group(1).lower()
        for match in re.finditer(r'\["([A-Za-z]+)",\s*"', source)
    }


def candidate_score(word: str, definition: str, keywords: list[str]) -> int:
    word_score = sum(5 for keyword in keywords if keyword == word)
    text = f" {definition.lower()} "
    definition_score = sum(1 for keyword in keywords if keyword in text)
    penalty = sum(10 for term in BAD_SENSE_TERMS if term in text)
    return word_score + definition_score - penalty


def load_candidates(
    archive: zipfile.ZipFile,
    filenames: list[str],
    keywords: list[str],
    thai: dict[str, list[tuple[str, str]]],
    allow_domain_fallback: bool,
    category: str,
) -> list[dict[str, str | int]]:
    candidates: dict[str, dict[str, str | int]] = {}
    for filename in filenames:
        data = json.loads(archive.read(filename))
        for synset in data.values():
            definitions = synset.get("definition") or []
            if not definitions:
                continue
            definition = str(definitions[0]).strip()
            part_of_speech = str(synset.get("partOfSpeech") or "")
            if not 12 <= len(definition) <= 180:
                continue
            for member in synset.get("members") or []:
                word = str(member).lower().replace("_", " ")
                if not WORD_PATTERN.fullmatch(word) or word not in thai:
                    continue
                score = candidate_score(word, definition, keywords)
                if score <= 0 and not allow_domain_fallback:
                    continue
                if score < 0:
                    continue
                candidate = {
                    "word": word,
                    "thai": choose_thai(thai, word, part_of_speech, category),
                    "definition": definition,
                    "score": score,
                }
                previous = candidates.get(word)
                if previous is None or int(candidate["score"]) > int(previous["score"]):
                    candidates[word] = candidate

    return sorted(
        candidates.values(),
        key=lambda item: (-int(item["score"]), len(str(item["word"])), str(item["word"])),
    )


def main() -> None:
    args = parse_args()
    thai = load_thai_translations(args.lexitron)
    used = existing_words(args.levels)
    output: list[dict[str, str]] = []

    with zipfile.ZipFile(args.wordnet_zip) as archive:
        for category, config in CATEGORY_CONFIG.items():
            candidates = load_candidates(
                archive,
                list(config["files"]),
                list(config["keywords"]),
                thai,
                bool(config["allow_domain_fallback"]),
                category,
            )
            chosen = []
            for candidate in candidates:
                word = str(candidate["word"])
                if word in used:
                    continue
                used.add(word)
                chosen.append(
                    {
                        "id": word,
                        "word": word,
                        "thai": str(candidate["thai"]),
                        "definition": str(candidate["definition"]),
                        "category": category,
                    }
                )
                if len(chosen) == TARGET_PER_CATEGORY:
                    break

            if len(chosen) < TARGET_PER_CATEGORY:
                raise RuntimeError(
                    f"Only found {len(chosen)} usable words for {category}; "
                    f"need {TARGET_PER_CATEGORY}"
                )
            output.extend(chosen)
            print(f"{category}: {len(chosen)} of {len(candidates)} candidates")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"total: {len(output)}")


if __name__ == "__main__":
    main()
