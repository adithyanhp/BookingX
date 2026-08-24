from django.db import transaction

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
)


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
# POST -> Login user and generate JWT tokens
#
# Endpoint:
# /api/auth/login/
#
# Request body:
# {
#     "username": "...",
#     "password": "..."
# }
#
# Successful login is recorded in UserActivity.
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
# POST -> Record logout activity
#
# Endpoint:
# /api/auth/logout/
#
# IMPORTANT:
# JWT authentication is stateless.
#
# This endpoint records that the authenticated user
# requested logout.
#
# The frontend must remove the access and refresh tokens.
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
# USER PROFILE
# =========================================================
# GET   -> View profile
# PATCH -> Update profile
#
# Endpoint:
# /api/auth/profile/
# =========================================================


class ProfileView(generics.RetrieveUpdateAPIView):

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
# PATCH -> Change password
#
# Endpoint:
# /api/auth/profile/password/
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
            #
            # Password itself is NEVER stored.
            #
            # user:
            #     Account whose password changed.
            #
            # changed_by:
            #     Authenticated user who performed change.
            #
            # change_type:
            #     USER
            #

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
# DELETE -> Permanently delete the authenticated user's
#           account after verifying the current password.
#
# Endpoint:
# /api/auth/profile/delete/
#
# Request body:
# {
#     "current_password": "user-password"
# }
#
# IMPORTANT:
# - Authentication is required.
# - Only the authenticated user can delete their account.
# - Current password is verified on the backend.
# - Password is never stored.
# - Account deletion happens inside a transaction.
# - Related objects follow their on_delete rules.
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
        #
        # The deletion is wrapped in a database transaction.
        #
        # If deletion fails partway through, Django rolls
        # the transaction back instead of leaving the
        # database in an inconsistent state.
        #
        # Related objects follow their model on_delete rules.
        #
        # Expected behaviour:
        #
        # Booking.user:
        #     CASCADE
        #
        # UserProfile.user:
        #     CASCADE
        #
        # UserActivity.user:
        #     SET_NULL
        #
        # Therefore:
        #
        # - User account is permanently deleted.
        # - User's bookings are deleted.
        # - User profile is deleted.
        # - UserActivity records remain.
        # - UserActivity.user becomes NULL.
        #

        with transaction.atomic():

            user.delete()

        # -------------------------------------------------
        # SUCCESS
        # -------------------------------------------------
        #
        # 204 No Content is the standard response for a
        # successful permanent DELETE operation.
        #
        # The frontend api.js already supports an empty
        # response.
        #

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# =========================================================
# END OF VIEWS
# =========================================================

