import smtplib
from email.mime.text import MIMEText
from fastapi import HTTPException
from app.core.config import settings

def send_email(
    recipient: str,
    subject: str,
    body: str
) -> None:
    try:
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = settings.EMAILS_FROM_EMAIL
        msg['To'] = recipient

        # Check environment before deciding how to send the email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.ENVIRONMENT == "local":
                # No authentication required for MailCatcher in local environment
                print("Using MailCatcher for local environment")
            else:
                # In production or staging, use authentication if credentials are provided
                if settings.SMTP_TLS:
                    server.starttls()

                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    
                print("Using SMTP server for production/staging")

            server.send_message(msg)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send verification email: {str(e)}"
        )
