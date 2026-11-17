#!/usr/bin/env python3
"""Build a diagram page: copy the template and swap in a DIAGRAM data file.

Usage: fill.py <data.js> <out.html>
The data file must define `const DIAGRAM = {...};` (see SKILL.md).
"""
import re
import sys
from pathlib import Path

START, END = "/* DIAGRAM-DATA:START", "/* DIAGRAM-DATA:END */"


def main() -> None:
    data_path, out_path = Path(sys.argv[1]), Path(sys.argv[2])
    template = (Path(__file__).resolve().parent.parent / "assets" / "template.html").read_text()
    data = data_path.read_text().strip()
    if "const DIAGRAM" not in data:
        sys.exit("data file must define `const DIAGRAM = {...};`")
    i, j = template.index(START), template.index(END) + len(END)
    page = template[:i] + "/* DIAGRAM-DATA:START */\n" + data + "\n" + END + template[j:]
    m = re.search(r'title:\s*"([^"]+)"', data)
    page = page.replace("__TITLE__", m.group(1) if m else "System diagram")
    out_path.write_text(page)
    print(out_path)


if __name__ == "__main__":
    main()
