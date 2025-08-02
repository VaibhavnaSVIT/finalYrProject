from datetime import datetime
import random
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework import status
from db_connections import patient_collection, patient_otp_collection, patient_medical_info
import bcrypt
from rest_framework_simplejwt.authentication import JWTAuthentication
from mailjetMailSender import send_email
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

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
    email = data.get("email")
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
    email = data.get("email")
    user_otp = data.get("otp")

    stored_otp = patient_otp_collection.find_one({"email": email})

    if not stored_otp or stored_otp["otp"] != user_otp:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    patient_data = stored_otp["patient_data"]
    patient_data["created_at"] = datetime.utcnow()
    patient_data['user_type'] = "patient"
    patient_data['approval_status'] = "pending"

    patient_collection.insert_one(patient_data)

    patient_otp_collection.delete_one({"email": email})

    return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_patient_medical_info(request):
    data = request.data
    user = request.user
    email = user.email

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
    email = data.get("email")
    password = data.get("password")

    patient = patient_collection.find_one({"email": email})
    if not patient:
        return Response({"error": "Email Not found"}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not bcrypt.checkpw(password.encode('utf-8'), patient["password"].encode('utf-8')):
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    
    otp = str(random.randint(100000, 999999))
    patient_otp_collection.update_one(
        {"email": email},
        {"$set": {"otp": otp, "patient_id": str(patient["_id"])}},
        upsert=True,
    )

    subject = "Your OTP for Patient Login"
    message = f"Your OTP is: {otp}"

    status_code, response = send_email(email, subject, message)
    
    if status_code == 200:
        return Response({"message": f"OTP sent: {otp} (for testing)"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Failed to send OTP email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CustomUser:
    def __init__(self, user_data):
        self.id = str(user_data["_id"])
        self.email = user_data["email"]

@api_view(["POST"])
def verify_login_otp(request):
    data = request.data
    email = data.get("email")
    user_otp = data.get("otp")
    print("user_otp: ", user_otp, "typr: ", type(user_otp))

    stored_otp = patient_otp_collection.find_one({"email": email})
    print("stored_otp: ", stored_otp)

    if not stored_otp or stored_otp["otp"] != user_otp:
        print("type of stored OTp: ", type(stored_otp["otp"]))
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
    
    patient = patient_collection.find_one({"email": email})

    if not patient:
        return Response({"error": "Patient Not Found"}, status=status.HTTP_404_NOT_FOUND)

    patient_otp_collection.delete_one({"email": email})
    custom_user = CustomUser(patient)
    tokens = get_tokens_for_user(custom_user)

    return Response({"message": "Login successful", "tokens": tokens}, status=status.HTTP_200_OK)