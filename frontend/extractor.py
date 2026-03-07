import os
import re

blob_file = r"C:\Users\Sahil Kumar\OneDrive\Desktop\Documents\Hackathon-Hack-win\frontend\src\pages\ConceptExplainer.jsx"
out_dir = r"C:\Users\Sahil Kumar\OneDrive\Desktop\Documents\Hackathon-Hack-win\frontend\src\pages"

with open(blob_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

chunks = []
current_chunk = []

for line in lines:
    current_chunk.append(line)
    s_line = line.strip()
    if s_line.startswith('export default '):
        # Ensure it's not a comment or something complex
        if re.match(r'^export default\s+[A-Za-z0-9_]+;?$', s_line):
            chunks.append(current_chunk)
            current_chunk = []

if current_chunk and any(l.strip() for l in current_chunk):
    chunks.append(current_chunk)

print(f"Total chunks found: {len(chunks)}")

for i, chunk in enumerate(chunks):
    filename = f"Unknown_{i}.jsx"
    for line in reversed(chunk):
        match = re.search(r'^export default\s+([A-Za-z0-9_]+)', line.strip())
        if match:
            filename = match.group(1) + ".jsx"
            break
    
    out_path = os.path.join(out_dir, filename)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.writelines(chunk)
    print(f"Wrote {filename} ({len(chunk)} lines)")
