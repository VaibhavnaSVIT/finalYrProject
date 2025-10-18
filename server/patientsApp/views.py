from datetime import datetime
from hashlib import md5
import random, jwt
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from db_connections import patient_collection, patient_otp_collection, patient_medical_info, patient_medical_img_info, doctors_collection, doctor_requests
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

    data = request.data
    file = request.FILES.get("images")
    selected_doctor_id = request.data.get("selected_doctor")
    doctor_doc = doctors_collection.find_one({"doctor_id": selected_doctor_id})
    selected_doctor_name = doctor_doc.get("personal_info", {}).get("fullName") if doctor_doc else None
    token = request.headers.get('Authorization')

    if not token:
        raise AuthenticationFailed('Token missing')

    if not file:
        return Response({"error": "No file uploaded under 'images' key"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'patient_uploads')
        os.makedirs(upload_dir, exist_ok=True)

        file_content = file.read()
        file_path = os.path.join(upload_dir, file.name)
        with open(file_path, 'wb') as f:
            f.write(file_content)
        token = token.split(" ")[1]
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        patient_id = decoded_token.get('user_id')
        email = patient_collection.find_one({"patient_id": patient_id}).get("email")
        patient_name = patient_collection.find_one({"patient_id": patient_id}).get("name")
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
            "file_hash": file_hash,
            "uploaded_at": datetime.utcnow(),
            "doc_verification_status": "pending",
            "analysis_type": "image",
            "patient_id": patient_id,
            "selected_doctor_name": selected_doctor_name,
            "selected_doctor_id": selected_doctor_id
        }

        insert_result = patient_medical_img_info.insert_one(record)
        patient_medical_img_info.update_one(
            {"_id": insert_result.inserted_id},
            {"$set": {"patient_medical_img_id": str(insert_result.inserted_id)}}
        )
        patient_medical_img_id = str(insert_result.inserted_id)

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

        model_prediction = {
            "predicted_domain": domain_label,
            "domain_confidence": float(f"{domain_confidence:.2f}"),
            "final_label": pred_label,
            "prediction_confidence": float(f"{pred_conf:.2f}")
        }

        patient_medical_img_info.update_one(
            {"_id": insert_result.inserted_id},
            {
                "$set": {
                    "model_prediction": model_prediction,
                    "doctor_recommendation": None
                }
            }
        )

        if doctor_doc:
            doctor_requests.insert_one({
                "patient_name": patient_name,
                "patient_id": patient_id,
                "doctor_name": selected_doctor_name,
                "doctor_id": selected_doctor_id,
                "submitted_at": datetime.utcnow(),
                "file_name": file.name,
                "content_type": file.content_type,
                "file_data": file_content,
                "file_hash": file_hash,
                "status": "pending",
                "type": "image",
                "patient_medical_img_id": patient_medical_img_id
            })

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

