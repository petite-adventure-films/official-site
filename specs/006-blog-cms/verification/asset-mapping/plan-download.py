"""Offline acquisition sizing and recovery queue; does not download or issue IDs."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
raw = (root / 'inventory-result.json').read_bytes()
mapping = json.loads(raw)
source = json.loads(Path('astro/data/wordpress-export.json').read_bytes())
media_raw = Path('astro/data/wordpress-media-inventory.json').read_bytes()
assert hashlib.sha256(media_raw).hexdigest() == mapping['inventoryHash']
assert hashlib.sha256(Path('astro/data/wordpress-export.json').read_bytes()).hexdigest() == mapping['sourceHash']
media = {e['relativePath']: e for e in json.loads(media_raw)['entries']}
owned = [r for r in mapping['records'] if r['ownership'] == 'owned-upload']
paths = {r['inventory']['relativePath'] for r in owned}
known = [media[p]['remoteCheck']['contentLength'] for p in paths if isinstance(media[p].get('remoteCheck', {}).get('contentLength'), int)]
# Budget every exact URL, even when paths coincide: alias equality is unverified.
url_lengths = [media[r['inventory']['relativePath']]['remoteCheck'].get('contentLength') for r in owned]
blogs = {p['id']: p for p in source['content']['blogs']}
recovery = []
for row in mapping['historicalMissing']:
    recovery.append({'url': row['url'], 'articles': [{'id': i, 'title': blogs[i]['title']} for i in row['articleIds']], 'candidateURL': (row['inventory']['originalCandidate'] or {}).get('sourceUrl'), 'state': 'needs-original-or-backup' if not row['inventory']['originalCandidate'] else 'needs-content-and-crop-review', 'decision': None})
result = {'scope': 'Offline planning, not an executed download manifest', 'mappingSha256': hashlib.sha256(raw).hexdigest(), 'sourceHash': mapping['sourceHash'], 'inventoryHash': mapping['inventoryHash'], 'pathGroups': len(paths), 'exactURLJobs': len(owned), 'additionalAliasJobs': len(owned)-len(paths), 'historicalSizing': {'date': mapping['inventoryGeneratedAt'], 'knownPathCount': len(known), 'unknownPathCount': len(paths)-len(known), 'pathBytes': sum(known), 'exactURLBytes': sum(n for n in url_lengths if isinstance(n, int)), 'unknownURLCount': sum(n is None for n in url_lengths), 'largestKnownFileBytes': max(known), 'caveat': 'Historical HEAD values only; missing files, recovery candidates, changed responses and retries are additional.'}, 'recoveryQueue': recovery}
assert len(recovery) == 8
assert sum(r['candidateURL'] is not None for r in recovery) == 7
assert len(paths) == mapping['ownedInventoryPaths']
assert len(owned) == mapping['ownedDistinctURLs']
(root / 'download-plan-result.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k != 'recoveryQueue'}, ensure_ascii=False, indent=2))
