import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
from torchvision import datasets, models
import os

# ==========================
# Config (auto-detect paths)
# ==========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # folder where train_model.py is
DATA_DIR = os.path.join(BASE_DIR, "final_dataset")     # dataset folder in same place
print("📂 Using dataset path:", DATA_DIR)

NUM_CLASSES = 4  # skin_rash, eye_redness, nail_discoloration, wound
BATCH_SIZE = 32
NUM_EPOCHS = 10   # set to 2 for quick test, 10+ for real training
LEARNING_RATE = 0.001
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("💻 Training on:", DEVICE)

# ==========================
# Data Transforms
# ==========================
transform = {
    "train": transforms.Compose([
        transforms.Resize((224,224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ]),
    "test": transforms.Compose([
        transforms.Resize((224,224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])
}

# ==========================
# Load Dataset
# ==========================
train_dataset = datasets.ImageFolder(os.path.join(DATA_DIR, "train"), transform=transform["train"])
test_dataset = datasets.ImageFolder(os.path.join(DATA_DIR, "test"), transform=transform["test"])

train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)

class_names = train_dataset.classes
print("📂 Classes found:", class_names)

# ==========================
# Model (ResNet18)
# ==========================
model = models.resnet18(pretrained=True)
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, NUM_CLASSES)
model = model.to(DEVICE)

# ==========================
# Loss & Optimizer
# ==========================
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

# ==========================
# Training Loop
# ==========================
print("\n🚀 Starting Training...")
for epoch in range(NUM_EPOCHS):
    model.train()
    running_loss = 0.0
    correct, total = 0, 0
    
    for images, labels in train_loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
    
    train_acc = 100 * correct / total
    print(f"Epoch [{epoch+1}/{NUM_EPOCHS}] "
          f"Loss: {running_loss/len(train_loader):.4f}, "
          f"Train Acc: {train_acc:.2f}%")

# ==========================
# Evaluation
# ==========================
print("\n🧪 Evaluating on test set...")
model.eval()
correct, total = 0, 0
with torch.no_grad():
    for images, labels in test_loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        outputs = model(images)
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

print(f"✅ Test Accuracy: {100 * correct / total:.2f}%")

# ==========================
# Save Model
# ==========================
MODEL_PATH = os.path.join(BASE_DIR, "disease_classifier.pth")
torch.save(model.state_dict(), MODEL_PATH)
print(f"💾 Model saved as {MODEL_PATH}")
