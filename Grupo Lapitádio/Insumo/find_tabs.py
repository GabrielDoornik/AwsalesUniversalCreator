import os
import re

filepath = r"C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Grupo Lapitádio\Insumo\Bases de conhecimentos da - Imersão.txt"

with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

text = re.sub(r'[\r\n]+', ' ', text)
text = re.sub(r'\s+', ' ', text)

out = []
# Find all "--- PAGINA X --- TITLE"
matches = re.finditer(r'--- PAGINA \d+ --- ([A-Za-z \u00C0-\u017F]+)', text)
for m in matches:
    out.append(f"Header: {m.group(0)}")

with open(r"C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Grupo Lapitádio\Insumo\headers.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out))
