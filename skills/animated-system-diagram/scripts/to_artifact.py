#!/usr/bin/env python3
"""Strip the document wrapper so the page can be published with the Artifact tool,
which adds its own <!doctype>, <html>, <head> and <body>.

Usage: to_artifact.py <page.html> <out.html>
"""
import re
import sys
from pathlib import Path

src = Path(sys.argv[1]).read_text()
for pat in (r"<!doctype html>\s*", r"<html[^>]*>\s*", r"<head>\s*", r'<meta charset="utf-8">\s*',
            r'<meta name="viewport"[^>]*>\s*', r"</head>\s*", r"<body>\s*", r"</body>\s*", r"</html>\s*"):
    src = re.sub(pat, "", src, count=1, flags=re.I)
Path(sys.argv[2]).write_text(src)
print(sys.argv[2])