@api_view(["GET"])
def get_image_classifications(request):
    try:
        token = request.headers.get('Authorization')

        if not token:
            raise AuthenticationFailed('Token missing')
        token = token.split(" ")[1]
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        patient_id = decoded_token.get('user_id')

        medication_map = {
            "eczema": "Topical corticosteroids and moisturizers (e.g., Hydrocortisone cream, CeraVe).",
            "benign keratosis like lesion": "Cryotherapy or salicylic acid for removal; monitor regularly.",
            "mouth ulcers": "Topical benzocaine gel and vitamin B12 supplements.",
            "hypodontia": "Dental prosthetics consultation; temporary use of dental wax for comfort.",
        }

        records = patient_medical_img_info.find({"patient_id": patient_id})
        data = []
        for record in records:
            label = record.get("model_prediction", {}).get("final_label", "")
            confidence = record.get("model_prediction", {}).get("prediction_confidence", "")

            medication = medication_map.get(label.lower(), "Low confidence on image, consult your doctor for appropriate treatment.")

            data.append({
                "file_name": record.get("file_name"),
                "prediction": label,
                "confidence": confidence,
                "hardcode_medication": medication,
                "doctor_name": record.get("selected_doctor_name"),
                "doctor_recommendation": record.get("doctor_recommendation", None),
                "img_uploaded": record.get("uploaded_at").date().isoformat() if record.get("uploaded_at") else None

            })
        return Response({"classifications": data})
    
    except jwt.ExpiredSignatureError:
        return Response({"error": "Token expired."}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def symptom_assessment(request):
    import joblib
    import pandas as pd
    import numpy as np
    try:
        token = request.headers.get("Authorization", "").split(" ")[1]
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        patient_id = decoded_token.get("user_id")
        patient_name = patient_collection.find_one({"patient_id": patient_id}).get("name")
        data = request.data
        email = patient_collection.find_one({"patient_id": patient_id}).get("email")
        selected_doctor_id = data.get("selected_doctor")
        doctor_doc = doctors_collection.find_one({"doctor_id": selected_doctor_id})
        selected_doctor_name = doctor_doc.get("personal_info", {}).get("fullName") if doctor_doc else None
        symptoms = data.get("symptoms")

        if not symptoms or not isinstance(symptoms, list):
            return Response({"error": "Invalid or missing data."}, status=status.HTTP_400_BAD_REQUEST)
        
        MODEL_PATH = '../clg_ml/symptom_based_diseaese_detection/final_rf_model_top30.pkl'
        ENCODER_PATH = '../clg_ml/symptom_based_diseaese_detection/label_encoder.pkl'
        SYMPTOMS_PATH = '../clg_ml/symptom_based_diseaese_detection/selected_symptoms.csv'

        rf_model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)
        selected_symptoms = pd.read_csv(SYMPTOMS_PATH).squeeze().tolist()

        symptom_vector = [1 if symptom in symptoms else 0 for symptom in selected_symptoms]

        probs = rf_model.predict_proba([symptom_vector])[0]
        top_indices = np.argsort(probs)[-3:][::-1]
        top_predictions = [
            {
                "disease": label_encoder.inverse_transform([i])[0],
                "confidence": round(probs[i] * 100, 2)
            }
            for i in top_indices
        ]

        prediction_result = {
            "top_predictions": top_predictions
        }
        record = {
            "patient_id": patient_id,
            "patient_email": email,
            "symptoms": symptoms,
            "submitted_at": datetime.utcnow(),
            "doc_verification_status": "pending",
            "model_prediction": prediction_result,
            "selected_doctor_name": selected_doctor_name,
            "selected_doctor_id": selected_doctor_id,
            "doctor_recommendation": None,
            "analysis_type": "symptoms"
        }

        insert_result = patient_medical_info.insert_one(record)

        patient_medical_info.update_one(
            {"_id": insert_result.inserted_id},
            {"$set": {"patient_symptoms_id": str(insert_result.inserted_id)}}
        )
        patient_symptoms_id = str(insert_result.inserted_id)

        if doctor_doc:
            doctor_requests.insert_one({
                "patient_name": patient_name,
                "patient_id": patient_id,
                "doctor_name": selected_doctor_name,
                "doctor_id": selected_doctor_id,
                "symptoms": symptoms,
                "submitted_at": datetime.utcnow(),
                "top_model_predictions": top_predictions,
                "status": "pending",
                "type": "symptoms",
                "patient_symptoms_id": patient_symptoms_id
            })

        return Response({
            "message": "Assessment submitted successfully.",
            "model_prediction": prediction_result
        }, status=status.HTTP_201_CREATED)

    except jwt.ExpiredSignatureError:
        return Response({"error": "Token expired."}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
def get_symptoms_prediction(request):
    try:
        token = request.headers.get('Authorization')
        if not token:
            raise AuthenticationFailed('Token missing')
        token = token.split(" ")[1]
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        patient_id = decoded_token.get('user_id')
        records = patient_medical_info.find({"patient_id": patient_id})
        data = []

        medication_map = {
            "Fungal infection": [{"name": "Clotrimazole", "purpose": "Antifungal cream"}, {"name": "Fluconazole", "purpose": "Oral antifungal"}],
            "Allergy": [{"name": "Cetirizine", "purpose": "Allergy relief"}, {"name": "Loratadine", "purpose": "Reduce allergic reaction"}],
            "GERD": [{"name": "Omeprazole", "purpose": "Reduce stomach acid"}, {"name": "Ranitidine", "purpose": "Relieve heartburn"}],
            "Chronic cholestasis": [{"name": "Ursodeoxycholic acid", "purpose": "Improve bile flow"}],
            "Drug Reaction": [{"name": "Antihistamines", "purpose": "Counter allergic response"}, {"name": "Topical steroids", "purpose": "Reduce inflammation"}],
            "Peptic ulcer diseae": [{"name": "Pantoprazole", "purpose": "Reduce stomach acid"}, {"name": "Antacids", "purpose": "Neutralize acid"}],
            "AIDS": [{"name": "Antiretroviral Therapy (ART)", "purpose": "Control HIV"}],
            "Diabetes ": [{"name": "Metformin", "purpose": "Control blood sugar"}, {"name": "Insulin", "purpose": "Regulate glucose"}],
            "Gastroenteritis": [{"name": "ORS", "purpose": "Prevent dehydration"}, {"name": "Loperamide", "purpose": "Control diarrhea"}],
            "Bronchial Asthma": [{"name": "Salbutamol", "purpose": "Relieve breathing"}, {"name": "Steroids inhaler", "purpose": "Reduce inflammation"}],
            "Hypertension ": [{"name": "Amlodipine", "purpose": "Lower blood pressure"}, {"name": "Losartan", "purpose": "Relax blood vessels"}],
            "Migraine": [{"name": "Sumatriptan", "purpose": "Relieve migraine"}, {"name": "Ibuprofen", "purpose": "Pain relief"}],
            "Cervical spondylosis": [{"name": "NSAIDs", "purpose": "Reduce pain/inflammation"}, {"name": "Physiotherapy", "purpose": "Muscle strengthening"}],
            "Paralysis (brain hemorrhage)": [{"name": "Blood pressure control meds", "purpose": "Prevent further damage"}, {"name": "Physiotherapy", "purpose": "Rehabilitation"}],
            "Jaundice": [{"name": "Hepatoprotective agents", "purpose": "Liver support"}, {"name": "Glucose & fluids", "purpose": "Hydration"}],
            "Malaria": [{"name": "Chloroquine", "purpose": "Kill malaria parasites"}, {"name": "Paracetamol", "purpose": "Reduce fever"}],
            "Chicken pox": [{"name": "Calamine lotion", "purpose": "Soothe skin"}, {"name": "Acyclovir", "purpose": "Antiviral"}],
            "Dengue": [{"name": "Paracetamol", "purpose": "Fever reduction"}, {"name": "ORS", "purpose": "Prevent dehydration"}],
            "Typhoid": [{"name": "Ciprofloxacin", "purpose": "Antibiotic"}, {"name": "ORS", "purpose": "Hydration"}],
            "hepatitis A": [{"name": "Rest & hydration", "purpose": "Liver recovery"}],
            "Hepatitis B": [{"name": "Antivirals", "purpose": "Reduce liver inflammation"}],
            "Hepatitis C": [{"name": "Direct-acting antivirals", "purpose": "Virus elimination"}],
            "Hepatitis D": [{"name": "Interferon alfa", "purpose": "Reduce viral load"}],
            "Hepatitis E": [{"name": "Supportive care", "purpose": "Liver healing"}],
            "Alcoholic hepatitis": [{"name": "Steroids", "purpose": "Liver inflammation"}, {"name": "Abstinence", "purpose": "Avoid alcohol"}],
            "Tuberculosis": [{"name": "Rifampin + Isoniazid", "purpose": "Kill TB bacteria"}],
            "Common Cold": [{"name": "Paracetamol", "purpose": "Fever"}, {"name": "Decongestants", "purpose": "Clear nose"}],
            "Pneumonia": [{"name": "Azithromycin", "purpose": "Antibiotic"}, {"name": "Cough syrup", "purpose": "Soothe throat"}],
            "Dimorphic hemmorhoids(piles)": [{"name": "Sitz bath", "purpose": "Pain relief"}, {"name": "Topical ointments", "purpose": "Shrink swelling"}],
            "Heart attack": [{"name": "Aspirin", "purpose": "Prevent clot"}, {"name": "Nitroglycerin", "purpose": "Relieve chest pain"}],
            "Varicose veins": [{"name": "Compression stockings", "purpose": "Improve circulation"}, {"name": "Pain relievers", "purpose": "Relieve pain"}],
            "Hypothyroidism": [{"name": "Levothyroxine", "purpose": "Thyroid hormone replacement"}],
            "Hyperthyroidism": [{"name": "Methimazole", "purpose": "Suppress thyroid hormone"}],
            "Hypoglycemia": [{"name": "Glucose tablets", "purpose": "Raise blood sugar"}, {"name": "Sugary snacks", "purpose": "Immediate sugar"}],
            "Osteoarthristis": [{"name": "NSAIDs", "purpose": "Pain relief"}, {"name": "Physiotherapy", "purpose": "Joint mobility"}],
            "Arthritis": [{"name": "DMARDs", "purpose": "Slow disease"}, {"name": "NSAIDs", "purpose": "Pain/inflammation"}],
            "(vertigo) Paroymsal  Positional Vertigo": [{"name": "Meclizine", "purpose": "Reduce dizziness"}, {"name": "Vestibular rehab", "purpose": "Balance training"}],
            "Acne": [{"name": "Benzoyl peroxide", "purpose": "Reduce acne"}, {"name": "Salicylic acid", "purpose": "Clean pores"}],
            "Urinary tract infection": [{"name": "Nitrofurantoin", "purpose": "Kill bacteria"}, {"name": "Cranberry juice", "purpose": "Prevention"}],
            "Psoriasis": [{"name": "Topical corticosteroids", "purpose": "Reduce skin scaling"}, {"name": "Moisturizers", "purpose": "Soothe skin"}],
            "Impetigo": [{"name": "Mupirocin", "purpose": "Topical antibiotic"}, {"name": "Oral antibiotics", "purpose": "Severe cases"}],
        }

        for record in records:
            top_predictions = record.get("model_prediction", {}).get("top_predictions", [])
            top_disease = top_predictions[0]["disease"] if top_predictions else None
            top_confidence = top_predictions[0]["confidence"] if top_predictions else 0


            if top_predictions and top_confidence < 20:
                medications = "Low confidence on symptom prediction, consult your doctor for appropriate treatment."
            else:
                medications = medication_map.get(top_disease, [])
            data.append({
                "symptoms": record.get("symptoms", []),
                "top_predictions": top_predictions,
                "doc_verification_status": record.get("doc_verification_status", "pending"),
                "doctor_name": record.get("selected_doctor_name"),
                "doctor_recommendation": record.get("doctor_recommendation", None),
                "hardcode_medication": medications,
                "submitted_at": record.get("submitted_at").date().isoformat() if record.get("submitted_at") else None
            })
        return Response({"assessments": data}, status=status.HTTP_200_OK)

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
def get_verified_doctors(request):
    doctors = doctors_collection.find(
    {"verification_info.admin_approval_status": "approved"},
    {
        "_id": 0,
        "doctor_id": 1,
        "personal_info.fullName": 1,
    }
    )
    doctor_list = list(doctors)
    return Response({"doctors": doctor_list}, status=status.HTTP_200_OK)