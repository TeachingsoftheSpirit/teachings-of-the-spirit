import fitz  # PyMuPDF
import os

pdf_path = r"C:\Users\z\Desktop\Temp Ruminations pdf to rename\vol-21-no-3.pdf"
output_dir = "vol-21-no-3-pages"
os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print(f"Pages: {len(doc)}")

for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    out_path = os.path.join(output_dir, f"page-{i+1:02d}.png")
    pix.save(out_path)
    print(f"Saved {out_path}")

doc.close()
print("Done.")