from app.core.config import settings
import smtplib
from email.mime.text import MIMEText
from fastapi import HTTPException


def send_verification_email(*, email: str, verification_token: str) -> None:
    verification_link = f"https://yourdomain.com/verify?token={verification_token}"
    msg = MIMEText(f"""
        Welcome! Please verify your email by clicking the link below:
        {verification_link}
        If you didn’t register, ignore this email.
    """)
    msg["Subject"] = "Verify Your Email"
    msg["From"] = settings.EMAILS_FROM_EMAIL
    msg["To"] = email

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()  # Always enable TLS for Gmail on port 587
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    except smtplib.SMTPException as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to send email: {str(e)}")


if __name__ == "__main__":
    send_verification_email(email="khinnara99@gmail.com",
                            verification_token="test123")
