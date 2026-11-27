"""Reconcile authenticated REST posts with WXR backups; never import or publish.

Usage: python3 astro/scripts/audit-wordpress-nonpublic.py REST.json DRAFT.xml PRIVATE.xml OUTPUT.json
Keep all inputs/outputs in the ignored .local directory. Output includes private data.
"""
import hashlib
import json
import os
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

NS = {'wp': 'http://wordpress.org/export/1.2/', 'content': 'http://purl.org/rss/1.0/modules/content/'}


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def newline(value):
    return value.replace('\r\n', '\n').replace('\r', '\n')


def audit(rest_bytes, wxr_bytes):
    records = json.loads(rest_bytes)
    if not isinstance(records, list):
        raise ValueError('invalid_rest_collection')
    rest = {}
    for record in records:
        identity = record.get('id')
        if type(identity) is not int or identity <= 0 or identity in rest:
            raise ValueError('invalid_or_duplicate_rest_id')
        if record.get('type') != 'post' or record.get('status') not in ('draft', 'private'):
            raise ValueError('unexpected_post_type_or_status')
        rest[identity] = record
    posts, attachments = {}, {}
    for raw in wxr_bytes:
        if b'<!DOCTYPE' in raw.upper() or b'<!ENTITY' in raw.upper():
            raise ValueError('xml_entities_not_allowed')
        root = ET.fromstring(raw)
        if root.findtext('./channel/wp:wxr_version', namespaces=NS) != '1.2':
            raise ValueError('unsupported_wxr_version')
        for item in root.findall('./channel/item'):
            get = lambda name: item.findtext('wp:' + name, default='', namespaces=NS)
            identity = int(get('post_id'))
            kind = get('post_type')
            meta = {}
            for entry in item.findall('wp:postmeta', NS):
                key = entry.findtext('wp:meta_key', namespaces=NS)
                meta.setdefault(key, []).append(entry.findtext('wp:meta_value', default='', namespaces=NS))
            if kind == 'attachment':
                entry = {'legacyId': identity, 'parentId': int(get('post_parent')),
                         'url': get('attachment_url'), 'meta': meta}
                if identity in attachments and attachments[identity] != entry:
                    raise ValueError('conflicting_attachment')
                attachments[identity] = entry
                continue
            if kind != 'post' or identity in posts:
                raise ValueError('unexpected_or_duplicate_wxr_post')
            if identity not in rest:
                raise ValueError('wxr_post_missing_from_rest')
            record = rest[identity]
            pairs = [
                (item.findtext('title', default=''), record['title']['raw']),
                (item.findtext('content:encoded', default='', namespaces=NS), record['content']['raw']),
                (get('status'), record['status']), (get('post_name'), record['slug']),
                (get('post_date').replace(' ', 'T'), record['date']),
                (get('post_modified').replace(' ', 'T'), record['modified']),
            ]
            if any(newline(a) != newline(b) for a, b in pairs):
                raise ValueError('rest_wxr_mismatch')
            posts[identity] = {'legacyId': identity, 'sourceStatus': record['status'],
                               'publish': False, 'restRecord': record, 'meta': meta,
                               'wxrTerms': [dict(term.attrib, name=term.text or '') for term in item.findall('category')]}
    if set(posts) != set(rest):
        raise ValueError('incomplete_wxr_coverage')
    return {
        'schemaVersion': 'wordpress-nonpublic-intake/v1',
        'sourceHashes': {'rest': digest(rest_bytes), 'wxr': [digest(raw) for raw in wxr_bytes]},
        'counts': {status: sum(r['status'] == status for r in records) for status in ('draft', 'private')},
        'comparison': 'IDs, raw titles, raw bodies, statuses, slugs, local dates and modified dates match; XML newlines normalized for comparison only',
        'limitations': ['not an import manifest', 'attachment export membership does not prove body usage or file availability',
                        'CMS owner-only visibility and formal conversion remain unverified'],
        'posts': [posts[key] for key in sorted(posts)],
        'attachments': [attachments[key] for key in sorted(attachments)],
    }


def main(args):
    if len(args) != 4:
        raise ValueError('usage: REST.json DRAFT.xml PRIVATE.xml OUTPUT.json')
    local = Path(__file__).resolve().parents[2] / '.local'
    paths = [Path(arg).resolve() for arg in args]
    if any(not path.is_relative_to(local) for path in paths):
        raise ValueError('private_inputs_and_output_must_be_under_dot_local')
    report = audit(paths[0].read_bytes(), [path.read_bytes() for path in paths[1:3]])
    descriptor = os.open(paths[3], os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, 'w') as output:
        json.dump(report, output, ensure_ascii=False, indent=2)
        output.write('\n')
    print(json.dumps({'counts': report['counts'], 'attachments': len(report['attachments']), 'matched': len(report['posts'])}))


if __name__ == '__main__':
    main(sys.argv[1:])
