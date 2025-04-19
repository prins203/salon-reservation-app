from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
FROM_EMAIL = os.getenv('FROM_EMAIL')  # Optional - will use SendGrid's default sender if not provided

def send_otp_email(to_email: str, otp_code: str):
    if not SENDGRID_API_KEY:
        raise Exception("SendGrid API key not configured")
    
    message = Mail(
        from_email=FROM_EMAIL,  # If None, SendGrid will use the default sender
        to_emails=to_email,
        subject='Your Salon Booking OTP',
        html_content=f'''
            <h2>Your OTP for Salon Booking</h2>
            <p>Your OTP code is: <strong>{otp_code}</strong></p>
            <p>This code will expire in 10 minutes.</p>
        '''
    )
    
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False 