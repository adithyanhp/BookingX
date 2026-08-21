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
# END OF VIEWS
# =========================================================

