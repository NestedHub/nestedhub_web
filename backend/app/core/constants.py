# Role-related messages
ROLE_ASSIGNMENT_ERROR = "Only admins can assign non-customer or non-property_owner roles"
ADMIN_CREATION_RESTRICTION = "Only admins can create admin users"

# Email-related messages
EMAIL_ALREADY_REGISTERED = lambda role_context: f"This email is already registered as a {role_context}. To create a customer account, use a different email, or log in to your existing account."
PHONE_ALREADY_REGISTERED = "This phone number is already registered."

# Verification code
VERIFICATION_EMAIL_SUBJECT = "Email Verification Code"
VERIFICATION_EMAIL_BODY = lambda code: f"Your verification code is: {code}\nValid for 10 minutes."
RESET_PASSWORD_EMAIL_SUBJECT = "Password Reset Code"
RESET_PASSWORD_EMAIL_BODY = lambda code: f"Your password reset code is: {code}\nValid for 10 minutes."