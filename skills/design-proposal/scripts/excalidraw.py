"""Tiny Excalidraw scene builder for proposal diagrams.

Usage, from a diagram script:

    import sys; sys.path.insert(0, "<skill>/scripts")
    from excalidraw import D
    d = D()
    d.text(40, 20, "Title", 32)
    a = d.box(40, 100, 200, 90, "Client", bg="violet")
    b = d.box(320, 100, 220, 90, "API", bg="blue")
    d.arrow(a, b, "1. GET /items")
    d.dump("lookup.excalidraw")

box(x, y, w, h, text, bg, size, shape="rectangle"|"diamond"|"ellipse", style="solid"|"dashed", align="center"|"left")
  align="left" draws the text as a free label inside the box (use for field lists).
arrow(a, b, label=None, style, side=("r","l")): sides are r, l, t, b. Leave 140px or more between boxes when the arrow has a label.
text(x, y, text, size=20, color=None, family=5) (pass color and family as keywords): family 5 is the hand font, 8 is monospace.
Colours: ink blue green yellow red grey violet orange, or any hex.
Then render with render.py.
"""
import json, random
random.seed(7)
C = dict(ink="#1e1e1e", blue="#a5d8ff", green="#b2f2bb", yellow="#ffec99", red="#ffc9c9", grey="#e9ecef", violet="#d0bfff", orange="#ffd8a8")

class D:
    def __init__(s): s.els=[]; s.n=0
    def _id(s): s.n+=1; return f"e{s.n}"
    def _base(s, t, x, y, w, h, **k):
        e=dict(id=s._id(), type=t, x=x, y=y, width=w, height=h, angle=0, strokeColor=k.get("stroke", C["ink"]),
               backgroundColor=k.get("bg","transparent"), fillStyle="solid", strokeWidth=k.get("sw",2),
               strokeStyle=k.get("style","solid"), roughness=1, opacity=100, groupIds=[], frameId=None,
               roundness={"type":3} if t=="rectangle" else ({"type":2} if t in("diamond","ellipse","arrow") else None),
               seed=random.randint(1,2**31), version=1, versionNonce=random.randint(1,2**31), isDeleted=False,
               boundElements=[], updated=1, link=None, locked=False)
        s.els.append(e); return e
    def text(s, x, y, txt, size=20, align="left", container=None, color=None, family=5):
        lines=txt.split("\n"); w=max(len(l) for l in lines)*size*0.55; h=len(lines)*size*1.25
        e=s._base("text", x, y, w, h, stroke=color or C["ink"])
        e.update(text=txt, originalText=txt, fontSize=size, fontFamily=family, textAlign=align,
                 verticalAlign="middle" if container else "top", containerId=container["id"] if container else None,
                 lineHeight=1.25, autoResize=True)
        if container:
            container["boundElements"].append({"type":"text","id":e["id"]})
            e["x"]=container["x"]+(container["width"]-w)/2; e["y"]=container["y"]+(container["height"]-h)/2
        return e
    def box(s, x, y, w, h, txt="", bg="grey", size=18, shape="rectangle", style="solid", align="center", family=5):
        e=s._base(shape, x, y, w, h, bg=C.get(bg,bg), style=style)
        if txt and align=="left":
            t=s.text(x+24,y+22,txt,size,"left",family=family); g="g"+e["id"]; e["groupIds"]=[g]; t["groupIds"]=[g]
        elif txt: s.text(0,0,txt,size,align,container=e,family=family)
        return e
    def arrow(s, a, b, label=None, style="solid", side=("r","l"), size=16, color=None):
        def pt(e, sd):
            cx=e["x"]+e["width"]/2; cy=e["y"]+e["height"]/2
            return {"r":(e["x"]+e["width"],cy),"l":(e["x"],cy),"t":(cx,e["y"]),"b":(cx,e["y"]+e["height"])}[sd]
        (x1,y1),(x2,y2)=pt(a,side[0]),pt(b,side[1])
        gap=8
        dx,dy=x2-x1,y2-y1; L=(dx*dx+dy*dy)**.5 or 1
        x1+=dx/L*gap; y1+=dy/L*gap; x2-=dx/L*gap; y2-=dy/L*gap
        e=s._base("arrow", x1, y1, abs(x2-x1), abs(y2-y1), style=style, stroke=color or C["ink"])
        e.update(points=[[0,0],[x2-x1,y2-y1]], lastCommittedPoint=None, startArrowhead=None, endArrowhead="arrow",
                 startBinding={"elementId":a["id"],"focus":0,"gap":gap}, endBinding={"elementId":b["id"],"focus":0,"gap":gap}, elbowed=False)
        a["boundElements"].append({"type":"arrow","id":e["id"]}); b["boundElements"].append({"type":"arrow","id":e["id"]})
        if label: s.text(0,0,label,size,"center",container=e)
        return e
    def dump(s, path):
        json.dump(dict(type="excalidraw", version=2, source="https://excalidraw.com", elements=s.els,
                       appState=dict(viewBackgroundColor="#ffffff", gridSize=None), files={}), open(path,"w"), indent=1)

