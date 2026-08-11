# WordPress export data

`wordpress-export.json` is a migration snapshot of the public WordPress REST API. It preserves the current API response fields so that the Astro build can be migrated away from live WordPress requests before the final CMS schema is introduced.

Regenerate it from the `astro` directory:

```sh
pnpm export:wordpress
```

Optional arguments:

```sh
pnpm export:wordpress -- \
  --base-url https://example.com/wp-json/wp/v2 \
  --output ./data/wordpress-export.json \
  --concurrency 8 \
  --first-event-year 2011
```

The export contains only publicly available content. It does not export drafts, private posts, users, credentials, or WordPress configuration.

## Media inventory

Extract every referenced WordPress upload URL and its referring content records without downloading the files:

```sh
pnpm inventory:wordpress-media
```

This writes:

- `data/wordpress-media-inventory.json`: machine-readable URL and reference inventory
- `data/wordpress-media-inventory-summary.md`: human-readable counts and probe results

Probe remote availability and `Content-Length` separately. The defaults use two concurrent `HEAD` requests with a 250 ms delay per worker and resume previously checked entries:

```sh
pnpm probe:wordpress-media
```

Use `--limit` for a small trial before checking the full inventory:

```sh
pnpm probe:wordpress-media -- --limit 20
```

The probe does not download response bodies or media files.
