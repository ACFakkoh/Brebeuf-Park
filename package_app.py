import os
import shutil

deploy_files = [
    "index.html",
    "style.css",
    "app.js",
    "manifest.json",
    "sw.js",
    "apple-touch-icon.png",
    "icon-192.png",
    "icon-512.png"
]

if __name__ == "__main__":
    source_dir = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(source_dir, "gh-pages-export")
    os.makedirs(out_dir, exist_ok=True)
    for fname in deploy_files:
        shutil.copy2(os.path.join(source_dir, fname), os.path.join(out_dir, fname))
        print(f"Copied: {fname}")
    zip_path = shutil.make_archive(os.path.join(source_dir, "brebeuf-parking-app"), "zip", out_dir)
    print(f"\nCreated ZIP bundle: {zip_path}")
    print(f"Files ready in folder: {out_dir}")
