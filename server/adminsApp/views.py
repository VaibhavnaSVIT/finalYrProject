from datetime import datetime
import random, os
import bcrypt
from dotenv import load_dotenv
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from db_connections import admin_collection, admin_otp_collection
from mailjetMailSender import send_email
from django.conf import settings

load_dotenv()

def get_tokens_for_admin(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    }

@api_view(["POST"])
def register_admin(request):
    data = request.data
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    print("data receiverd: ", username, email, password)

    if email not in settings.ALLOWED_ADMIN_EMAILS:
        print("email not found: ", email)
        return Response({"error": "This email is not authorized to register as an admin."}, status=status.HTTP_403_FORBIDDEN)

    if admin_collection.find_one({"email": email}):
        return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    data["password"] = hashed_password.decode('utf-8')

    otp = str(random.randint(100000, 999999))
    admin_otp_collection.update_one(
        {"email": email},
        {"$set": {"otp": otp, "admin_data": data}},
        upsert=True
    )

    subject = "Your OTP for Admin Registration"
    message = f"Your OTP is: {otp}"
    status_code, response = send_email(email, subject, message)

    if status_code == 200:
        return Response({"message": f"OTP sent successfully: {otp} (for testing)"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Failed to send OTP email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def verify_admin_otp(request):
    data = request.data
    email = data.get("email")
    user_otp = data.get("otp")

    stored_otp = admin_otp_collection.find_one({"email": email})

    if not stored_otp or stored_otp["otp"] != user_otp:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    admin_data = stored_otp["admin_data"]
    admin_data["created_at"] = datetime.utcnow()
    admin_data["user_type"] = "admin"

    admin_collection.insert_one(admin_data)
    admin_otp_collection.delete_one({"email": email})

    return Response({"message": "Admin registration successful"}, status=status.HTTP_201_CREATED)

@api_view(["POST"])
def admin_login(request):
    data = request.data
    email = data.get("email")
    password = data.get("password")

    admin = admin_collection.find_one({"email": email})
    if not admin:
        return Response({"error": "Email not found"}, status=status.HTTP_401_UNAUTHORIZED)

    if not bcrypt.checkpw(password.encode('utf-8'), admin["password"].encode('utf-8')):
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    otp = str(random.randint(100000, 999999))
    admin_otp_collection.update_one(
        {"email": email},
        {"$set": {"otp": otp, "admin_id": str(admin["_id"])}},
        upsert=True,
    )

    subject = "Your OTP for Admin Login"
    message = f"Your OTP is: {otp}"

    status_code, response = send_email(email, subject, message)
    if status_code == 200:
        return Response({"message": f"OTP sent: {otp} (for testing)"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Failed to send OTP email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CustomAdmin:
    def __init__(self, user_data):
        self.id = str(user_data["_id"])
        self.email = user_data["email"]

@api_view(["POST"])
def verify_admin_login_otp(request):
    data = request.data
    email = data.get("email")
    user_otp = data.get("otp")

    stored_otp = admin_otp_collection.find_one({"email": email})

    if not stored_otp or stored_otp["otp"] != user_otp:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    admin = admin_collection.find_one({"email": email})
    if not admin:
        return Response({"error": "Admin not found"}, status=status.HTTP_404_NOT_FOUND)

    admin_otp_collection.delete_one({"email": email})
    custom_admin = CustomAdmin(admin)
    tokens = get_tokens_for_admin(custom_admin)

    return Response({"message": "Login successful", "tokens": tokens}, status=status.HTTP_200_OK)
