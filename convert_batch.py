import fitz  # PyMuPDF
import os

pdf_dir = r"C:\Users\z\Desktop\Temp Ruminations pdf to rename"
slugs = [
    "vol-1-no-1",
    "vol-1-no-2",
    "vol-3-no-1",
    "vol-3-no-2",
    "vol-4-no-1",
    "vol-4-no-2",
    "vol-5-no-1",
    "vol-5-no-2",
    "vol-5-no-3",
    "vol-6-no-1",
    "vol-6-no-2",
    "vol-6-no-3",
]

for slug in slugs:
    pdf_path = os.path.join(pdf_dir, f"{slug}.pdf")
    if not os.path.exists(pdf_path):
        print(f"MISSING: {pdf_path}")
        continue

    output_dir = f"{slug}-pages"
    os.makedirs(output_dir, exist_ok=True)

    doc = fitz.open(pdf_path)
    print(f"{slug}: {len(doc)} pages")

    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        out_path = os.path.join(output_dir, f"page-{i+1:02d}.png")
        pix.save(out_path)

    doc.close()
    print(f"  → saved to {output_dir}/")

print("Done.")