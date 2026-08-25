from django.conf import settings
from django.db import transaction
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
    JSONParser,
)

from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
)

from .models import (
    UserProfile,
    PasswordChangeLog,
    UserActivity,
)

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    ResetPasswordSerializer,
)


# =========================================================
# USER MODEL
# =========================================================

User = get_user_model()


# =========================================================
# HELPER FUNCTIONS
# =========================================================


def get_client_ip(request):
    """
    Get the client's IP address.

    Supports deployments where the application is behind
    a proxy or load balancer.
    """

    forwarded_for = request.META.get(
        "HTTP_X_FORWARDED_FOR"
    )

    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    return request.META.get(
        "REMOTE_ADDR"
    )


def get_user_agent(request):
    """
    Get the browser/device user-agent string.
    """

    return request.META.get(
        "HTTP_USER_AGENT",
        ""
    )


def create_activity_log(
    request,
    user,
    action
):
    """
    Create a user authentication activity log.

    Passwords and JWT tokens are never stored.
    """

    UserActivity.objects.create(
        user=user,
        action=action,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )


# =========================================================
# LOGIN
# =========================================================
#
# POST /api/auth/login/
#
# Request:
#
# {
#     "username": "...",
#     "password": "..."
# }
#
# Successful login creates a LOGIN activity log.
# =========================================================


class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = TokenObtainPairSerializer(
            data=request.data
        )

        # -------------------------------------------------
        # VALIDATE LOGIN CREDENTIALS
        # -------------------------------------------------

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # -------------------------------------------------
        # GET AUTHENTICATED USER
        # -------------------------------------------------

        user = serializer.user

        # -------------------------------------------------
        # CREATE LOGIN ACTIVITY LOG
        # -------------------------------------------------

        create_activity_log(
            request=request,
            user=user,
            action="LOGIN",
        )

        # -------------------------------------------------
        # RETURN JWT TOKENS
        # -------------------------------------------------

        return Response(
            serializer.validated_data,
            status=status.HTTP_200_OK,
        )


# =========================================================
# LOGOUT
# =========================================================
#
# POST /api/auth/logout/
#
# Requires authentication.
#
# JWT authentication is stateless, so the frontend is
# responsible for removing the JWT tokens.
# =========================================================


