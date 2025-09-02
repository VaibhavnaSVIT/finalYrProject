import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os

# ==========================
# Paths
# ==========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "disease_classifier.pth")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ==========================
# Classes & Prescriptions
# ==========================
class_names = ["eye_redness", "nail_discoloration", "skin_rash", "wound"]

prescriptions = {
    "skin_rash": "Apply calamine lotion, avoid allergens. Consult dermatologist if persists.",
    "eye_redness": "Use lubricating eye drops. Avoid rubbing eyes. See doctor if pain or blurred vision.",
    "nail_discoloration": "Possible fungal infection. Use antifungal cream. Keep nails clean and dry.",
    "wound": "Clean with antiseptic, cover with bandage. Seek medical help if deep."
}

# ==========================
# Load Model
# ==========================
model = models.resnet18(pretrained=False)
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, len(class_names))
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model = model.to(DEVICE)
model.eval()

# ==========================
# Image Transform
# ==========================
transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ==========================
# Prediction Function
# ==========================
def predict_image(img_path):
    image = Image.open(img_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(image)
        _, pred = torch.max(outputs, 1)
        disease = class_names[pred.item()]
        return disease, prescriptions[disease]

# ==========================
# Run Test
# ==========================
if __name__ == "__main__":
    test_img = "test.jpg"  # 🔹 replace with your image file
    if os.path.exists(test_img):
        disease, advice = predict_image(test_img)
        print(f"🩺 Predicted Disease: {disease}")
        print(f"💊 Prescription: {advice}")
    else:
        print("⚠️ test.jpg not found. Place an image in this folder and rename it to test.jpg")
