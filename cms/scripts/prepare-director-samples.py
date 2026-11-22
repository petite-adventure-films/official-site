"""Prepare isolated review copies, never publish or write to a remote database.

Original records and the conversion report are retained alongside the SQL.
Only the explicitly approved formatting subset may be simplified.
"""
import argparse
import json
import pathlib
import re
import uuid
from html.parser import HTMLParser


class Html(HTMLParser):
    def __init__(self, value):
        super().__init__(convert_charrefs=True)
        self.root = {"tag": "root", "attrs": {}, "children": []}
        self.stack = [self.root]
        self.feed(value)
        self.close()
        if len(self.stack) != 1:
            raise ValueError("Unclosed HTML")

    def handle_starttag(self, tag, attrs):
        node = {"tag": tag, "attrs": dict(attrs), "children": []}
        self.stack[-1]["children"].append(node)
        if tag not in {"br", "img", "hr"}:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in {"br", "img", "hr"}:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if self.stack[-1]["tag"] != tag:
            raise ValueError("Unbalanced HTML: " + tag)
        self.stack.pop()

    def handle_data(self, value):
        self.stack[-1]["children"].append(value)


def body(value, assets, simplify=False):
    warnings = []
    mark_types = {"strong": "bold", "b": "bold", "em": "italic", "i": "italic", "u": "underline", "s": "strike"}

    def visit(node, marks=()):
        if isinstance(node, str):
            if not node:
                return []
            return [{"type": "text", "text": node, **({"marks": list(marks)} if marks else {})}]
        tag, attrs = node["tag"], node["attrs"]
        if any(k.startswith("on") for k in attrs):
            raise ValueError("Event handlers are not importable")
        if tag == "span":
            if not simplify:
                raise ValueError("Formatting simplification requires explicit approval")
            if set(attrs) - {"style"} or not re.fullmatch(r"\s*color:\s*#[0-9a-fA-F]{6};?\s*", attrs.get("style", "")):
                raise ValueError("Unsupported span formatting")
            warnings.append({"kind": "simplified-color", "value": attrs["style"]})
        elif "style" in attrs:
            raise ValueError("Unsupported block style")
        if tag in mark_types or tag == "a":
            mark = {"type": mark_types[tag]} if tag in mark_types else {"type": "link", "attrs": {"href": attrs.get("href", "")}}
            if tag == "a":
                mark["attrs"].update({key: attrs[key] for key in ("target", "title") if attrs.get(key)})
            if tag == "a" and not re.match(r"^(https?://|mailto:)", mark["attrs"]["href"]):
                raise ValueError("Unsupported link")
            marks = tuple(m for m in marks if m["type"] != mark["type"]) + (mark,)
        if tag == "img":
            if attrs.get("src") not in assets:
                raise ValueError("Image has not been verified")
            warnings.append({"kind": "responsive-image", "source": attrs["src"], "width": attrs.get("width"), "height": attrs.get("height")})
            return [{"type": "assetImage", "attrs": {"assetId": assets[attrs["src"]], "alt": attrs.get("alt", "")}}]
        if tag == "br":
            return [{"type": "hardBreak"}]
        if tag not in {"root", "p", "span", "a", *mark_types}:
            raise ValueError("Unsupported HTML element: " + tag)
        children = [out for child in node["children"] for out in visit(child, marks)]
        if tag == "root":
            blocks, inline = [], []
            for child in children:
                if child["type"] in {"text", "hardBreak"}:
                    if child["type"] != "text" or not child["text"].isspace() or inline:
                        inline.append(child)
                else:
                    if inline:
                        blocks.append({"type": "paragraph", "content": inline})
                        inline = []
                    blocks.append(child)
            if inline:
                blocks.append({"type": "paragraph", "content": inline})
            return blocks
        if tag == "p":
            # Images are block nodes in the current editor: split paragraphs,
            # retaining text, hard breaks and the image in original order.
            blocks, inline = [], []
            for child in children:
                if child["type"] == "assetImage":
                    if inline:
                        blocks.append({"type": "paragraph", "content": inline})
                        inline = []
                    blocks.append(child)
                else:
                    inline.append(child)
            if inline or not blocks:
                blocks.append({"type": "paragraph", **({"content": inline} if inline else {})})
            return blocks
        return children

    return {"schemaVersion": 2, "doc": {"type": "doc", "content": visit(Html(value).root)}}, warnings


