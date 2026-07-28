import re

filepath = r"C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Grupo Lapitádio\Insumo\Bases de conhecimentos da - Imersão.txt"
with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

# Clean spaces
text = re.sub(r'[\r\n]+', ' ', text)
text = re.sub(r'\s+', ' ', text)

# Find split indices based on the specific page headers
idx_rec = text.find("--- PAGINA 1 ---")
idx_onb = text.find("--- PAGINA 6 ---")
idx_ent = text.find("--- PAGINA 15 ---")
idx_cup = text.find("--- PAGINA 25 ---")

txt_rec = text[idx_rec:idx_onb].strip()
txt_onb = text[idx_onb:idx_ent].strip()
txt_ent = text[idx_ent:idx_cup].strip()
txt_cup = text[idx_cup:].strip()

base_path = r"C:\Users\Pedro\Desktop\AwsalesUniversalCreator\Grupo Lapitádio\Insumo"

with open(f"{base_path}\\01_Recuperacao_Vendas.txt", "w", encoding="utf-8") as f:
    f.write(txt_rec)

with open(f"{base_path}\\02_Onboarding.txt", "w", encoding="utf-8") as f:
    f.write(txt_onb)

with open(f"{base_path}\\03_Entrega_IA.txt", "w", encoding="utf-8") as f:
    f.write(txt_ent)

with open(f"{base_path}\\04_Cupula.txt", "w", encoding="utf-8") as f:
    f.write(txt_cup)

print("Text files successfully split based on PDF pages.")
