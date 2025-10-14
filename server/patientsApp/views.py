from datetime import datetime
from hashlib import md5
import random, jwt
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from db_connections import patient_collection, patient_otp_collection, patient_medical_info, patient_medical_img_info
import bcrypt
from mailjetMailSender import send_email
from rest_framework_simplejwt.tokens import RefreshToken

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    }

@api_view(["POST"])
def register_patient(request):
    data = request.data
    email = str(data.get("email")).strip().lower()
    password = data.get("password")

    if patient_collection.find_one({"email": email}):
        return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    data["password"] = hashed_password.decode('utf-8')

    otp = str(random.randint(100000, 999999))
    patient_otp_collection.update_one(
        {"email": email},
        {"$set": {"otp": otp, "patient_data": data}}, 
        upsert=True
    )
    subject = "Your OTP for Patient Registration"
    message = f"Your OTP is: {otp}"

    status_code, response = send_email(email, subject, message)
    if status_code == 200:
        return Response({"message": f"OTP sent successfully: {otp} (for testing)"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Failed to send OTP email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["POST"])
def verify_otp(request):
    data = request.data
    email = str(data.get("email")).strip().lower()
    user_otp = data.get("otp")

    stored_otp = patient_otp_collection.find_one({"email": email})

    if not stored_otp or stored_otp["otp"] != user_otp:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    patient_data = stored_otp["patient_data"]
    patient_data["created_at"] = datetime.utcnow()
    patient_data['user_type'] = "patient"
    patient_data['admin_approval_status'] = "pending"

    result = patient_collection.insert_one(patient_data)
    patient_collection.update_one(
    {"_id": result.inserted_id},
    {"$set": {"patient_id": str(result.inserted_id)}}
)
    patient_otp_collection.delete_one({"email": email})

    return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)

@api_view(["POST"])
def add_patient_medical_info(request):
    print("in add_patient_medical_info")
    data = request.data
    email = str(data.email).strip().lower()

    patient = patient_collection.find_one({"email": email})
    if not patient:
        return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

    data["patient_id"] = str(patient["_id"])
    data["created_at"] = datetime.utcnow()
    
    patient_medical_info.insert_one(data)

    return Response({"message": "Medical information added successfully"}, status=status.HTTP_201_CREATED)

@api_view(["POST"])
def patient_login(request):
    data = request.data
    email = str(data.get("email")).strip().lower()
    password = data.get("password")

    patient = patient_collection.find_one({"email": email})
    if not patient:
        return Response({"error": "Email Not found"}, status=status.HTTP_401_UNAUTHORIZED)
   
    if not bcrypt.checkpw(password.encode('utf-8'), patient["password"].encode('utf-8')):
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    custom_user = CustomUser(patient)
    tokens = get_tokens_for_user(custom_user)

    return Response({"message": "Login successful", "tokens": tokens}, status=status.HTTP_200_OK)

class CustomUser:
    def __init__(self, user_data):
        self.id = str(user_data["_id"])
        self.email = user_data["email"]