class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user

        # -------------------------------------------------
        # CREATE LOGOUT ACTIVITY LOG
        # -------------------------------------------------

        create_activity_log(
            request=request,
            user=user,
            action="LOGOUT",
        )

        return Response(
            {
                "detail":
                    "Logout recorded successfully."
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# REGISTRATION
# =========================================================


class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# =========================================================
# FORGOT PASSWORD
# =========================================================
#
# POST /api/auth/forgot-password/
#
# Request:
#
# {
#     "email": "user@example.com"
# }
#
# Generates a secure password reset token and sends the
# reset link to the user's email.
#
# The response does not reveal whether the email exists.
# =========================================================


class ForgotPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        # -------------------------------------------------
        # GET EMAIL
        # -------------------------------------------------

        email = request.data.get(
            "email",
            ""
        ).strip().lower()

        # -------------------------------------------------
        # VALIDATE EMAIL
        # -------------------------------------------------

        if not email:

            return Response(
                {
                    "detail":
                        "Email address is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # FIND USER
        # -------------------------------------------------

        user = User.objects.filter(
            email__iexact=email
        ).first()

        # -------------------------------------------------
        # GENERIC RESPONSE
        # -------------------------------------------------

        success_response = Response(
            {
                "detail":
                    "If an account exists with this email address, "
                    "a password reset link has been sent."
            },
            status=status.HTTP_200_OK,
        )

        # -------------------------------------------------
        # USER DOES NOT EXIST
        # -------------------------------------------------

        if not user:

            return success_response

        # -------------------------------------------------
        # USER IS INACTIVE
        # -------------------------------------------------

        if not user.is_active:

            return success_response

        # -------------------------------------------------
        # GENERATE PASSWORD RESET UID
        # -------------------------------------------------

        uid = urlsafe_base64_encode(
            force_bytes(user.pk)
        )

        # -------------------------------------------------
        # GENERATE PASSWORD RESET TOKEN
        # -------------------------------------------------

        token = default_token_generator.make_token(
            user
        )

        # -------------------------------------------------
        # FRONTEND URL
        # -------------------------------------------------

        frontend_url = getattr(
            settings,
            "FRONTEND_URL",
            "http://localhost:5173",
        ).rstrip("/")

        # -------------------------------------------------
        # RESET URL
        # -------------------------------------------------
        #
        # The frontend receives the UID and token from
        # this URL and sends them to the backend when
        # the user submits the new password.
        # -------------------------------------------------

        reset_url = (
            f"{frontend_url}/reset-password/"
            f"{uid}/{token}"
        )

        # -------------------------------------------------
        # EMAIL SUBJECT
        # -------------------------------------------------

        subject = "Reset your BookingX password"

        # -------------------------------------------------
        # EMAIL MESSAGE
        # -------------------------------------------------

        message = f"""
Hello {user.username},

We received a request to reset the password for your BookingX account.

Use the link below to create a new password:

{reset_url}

This link is temporary and can only be used once.

If you did not request a password reset, you can safely ignore this email.

Regards,
BookingX Team
""".strip()

        # -------------------------------------------------
        # SEND EMAIL
        # -------------------------------------------------

        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(
                settings,
                "DEFAULT_FROM_EMAIL",
                None,
            ),
            recipient_list=[
                user.email
            ],
            fail_silently=False,
        )

        # -------------------------------------------------
        # RETURN GENERIC RESPONSE
        # -------------------------------------------------

        return success_response


# =========================================================
# RESET PASSWORD
# =========================================================
#
# POST /api/auth/reset-password/
#
# OR
#
# POST /api/auth/reset-password/<uid>/<token>/
#
# Authentication is NOT required.
#
# UID and token can be supplied:
#
# 1. Through the URL
# 2. Through request.data
#
# The URL values take priority.
# =========================================================


class ResetPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(
        self,
        request,
        uid=None,
        token=None
    ):

        # =================================================
        # GET UID
        # =================================================
        #
        # Prefer the UID supplied through the URL.
        #
        # If the URL does not contain it, fall back to
        # the request body.
        # =================================================

        uid = uid or request.data.get(
            "uid"
        )

        # =================================================
        # GET TOKEN
        # =================================================

        token = token or request.data.get(
            "token"
        )

        # =================================================
        # CHECK UID
        # =================================================

        if not uid:

            return Response(
                {
                    "uid": [
                        "Password reset UID is required."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # CHECK TOKEN
        # =================================================

        if not token:

            return Response(
                {
                    "token": [
                        "Password reset token is required."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # CREATE SERIALIZER DATA
        # =================================================
        #
        # Only password fields are actually needed by the
        # serializer.
        #
        # UID and token are passed through serializer context
        # because ResetPasswordSerializer reads them from:
        #
        # self.context["uid"]
        # self.context["token"]
        # =================================================

        serializer = ResetPasswordSerializer(
            data=request.data,
            context={
                "request": request,
                "uid": uid,
                "token": token,
            },
        )

        # =================================================
        # VALIDATE RESET REQUEST
        # =================================================

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # GET USER
        # =================================================

        user = serializer.validated_data[
            "user"
        ]

        # =================================================
        # GET NEW PASSWORD
        # =================================================

        new_password = (
            serializer.validated_data[
                "new_password"
            ]
        )

        # =================================================
        # CHANGE PASSWORD
        # =================================================
        #
        # set_password() hashes the password.
        #
        # The plain-text password is never stored.
        # =================================================

        with transaction.atomic():

            user.set_password(
                new_password
            )

            user.save(
                update_fields=[
                    "password"
                ]
            )

            # ---------------------------------------------
            # PASSWORD RESET AUDIT LOG
            # ---------------------------------------------

            PasswordChangeLog.objects.create(
                user=user,
                changed_by=None,
                change_type="RESET",
            )

        # =================================================
        # SUCCESS
        # =================================================

        return Response(
            {
                "detail":
                    "Password reset successfully."
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# USER PROFILE
# =========================================================
#
# GET   /api/auth/profile/
# PATCH /api/auth/profile/
#
# Requires authentication.
# =========================================================


class ProfileView(
    generics.RetrieveUpdateAPIView
):

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    def get_object(self):

        profile, created = (
            UserProfile.objects.get_or_create(
                user=self.request.user
            )
        )

        return profile


# =========================================================
# CHANGE PASSWORD
# =========================================================
#
# PATCH /api/auth/profile/password/
#
# Requires:
#
# - current_password
# - new_password
# - new_password2
# =========================================================


class ChangePasswordView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request):

        serializer = ChangePasswordSerializer(
            data=request.data,
            context={
                "request": request,
            },
        )

        # -------------------------------------------------
        # VALIDATE PASSWORD INFORMATION
        # -------------------------------------------------

        if serializer.is_valid():

            user = request.user

            # ---------------------------------------------
            # SET NEW PASSWORD
            # ---------------------------------------------

            user.set_password(
                serializer.validated_data[
                    "new_password"
                ]
            )

            user.save()

            # ---------------------------------------------
            # CREATE PASSWORD CHANGE AUDIT LOG
            # ---------------------------------------------

            PasswordChangeLog.objects.create(
                user=user,
                changed_by=user,
                change_type="USER",
            )

            return Response(
                {
                    "detail":
                        "Password changed successfully.",
                },
                status=status.HTTP_200_OK,
            )

        # -------------------------------------------------
        # VALIDATION ERRORS
        # -------------------------------------------------

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# DELETE ACCOUNT
# =========================================================
#
# DELETE /api/auth/profile/delete/
#
# Requires:
#
# - Authentication
# - Current password
#
# Permanently deletes the authenticated user's account.
# =========================================================


class DeleteAccountView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request):

        user = request.user

        # -------------------------------------------------
        # GET CURRENT PASSWORD
        # -------------------------------------------------

        current_password = request.data.get(
            "current_password"
        )

        # -------------------------------------------------
        # REQUIRE PASSWORD
        # -------------------------------------------------

        if not current_password:

            return Response(
                {
                    "detail":
                        "Current password is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # VERIFY CURRENT PASSWORD
        # -------------------------------------------------

        if not user.check_password(
            current_password
        ):

            return Response(
                {
                    "detail":
                        "Current password is incorrect."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # PERMANENT ACCOUNT DELETION
        # -------------------------------------------------

        with transaction.atomic():

            user.delete()

        # -------------------------------------------------
        # SUCCESS
        # -------------------------------------------------

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# =========================================================
# END OF VIEWS
# =========================================================
