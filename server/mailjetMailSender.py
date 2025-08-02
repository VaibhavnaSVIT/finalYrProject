from mailjet_rest import Client
import os
from dotenv import load_dotenv

load_dotenv()

def send_email(recipient_email, subject, message):
    mailjet = Client(auth=(os.getenv("MAILJET_API_KEY"), os.getenv("MAILJET_SECRET_KEY")), version='v3.1')
    data = {
        'Messages': [
            {
                'From': {
                    'Email': 'vaibhavacharya46@gmail.com',
                },
                'To': [
                    {
                        'Email': recipient_email,
                    }
                ],
                'Subject': subject,
                'TextPart': message 
            }
        ]
    }

    result = mailjet.send.create(data=data)
    # print(result.status_code)
    # print(result.json())
    return result.status_code, result.json()
