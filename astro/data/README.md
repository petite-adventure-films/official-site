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
