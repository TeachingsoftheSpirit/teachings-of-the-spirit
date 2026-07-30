from docx import Document

doc = Document(r"C:\Users\z\Desktop\Teachings - 8-1-2019\Russell's Ruminations\Russells Ruminations Vol 2, No 2.docx")
paras = [p.text.strip() for p in doc.paragraphs if p.text.strip()]

# Body starts after "Dear Friends:" and includes the full closing / signature
body = paras[8:88]
full_text = "\n\n".join(body)

with open("update_vol2no2.sql", "w", encoding="utf-8") as f:
    f.write("UPDATE public.ruminations\n")
    f.write("SET full_text = $rum$\n")
    f.write(full_text)
    f.write("\n$rum$\n")
    f.write("WHERE slug = 'vol-2-no-2';\n")

print("Done. File update_vol2no2.sql created.")
print(f"Characters: {len(full_text)}")
print(f"Paragraphs: {len(body)}")
print("--- Last few lines ---")
for p in body[-6:]:
    print(p)