def plain(value):
    def visit(n):
        if isinstance(n, str):
            return n
        if n["tag"] == "br":
            return "\n"
        if n["tag"] not in {"root", "p", "a"}:
            raise ValueError("Unsupported event HTML: " + n["tag"])
        text = "".join(visit(c) for c in n["children"])
        if n["tag"] == "a":
            return text + "（" + n["attrs"]["href"] + "）"
        return text + ("\n" if n["tag"] == "p" else "")
    return visit(Html(value).root).strip()


def stable_id(value):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, "paf-director-review-20261122/" + value))


def prepare(snapshot, assets, simplify=False):
    copies = []
    for kind, ids in [("events", [18010]), ("blogs", [18043, 18053]), ("news", [18059]), ("media", [17839]), ("channels", [17837])]:
        for old_id in ids:
            source = next(a for a in snapshot["content"][kind] if a["id"] == old_id)
            tags = lambda name: [str(t["term_id"]) for t in source.get(name, []) or []]
            payload = {"title": source["title"] + "【操作確認用コピー】", "slug": "review-wp-" + str(old_id),
                       "filmTagIds": tags("film_tags"), "eventTagIds": tags("event_tags")}
            warnings = []
            if kind == "blogs":
                payload["body"], warnings = body(source["content"], assets, simplify)
                categories = source.get("categories") or []
                if len(categories) != 1:
                    raise ValueError("Category mapping requires review")
                payload.update(categoryId=str(categories[0]["term_id"]), isRecommended=source["recommended"] == "1",
                               isWorkshopReport=5026 in source.get("tag_ids", []))
            elif kind in {"news", "media", "channels"}:
                del payload["eventTagIds"]
                payload["body"], warnings = body(source["content"], assets, simplify)
                if kind == "news":
                    del payload["slug"]
                elif kind == "media":
                    pdf = source.get("media_pdf_url")
                    if pdf and pdf not in assets:
                        raise ValueError("PDF has not been verified")
                    if source.get("media_video"):
                        raise ValueError("Video URL mapping requires review")
                    excerpt, excerpt_warnings = body(source.get("article_contents") or "", assets, simplify)
                    warnings.extend(excerpt_warnings)
                    payload.update(sourceName=source.get("media_name") or "", sourceIssue=source.get("media_volume") or "",
                                   coverageLabel=source.get("media_contents") or "", attachmentAssetIds=[assets[pdf]] if pdf else [],
                                   youtubeId="", articleHeadline=source.get("article_title") or "",
                                   articleSubheadline=source.get("article_subtitle") or "", articleBody=excerpt)
                else:
                    if not re.fullmatch(r"[A-Za-z0-9_-]{11}", source.get("youtube_id") or ""):
                        raise ValueError("YouTube ID mapping requires review")
                    payload.update(youtubeId=source["youtube_id"], productionYear=source.get("created_year") or "",
                                   productionCountry=source.get("created_country") or "", duration=source.get("running_time") or "")
            else:
                payload.update(startDate=source["date_from"].replace("/", "-"), endDate=source["date_to"].replace("/", "-"),
                               venue=source["place"], address=source["address"], mapUrl=source["map"], venueNotes="",
                               multiDay=source["date_from"] != source["date_to"], formats=["offline"], status="normal")
                if source["status"] or source["content"]:
                    raise ValueError("Unexpected event status/body")
                for target, origin in [("timeDescription", "dates_details"), ("access", "access_details"),
                                       ("fee", "fee_details"), ("organizer", "host_details"), ("notes", "appendix_contents")]:
                    payload[target] = plain(source[origin])
                warnings.append({"kind": "event-text-fields", "detail": "HTML paragraphs become text; link destinations remain in parentheses"})
            copies.append({"id": stable_id(kind + "/" + str(old_id)), "type": {"blogs": "blog", "events": "event", "news": "news", "media": "pressCoverage", "channels": "video"}[kind],
                           "oldId": old_id, "source": source, "payload": payload, "warnings": warnings})
    return copies


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--snapshot", required=True)
    parser.add_argument("--assets", required=True, help="Verified source URL to asset ID JSON")
    parser.add_argument("--output", required=True)
    parser.add_argument("--simplify-formatting", action="store_true")
    args = parser.parse_args()
    snapshot = json.loads(pathlib.Path(args.snapshot).read_text())
    copies = prepare(snapshot, json.loads(pathlib.Path(args.assets).read_text()), args.simplify_formatting)
    result = {"purpose": "review-copy-not-formal-migration", "source": snapshot["source"], "copies": copies}
    pathlib.Path(args.output).write_text(json.dumps(result, ensure_ascii=False, indent=2))
    print("Prepared", len(copies), "review copies; no database changes")
