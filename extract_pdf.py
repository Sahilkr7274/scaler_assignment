import zlib, re

with open('Scaler_SDE_Intern_Fullstack_Assignment_-_Trello_Clone.docx.pdf', 'rb') as f:
    data = f.read()

# Extract bookmark titles (plain text in PDF structure)
titles = re.findall(b'/Title \\(([^)]+)\\)', data)
for t in titles:
    print(t.decode('utf-8', errors='replace'))

print("\n--- Page text ---")
streams = re.findall(b'stream\r?\n(.*?)\r?\nendstream', data, re.DOTALL)
for i, s in enumerate(streams[:5]):
    try:
        dec = zlib.decompress(s)
        bt_blocks = re.findall(b'BT(.*?)ET', dec, re.DOTALL)
        for block in bt_blocks:
            hexes = re.findall(b'<([0-9a-fA-F]+)>', block)
            for h in hexes:
                try:
                    chars = bytes.fromhex(h.decode())
                    text = chars.decode('utf-16-be', errors='replace')
                    if any(c.isalpha() for c in text):
                        print(text, end='')
                except:
                    pass
            print()
    except:
        pass