@api_view(["GET"])
def patient_dashboard(request):
    token = request.headers.get('Authorization')
    if not token:
        print("token missing")
        raise AuthenticationFailed('Token missing')

    try:
        token = token.split(" ")[1]
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        patient_id = decoded_token.get('user_id')
        
        if not patient_id:
            print("no patient ID found")
            raise AuthenticationFailed('Patient ID not found in token')
        
        patient = patient_collection.find_one({"patient_id": patient_id})
        
        if not patient:
            print("patient not found")
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)
        
        medical_records = None
        dashboard_data = {
            "name": patient.get("name"),
            "gender": patient.get("gender"),
            "dob": patient.get("dob"),
            "email": patient.get("email"),
            "phone": patient.get("phone"),
            "doc_verification_status": patient.get("doc_verification_status", "pending"),
            "medical_info": medical_records,
        }

        return Response(dashboard_data, status=status.HTTP_200_OK)

    except jwt.ExpiredSignatureError:
        return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.DecodeError:
        return Response({"error": "Token is invalid"}, status=status.HTTP_401_UNAUTHORIZED)
    except AuthenticationFailed as auth_err:
        return Response({"error": str(auth_err)}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as err:
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

    DOMAIN_MODEL_PATH = "/home/vaibhav/Documents/actualProjects/majorProject/clg_ml/domain_classifier_best.h5"
    ORAL_MODEL_PATH = "/home/vaibhav/Documents/actualProjects/majorProject/clg_ml/oral_disorder_model.h5"
    SKIN_MODEL_PATH = "/home/vaibhav/Documents/actualProjects/majorProject/clg_ml/skin_diseases_model.h5"
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

    data = request.data
    file = request.FILES.get("images")
    token = request.headers.get('Authorization')

    if not token:
        raise AuthenticationFailed('Token missing')

    if not file:
        return Response({"error": "No file uploaded under 'images' key"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = token.split(" ")[1]
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        patient_id = decoded_token.get('user_id')
        email = patient_collection.find_one({"patient_id": patient_id}).get("email")

        file_content = file.read()
        file_hash = md5(file_content).hexdigest()

        existing = patient_medical_img_info.find_one({
            "patient_id": patient_id,
            "file_hash": file_hash
        })

        if existing:
            return Response({"error": "Duplicate image already uploaded."}, status=status.HTTP_409_CONFLICT)

        record = {
            "patient_email": email,
            "file_name": file.name,
            "content_type": file.content_type,
            "file_data": file_content,
            "file_hash": file_hash,
            "uploaded_at": datetime.utcnow(),
            "doc_verification_status": "pending",
            "analysis_type": "image",
            "patient_id": patient_id,
        }

        insert_result = patient_medical_img_info.insert_one(record)
        patient_medical_img_info.update_one(
            {"_id": insert_result.inserted_id},
            {"$set": {"patient_medical_img_id": str(insert_result.inserted_id)}}
        )

        file_io = BytesIO(file_content)
        img_array = preprocess_image_from_file(file_io)

        domain_model = load_model(DOMAIN_MODEL_PATH, compile=False)
        domain_preds = domain_model.predict(img_array, verbose=0)[0]
        domain_index = np.argmax(domain_preds)
        domain_label = domain_classes[domain_index]
        domain_confidence = domain_preds[domain_index] * 100

        if domain_label == 'oral_disorder':
            model = load_model(ORAL_MODEL_PATH, compile=False)
            classes = oral_classes
        else:
            model = load_model(SKIN_MODEL_PATH, compile=False)
            classes = skin_classes

        preds = model.predict(img_array, verbose=0)[0]
        pred_index = np.argmax(preds)
        pred_label = classes[pred_index]
        pred_conf = preds[pred_index] * 100

        result = {
            "message": "Image uploaded and classified successfully",
            "domain_classification": {
                "predicted_domain": domain_label,
                "confidence": f"{domain_confidence:.2f}%"
            },
            "final_prediction": {
                "label": pred_label,
                "confidence": f"{pred_conf:.2f}%"
            }
        }

        return Response(result, status=status.HTTP_201_CREATED)

    except jwt.ExpiredSignatureError:
        return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print("Upload failed:", str(e))
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def symptom_assessment(request):
    try:
        token = request.headers.get("Authorization", "").split(" ")[1]
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        patient_id = decoded_token.get("user_id")
        email = patient_collection.find_one({"patient_id": patient_id}).get("email")
        data = request.data
        patient_info = data.get("patient")
        symptoms = data.get("symptoms")

        if not symptoms or not isinstance(symptoms, list) or not patient_info:
            return Response({"error": "Invalid or missing data."}, status=status.HTTP_400_BAD_REQUEST)

        record = {
            "patient_id": patient_id,
            "patient_email": email,
            "patient_info": patient_info,
            "symptoms": symptoms,
            "submitted_at": datetime.utcnow(),
            "doc_verification_status": "pending"
        }

        insert_result = patient_medical_info.insert_one(record)

        patient_medical_info.update_one(
            {"_id": insert_result.inserted_id},
            {"$set": {"patient_symptoms_id": str(insert_result.inserted_id)}}
        )

        return Response({"message": "Assessment submitted successfully."}, status=status.HTTP_201_CREATED)

    except jwt.ExpiredSignatureError:
        return Response({"error": "Token expired."}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET"])
def get_results(request):
    data = request.data
    email = str(data.get("email")).strip().lower()

    results = list(patient_medical_info.find(
        {"patient_email": email},
        {"_id": 0}
    ))

    return Response({"results": results}, status=status.HTTP_200_OK)

@api_view(["GET"])
def patient_medical_history(request):
    token = request.headers.get("Authorization", "").split(" ")[1]
    decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    patient_id = decoded_token.get("user_id")


    total_images = patient_medical_img_info.count_documents({"patient_id": patient_id})
    pending_images = patient_medical_img_info.count_documents({"patient_id": patient_id, "status": "pending"})
    approved_images = patient_medical_img_info.count_documents({"patient_id": patient_id, "status": "approved"})
    rejected_images = patient_medical_img_info.count_documents({"patient_id": patient_id, "status": "rejected"})

    total_symptoms = patient_medical_info.count_documents({"patient_id": patient_id})
    pending_symptoms = patient_medical_info.count_documents({"patient_id": patient_id, "status": "pending"})
    approved_symptoms = patient_medical_info.count_documents({"patient_id": patient_id, "status": "approved"})
    rejected_symptoms = patient_medical_info.count_documents({"patient_id": patient_id, "status": "rejected"})

    total_records = total_images + total_symptoms
    pending_records = pending_images + pending_symptoms
    approved_records = approved_images + approved_symptoms
    rejected_records = rejected_images + rejected_symptoms

    return Response(
        {
            "total_records": total_records,
            "pending": pending_records,
            "approved": approved_records,
            "rejected": rejected_records,
        },
        status=status.HTTP_200_OK
    )