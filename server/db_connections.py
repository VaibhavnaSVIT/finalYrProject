from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

client = MongoClient('mongodb://localhost:27017/')

patientsDB = client['PatientsDB']
patient_collection = patientsDB['patients']
patient_medical_info = patientsDB['patient_meds']
patient_medical_img_info = patientsDB['patient_img_info']
patient_otp_collection = patientsDB['patientsOTP']

doctorsDB = client['DoctorsDB']
doctors_collection = doctorsDB['doctors']
doctors_info_collection = doctorsDB['doctors_info']
doctors_otp_collection = doctorsDB['doctorsOTP']
doctors_medical_img_info = doctorsDB['doctor_img_info']
doctors_symptom_info = doctorsDB['doctor_symptom_prediction']
doctor_requests = doctorsDB['doctor_requests']

adminsDB = client['AdminsDB']
admin_collection = adminsDB['admin']
admin_otp_collection = adminsDB['adminsOTP']

try:
    client.admin.command('ping')
    print("mongodb connected")
except Exception as e:
    print(e)