import os
import shutil
import random

# Since this script is inside "train/", raw_dataset is in the same folder
RAW_PATH = "raw_dataset"
FINAL_PATH = "../final_dataset"   # create final_dataset outside "train/"

CLASSES = ["skin_rash", "eye_redness", "nail_discoloration", "wound"]

# Create final folders
for split in ["train", "test"]:
    for cls in CLASSES:
        os.makedirs(os.path.join(FINAL_PATH, split, cls), exist_ok=True)

def copy_images(src_dirs, dst_class, split_ratio=0.8):
    """Copies images from src_dirs into final_dataset/{train,test}/dst_class"""
    all_files = []
    for src in src_dirs:
        if not os.path.exists(src):
            print(f"⚠️ Path not found: {src}")
            continue
        for root, _, files in os.walk(src):
            for f in files:
                if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                    all_files.append(os.path.join(root, f))

    print(f"🔍 Found {len(all_files)} images for {dst_class} from {src_dirs}")

    if len(all_files) == 0:
        print(f"⚠️ No images copied for {dst_class}")
        return

    random.shuffle(all_files)
    split = int(len(all_files) * split_ratio)
    train_files, test_files = all_files[:split], all_files[split:]

    for f in train_files:
        shutil.copy(f, os.path.join(FINAL_PATH, "train", dst_class))
    for f in test_files:
        shutil.copy(f, os.path.join(FINAL_PATH, "test", dst_class))

    print(f"✅ {dst_class}: {len(train_files)} train, {len(test_files)} test")

# -------- Mapping your datasets -------- #

# Skin rash → acne, bags, redness
copy_images([
    os.path.join(RAW_PATH, "skin_dataset", "acne"),
    os.path.join(RAW_PATH, "skin_dataset", "bags"),
    os.path.join(RAW_PATH, "skin_dataset", "redness")
], "skin_rash")

# Eye redness → pick only uveitis (red eye)
copy_images([
    os.path.join(RAW_PATH, "eye_dataset", "Uveitis")
], "eye_redness")

# Nail discoloration → train + validation
copy_images([
    os.path.join(RAW_PATH, "nail_dataset", "train"),
    os.path.join(RAW_PATH, "nail_dataset", "validation")
], "nail_discoloration")

# Wound → train_images + test_images
copy_images([
    os.path.join(RAW_PATH, "wound_dataset", "train_images"),
    os.path.join(RAW_PATH, "wound_dataset", "test_images")
], "wound")

print("\n🎉 Dataset restructuring complete! Final dataset is in ../final_dataset")
