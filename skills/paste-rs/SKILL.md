---
name: paste-rs
description: Share text through paste.rs, a no-signup online clipboard. Use when the user wants to copy text out of the terminal or onto another machine, asks for a paste, pastebin or online clipboard link, or gives a paste.rs URL to read. Uploads are public; never use for secrets.
---

# paste.rs

paste.rs stores raw text and returns a URL. Anyone with the URL can read or delete the paste, and it has no login, expiry setting or password.

## Before uploading

Only upload text the user would be happy to see public. Never upload credentials, tokens, private keys, `.env` files, customer data or employer-confidential material. If the text might contain any of these, show it to the user and ask first.

## Upload

Pipe the exact text the user needs. Check the status code: 201 is a full upload, 206 means the server truncated it.

```sh
printf '%s' "$TEXT" | curl -sS -w '\n%{http_code}\n' --data-binary @- https://paste.rs/
curl -sS -w '\n%{http_code}\n' --data-binary @path/to/file https://paste.rs/
```

Use `--data-binary`. `-d @file` strips newlines.

- **201:** give the user the URL from the first line.
- **206:** tell the user the paste was cut off. Split the text and upload the parts, or use a different way to share it.
- **Anything else:** report the code and body. The service is heavily rate limited, so don't retry in a loop.

After uploading, fetch the URL and compare it with what you sent. Give the user the URL and the delete command.

## Links

| URL | Returns |
| --- | --- |
| `https://paste.rs/<id>` | Plain text, best for copying |
| `https://paste.rs/<id>.md` | Rendered Markdown |
| `https://paste.rs/<id>.<code ext>` | Syntax-highlighted HTML, for example `.py` or `.rs` |

## Read or delete

```sh
curl -sS https://paste.rs/<id>
curl -sS -X DELETE https://paste.rs/<id>
```

Suggest deleting the paste once the user has copied the text.
