from datetime import datetime
from bson import ObjectId
import random, jwt
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from db_connections import patient_collection, patient_otp_collection, patient_medical_info
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
    name = data.get("name")
    gender = data.get("gender")
    dob = data.get("dob")
    email = str(data.get("email")).strip().lower()
    phone = data.get("phone")
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
    patient_data['approval_status'] = "pending"

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
    user = request.user
    email = str(user.email).strip().lower()

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
    print("in dashboard function")
    token = request.headers.get('Authorization')
    print("token at patient dashboard: ", token)
    if not token:
        print("token missing")
        raise AuthenticationFailed('Token missing')

    try:
        token = token.split(" ")[1]
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        print("decoded_token = ", decoded_token)
        patient_id = decoded_token.get('user_id')
        
        if not patient_id:
            print("no patient ID found")
            raise AuthenticationFailed('Patient ID not found in token')
        
        patient = patient_collection.find_one({"patient_id": patient_id})
        
        if not patient:
            print("patient not found")
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        # medical_records = list(patient_medical_info.find({"patient_id": str(patient["_id"])}))
        medical_records = None
        dashboard_data = {
            "name": patient.get("name"),
            "gender": patient.get("gender"),
            "dob": patient.get("dob"),
            "email": patient.get("email"),
            "phone": patient.get("phone"),
            "approval_status": patient.get("approval_status", "pending"),
            "medical_info": medical_records,
        }

        return Response(dashboard_data, status=status.HTTP_200_OK)

    except jwt.ExpiredSignatureError:
        print("token has expired")
        return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.DecodeError:
        print("token is invalid")
        return Response({"error": "Token is invalid"}, status=status.HTTP_401_UNAUTHORIZED)
    except AuthenticationFailed as auth_err:
        print("the error is: ",str(auth_err))
        return Response({"error": str(auth_err)}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as err:
        print("error is : ", err)
        return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_medical_image(request):
    user = request.user
    email = str(user.email).strip().lower()
    file = request.FILES["image"]

    record = {
        "patient_email": email,
        "file_name": file.name,
        "uploaded_at": datetime.utcnow(),
        "status": "processing",
        "analysis_type": "image"
    }
    patient_medical_info.insert_one(record)
     # todo: send file to ML service for CNN analysis
    return Response({"message": "Image uploaded successfully"}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def symptom_assessment(request):
    user = request.user
    email = user.email
    symptoms = request.data.get("symptoms", [])

    # todo: call ML service for prediction
    diagnosis = "Flu"
    recommendation = "Consult a doctor, drink fluids, rest"

    record = {
        "patient_email": email,
        "created_at": datetime.utcnow(),
        "symptoms": symptoms,
        "diagnosis": diagnosis,
        "recommendation": recommendation,
        "analysis_type": "symptom"
    }
    patient_medical_info.insert_one(record)

    return Response(record, status=status.HTTP_200_OK)

@api_view(["GET"])
def get_results(request):
    user = request.user
    email = user.email

    results = list(patient_medical_info.find(
        {"patient_email": email},
        {"_id": 0}
    ))

    return Response({"results": results}, status=status.HTTP_200_OK)