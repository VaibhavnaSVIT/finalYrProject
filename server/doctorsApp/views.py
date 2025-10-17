from datetime import datetime
import random
from hashlib import md5
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from db_connections import doctors_collection, doctors_otp_collection, doctors_medical_img_info
import bcrypt, jwt
from rest_framework.exceptions import AuthenticationFailed

from rest_framework_simplejwt.tokens import RefreshToken
from mailjetMailSender import send_email
import os
from django.conf import settings

def get_tokens_for_doctor(doctor_data):
    refresh = RefreshToken.for_user(doctor_data)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    }

def handle_uploaded_file(file, folder, filename=None):
    if not filename:
        filename = file.name
    path = os.path.join(settings.MEDIA_ROOT, folder)
    os.makedirs(path, exist_ok=True)
    filepath = os.path.join(path, filename)
    with open(filepath, "wb+") as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    return os.path.join(folder, filename)

@api_view(["POST"])
def upload_doctor_files(request):
    email = request.POST.get("email")
    if not email:
        return Response({"error": "Email is required to upload files"}, status=status.HTTP_400_BAD_REQUEST)

    doctor = doctors_collection.find_one({"personal_info.email": email})
    if not doctor:
        return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

    files = request.FILES
    updated_fields = {}

    profile_photo = files.get("profilePhoto")
    if profile_photo:
        path = handle_uploaded_file(profile_photo, "documents", f"{email}_profile.{profile_photo.name.split('.')[-1]}")
        updated_fields["personal_info.profilePhoto"] = path

    degree_cert = files.get("degree_certificate")
    if degree_cert:
        path = handle_uploaded_file(degree_cert, "documents", f"{email}_degree.{degree_cert.name.split('.')[-1]}")
        updated_fields["verification_info.documents.degree_certificate"] = path

    med_license = files.get("medical_license")
    if med_license:
        path = handle_uploaded_file(med_license, "documents", f"{email}_license.{med_license.name.split('.')[-1]}")
        updated_fields["verification_info.documents.medical_license"] = path

    if updated_fields:
        doctors_collection.update_one({"personal_info.email": email}, {"$set": updated_fields})
        return Response({"message": "Files uploaded successfully"}, status=status.HTTP_200_OK)

    return Response({"error": "No files found in request"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def send_doctor_otp(request):
    email = request.data.get("email")
    print("email got: ", email)

    if not email:
        return Response({"error": "Email is required to send OTP"}, status=status.HTTP_400_BAD_REQUEST)

    if doctors_collection.find_one({"personal_info.email": email}):
        print("email already exists")
        return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

    otp = str(random.randint(100000, 999999))
    doctors_otp_collection.update_one({"email": email}, {"$set": {"otp": otp}}, upsert=True)

    subject = "Your OTP for Doctor Registration"
    message = f"Your OTP is: {otp}"

    status_code, response = send_email(email, subject, message)
    if status_code == 200:
        return Response({"message": f"OTP sent to {email} successfully"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Failed to send OTP email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def register_doctor(request):
    try:
        data = request.data

        personal_info = data.get("personal_info", {})
        professional_info = data.get("professional_info", {})
        verification_info = data.get("verification_info", {})

        email = personal_info.get("email")
        password = data.get("password")
        confirm_password = data.get("confirm_password")
        user_otp = data.get("enter_OTP")

        print(f"emaiL: {email}, password: {password}, conf_pass: {confirm_password}, otp: {user_otp}")
        if not all([email, password, confirm_password, user_otp]):
            print("email, password, confirm_password, user_otp maybe missing")
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            print("Passwords do not match")
            return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        if doctors_collection.find_one({"personal_info.email": email}):
            print("Email already registered")
            return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

        stored_otp_data = doctors_otp_collection.find_one({"email": email})
        if not stored_otp_data or stored_otp_data["otp"] != user_otp:
            print("Invalid or expired OTP")
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

        verification_info["admin_approval_status"] = "pending"

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        full_data = {
            "user_type": "doctor",
            "personal_info": personal_info,
            "professional_info": professional_info,
            "verification_info": verification_info,
            "password": hashed_password.decode('utf-8'),
            "created_at": datetime.utcnow(),
            "no_of_patients": 0
        }

        print("inserted data to db")
        result = doctors_collection.insert_one(full_data)
        doctors_collection.update_one(
            {"_id": result.inserted_id},
            {"$set": {"doctor_id": str(result.inserted_id)}}
        )
        doctors_otp_collection.delete_one({"email": email})

        return Response({"success": True, "message": "Registration successful"}, status=status.HTTP_201_CREATED)

    except Exception as e:
        print("Exception occurred during doctor registration:", str(e))
        return Response({"error": "Something went wrong. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def doctor_login(request):
    data = request.data
    email = data.get("email")
    password = data.get("password")

    doctor = doctors_collection.find_one({"personal_info.email": email})
    if not doctor:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    if not bcrypt.checkpw(password.encode('utf-8'), doctor["password"].encode('utf-8')):
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    custom_doctor = CustomUser(doctor)
    tokens = get_tokens_for_doctor(custom_doctor)

    return Response({"message": "Login successful", "tokens": tokens}, status=status.HTTP_200_OK)

class CustomUser:
    def __init__(self, doctor_data):
        self.id = str(doctor_data["_id"])
        self.email = doctor_data["personal_info"]["email"]

@api_view(["GET"])
def doctor_dashboard(request):
    token = request.headers.get("Authorization")
    if not token:
        print("Token missing")
        raise AuthenticationFailed('Token missing')
    
    try:
        token = token.split(" ")[1]
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        doctor_id = decoded_token.get('user_id')

        if not doctor_id:
            print("No doctor ID found in token")
            raise AuthenticationFailed('Doctor ID not found in token')
        
        doctor = doctors_collection.find_one({"doctor_id": doctor_id})
        if not doctor:
            print("Doctor not found")
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

        personal_info = doctor.get("personal_info", {})
        
        doctor_dashboard_data = {
            "name": personal_info.get("fullName"),
            "email": personal_info.get("email"),
        }

        return Response(doctor_dashboard_data, status=status.HTTP_200_OK)

    except jwt.ExpiredSignatureError:
        return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.DecodeError:
        return Response({"error": "Token is invalid"}, status=status.HTTP_401_UNAUTHORIZED)
    except AuthenticationFailed as auth_err:
        return Response({"error": str(auth_err)}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as err:
        print(f"Unexpected error: {err}")
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_medical_image(request):
    import os
    import numpy as np
    from tensorflow.keras.models import load_model
    from tensorflow.keras.preprocessing import image
    from io import BytesIO
    from PIL import Image

    DOMAIN_MODEL_PATH = "../clg_ml/domain_classifier_best.h5"
    ORAL_MODEL_PATH = "../clg_ml/oral_disorder_model.h5"
    SKIN_MODEL_PATH = "../clg_ml/skin_diseases_model.h5"
    IMG_SIZE = (224, 224)

    oral_classes = ['hypodontia', 'mouth_ulcers']
    skin_classes = ['benign keratosis like lesion', 'eczema']
    domain_classes = ['oral_disorder', 'skin_disease']

    def preprocess_image_from_file(file):
        img = Image.open(file).convert("RGB")
        img = img.resize(IMG_SIZE)
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0
        return img_array

    file = request.FILES.get("images")
    token = request.headers.get("Authorization")

    if not token:
        raise AuthenticationFailed("Token missing")
    if not file:
        return Response({"error": "No file uploaded under 'images' key"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = token.split(" ")[1]
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        doctor_id = decoded_token.get("user_id")
        doctor = doctors_collection.find_one({"doctor_id": doctor_id})
        if not doctor:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)
        doctor_email = doctor.get("personal_info", {}).get("email")

        file_content = file.read()
        file_hash = md5(file_content).hexdigest()
        existing = doctors_medical_img_info.find_one({
            "doctor_id": doctor_id,
            "file_hash": file_hash
        })
        if existing:
            return Response({"error": "Duplicate image already uploaded."}, status=status.HTTP_409_CONFLICT)

        img_stream = BytesIO(file_content)
        img_array = preprocess_image_from_file(img_stream)

        domain_model = load_model(DOMAIN_MODEL_PATH)
        domain_preds = domain_model.predict(img_array)[0]
        domain_idx = np.argmax(domain_preds)
        domain = domain_classes[domain_idx]
        domain_confidence = float(domain_preds[domain_idx] * 100)

        if domain == "oral_disorder":
            model = load_model(ORAL_MODEL_PATH)
            label_classes = oral_classes
        else:
            model = load_model(SKIN_MODEL_PATH)
            label_classes = skin_classes

        disease_preds = model.predict(img_array)[0]
        disease_idx = np.argmax(disease_preds)
        prediction = label_classes[disease_idx]
        confidence = float(disease_preds[disease_idx] * 100)

        doctors_medical_img_info.insert_one({
            "doctor_id": doctor_id,
            "doctor_email": doctor_email,
            "file_name": file.name,
            "file_hash": file_hash,
            "content_type": file.content_type,
            "file_data": file_content,
            "uploaded_at": datetime.utcnow(),
            "prediction": prediction,
            "confidence": confidence,
            "domain": domain,
            "domain_confidence": domain_confidence,
            "doctor_feedback": None,
        })

        return Response({
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "file_name": file.name,
            "domain": domain,
            "domain_confidence": round(domain_confidence, 2)
        }, status=status.HTTP_200_OK)

    except jwt.ExpiredSignatureError:
        return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print("Upload failed:", str(e))
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def wrong_image_feedback(request):
    file = request.FILES.get("image")
    domain = request.data.get("domain")
    domain_specific = request.data.get("domain_specific")

    if not file:
        return Response({"error": "Image file is required."}, status=status.HTTP_400_BAD_REQUEST)
    if domain not in ["skin_diseases", "oral_disorder"]:
        return Response({"error": "Invalid or missing domain."}, status=status.HTTP_400_BAD_REQUEST)
    if domain == "skin_diseases" and domain_specific not in ["benign_keratosis_like_lesions", "eczema"]:
        return Response({"error": "Invalid domain_specific for skin_diseases."}, status=status.HTTP_400_BAD_REQUEST)
    if domain == "oral_disorder" and domain_specific not in ["hypodontia", "mouth_ulcer"]:
        return Response({"error": "Invalid domain_specific for oral_disorder."}, status=status.HTTP_400_BAD_REQUEST)

    RETRAIN_DIR = '../clg_ml/domain_classification/retrain'
    base_retrain_dir = os.path.abspath(RETRAIN_DIR)

    if not os.path.exists(base_retrain_dir):
        os.makedirs(base_retrain_dir)

    domain_dir = os.path.join(base_retrain_dir, domain)
    if not os.path.exists(domain_dir):
        os.makedirs(domain_dir)

    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
    filename = f"{timestamp}_{file.name}"
    file_path = os.path.join(domain_dir, filename)

    try:
        with open(file_path, "wb+") as destination:
            for chunk in file.chunks():
                destination.write(chunk)
    except Exception as e:
        return Response({"error": f"Failed to save file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        file.seek(0)
        file_bytes = file.read()
        file_hash = md5(file_bytes).hexdigest()

        update_result = doctors_medical_img_info.update_one(
            {"file_hash": file_hash},
            {
                "$set": {
                    "doctor_feedback": {
                        "corrected_domain": domain,
                        "corrected_domain_specific": domain_specific,
                        "feedback_at": datetime.utcnow()
                    }
                }
            }
        )

        if update_result.modified_count == 0:
            return Response({
                "warning": "Image saved but matching document not found for feedback update."
            }, status=status.HTTP_202_ACCEPTED)

        return Response({
            "message": "Feedback saved and image added to retraining set.",
            "saved_path": file_path,
            "domain": domain,
            "domain_specific": domain_specific
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": f"Internal error while updating feedback: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)