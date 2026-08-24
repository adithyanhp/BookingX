from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
    JSONParser,
)

from .models import (
    UserProfile,
    PasswordChangeLog,
)

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
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
        # Validate password information
        # -------------------------------------------------

        if serializer.is_valid():

            user = request.user

            # ---------------------------------------------
            # Set new password
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
            # The password itself is NEVER stored.
            #
            # Since this endpoint allows an authenticated
            # user to change their own password:
            #
            # user       -> account whose password changed
            # changed_by -> authenticated user
            # change_type -> USER
            #

            PasswordChangeLog.objects.create(
                user=user,
                changed_by=user,
                change_type="USER",
            )

            return Response(
                {
                    "detail": "Password changed successfully.",
                },
                status=status.HTTP_200_OK,
            )

        # -------------------------------------------------
        # Validation errors
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
# - Only the authenticated user can delete their own account.
# - Current password is verified on the backend.
# - The password is never stored.
# - The User object is permanently deleted.
# - Related objects follow their model's on_delete rules.
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
                    "detail": "Current password is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # VERIFY CURRENT PASSWORD
        # -------------------------------------------------

        if not user.check_password(current_password):

            return Response(
                {
                    "detail": "Current password is incorrect."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # PERMANENT ACCOUNT DELETION
        # -------------------------------------------------
        #
        # Django will apply the on_delete behaviour defined
        # on related models.
        #
        # IMPORTANT:
        # Do not manually delete bookings here until we
        # inspect the Booking model's relationship with User.
        # We want to preserve the correct booking behaviour.
        #

        user.delete()

        return Response(
            {
                "detail": "Your account has been permanently deleted."
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# END OF VIEWS
# =========================================================

