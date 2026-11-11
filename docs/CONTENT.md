# Editing content

All content lives under `/content`. Schemas in `lib/content/schema.ts` validate
every file **at build time** — a missing required field fails `next build` with
the file name and the field, rather than shipping a broken page.

```
content/
  site.ts            identity, contact details, nav, brand asset paths, section copy
  services.ts        the three services
  process.ts         the four process steps
  testimonials.ts    real client quotes (currently empty)
  projects/*.mdx     one file per project
```

## The one rule

**Never fill a field with a placeholder.** Empty means "not known yet", and the
site hides that element: no link button, no ratings row, no testimonial, no
results table. A blank field is always safer than an invented one.

Optional fields may be left as `""` or `[]`. Required fields must have a value.

## Adding a project

1. Create `content/projects/<slug>.mdx`. The filename is the URL slug.
2. Put images in `public/work/<slug>/`.
3. Fill the frontmatter. Nothing else changes — no component edits.

### Required

| Field | Notes |
| --- | --- |
| `title` | Project name |
| `summary` | One line, used on cards and as the meta description |
| `platforms` | Any of `iOS`, `Android`, `Web` — at least one |
| `thumbnail` | `src`, `alt`, `width`, `height`; dimensions must match the file |

### Optional — hidden while empty

| Field | Notes |
| --- | --- |
| `type` | `New build`, `Rescue` or `Dedicated team`. Drives the type filter on /work; a project without one is skipped by that filter |
| `year`, `role`, `client` | Shown in the case-study header |
| `result` | One-line outcome on the card. Falls back to `summary` while empty |
| `links` | `appStore`, `googlePlay`, `website`. Each button appears only if its URL exists |
| `features` | Short list for "What we built" |
| `stack` | Tech stack chips |
| `gallery` | `src`, `alt`, `width`, `height`, `frame` (`phone` or `browser`) |
| `results` | `label` / `value` pairs. **Real numbers only** |
| `quote` | `text`, `name`, `role` — all three, or omit it |
| `featured` | `true` puts it on the home page |
| `order` | Sort order, lowest first |

The MDX body below the frontmatter is the "problem the client had" prose.

## Adding a testimonial

Add an entry to `content/testimonials.ts`. `text`, `name` and `role` are all
required — an unattributed quote is not publishable. The testimonial block
appears on the home page as soon as the list has one entry.
