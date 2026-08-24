from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

from .models import UserProfile


# =========================================================
# USER REGISTRATION
# =========================================================

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    password2 = serializers.CharField(
        write_only=True
    )

    class Meta:

        model = User

        fields = [
            "username",
            "email",
            "password",
            "password2",
        ]

    # =====================================================
    # VALIDATE REGISTRATION DATA
    # =====================================================

    def validate(self, data):

        # -------------------------------------------------
        # Normalize username
        # -------------------------------------------------

        data["username"] = data["username"].strip()

        if not data["username"]:

            raise serializers.ValidationError({
                "username":
                    "Username cannot be empty."
            })

        # -------------------------------------------------
        # Normalize email
        # -------------------------------------------------

        data["email"] = data["email"].strip()

        if not data["email"]:

            raise serializers.ValidationError({
                "email":
                    "Email address cannot be empty."
            })

        # -------------------------------------------------
        # Check password confirmation
        # -------------------------------------------------

        if data["password"] != data["password2"]:

            raise serializers.ValidationError({
                "password":
                    "Passwords do not match."
            })

        # -------------------------------------------------
        # Check username
        # -------------------------------------------------

        if User.objects.filter(
            username=data["username"]
        ).exists():

            raise serializers.ValidationError({
                "username":
                    "Username already exists."
            })

        # -------------------------------------------------
        # Check email
        # -------------------------------------------------

        if User.objects.filter(
            email=data["email"]
        ).exists():

            raise serializers.ValidationError({
                "email":
                    "Email already exists."
            })

        # -------------------------------------------------
        # Django password validation
        # -------------------------------------------------

        validate_password(
            data["password"]
        )

        return data

    # =====================================================
    # CREATE USER
    # =====================================================

    def create(self, validated_data):

        validated_data.pop("password2")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        return user


# =========================================================
# USER PROFILE
# =========================================================

class UserProfileSerializer(
    serializers.ModelSerializer
):

    first_name = serializers.CharField(
        source="user.first_name",
        required=False,
        allow_blank=True
    )

    last_name = serializers.CharField(
        source="user.last_name",
        required=False,
        allow_blank=True
    )

    username = serializers.CharField(
        source="user.username",
        required=False
    )

    email = serializers.EmailField(
        source="user.email",
        required=False
    )

    profile_image = serializers.ImageField(
        required=False,
        allow_null=True
    )

    class Meta:

        model = UserProfile

        fields = [
            "id",
            "first_name",
            "last_name",
            "username",
            "email",
            "profile_image",
        ]

        read_only_fields = [
            "id",
        ]

    # =====================================================
    # VALIDATE USERNAME
    # =====================================================

    def validate_username(self, value):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Username cannot be empty."
            )

        user = self.instance.user

        if User.objects.filter(
            username=value
        ).exclude(
            id=user.id
        ).exists():

            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    # =====================================================
    # VALIDATE EMAIL
    # =====================================================

    def validate_email(self, value):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Email address cannot be empty."
            )

        user = self.instance.user

        if User.objects.filter(
            email=value
        ).exclude(
            id=user.id
        ).exists():

            raise serializers.ValidationError(
                "Email address already exists."
            )

        return value

    # =====================================================
    # UPDATE USER + USER PROFILE
    # =====================================================

    def update(
        self,
        instance,
        validated_data
    ):

        user_data = validated_data.pop(
            "user",
            {}
        )

        user = instance.user

        # -------------------------------------------------
        # Update first name
        # -------------------------------------------------

        if "first_name" in user_data:

            user.first_name = (
                user_data["first_name"].strip()
            )

        # -------------------------------------------------
        # Update last name
        # -------------------------------------------------

        if "last_name" in user_data:

            user.last_name = (
                user_data["last_name"].strip()
            )

        # -------------------------------------------------
        # Update username
        # -------------------------------------------------

        if "username" in user_data:

            user.username = (
                user_data["username"]
            )

        # -------------------------------------------------
        # Update email
        # -------------------------------------------------

        if "email" in user_data:

            user.email = (
                user_data["email"]
            )

        user.save()

        # -------------------------------------------------
        # Update profile image
        # -------------------------------------------------

        if "profile_image" in validated_data:

            instance.profile_image = (
                validated_data["profile_image"]
            )

        instance.save()

        return instance


# =========================================================
# CHANGE PASSWORD
# =========================================================

class ChangePasswordSerializer(
    serializers.Serializer
):

    current_password = serializers.CharField(
        write_only=True
    )

    new_password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    new_password2 = serializers.CharField(
        write_only=True
    )

    # =====================================================
    # VALIDATE PASSWORD
    # =====================================================

    def validate(self, data):

        user = self.context["request"].user

        # -------------------------------------------------
        # Check current password
        # -------------------------------------------------

        if not user.check_password(
            data["current_password"]
        ):

            raise serializers.ValidationError({
                "current_password":
                    "Current password is incorrect."
            })

        # -------------------------------------------------
        # Check new password confirmation
        # -------------------------------------------------

        if (
            data["new_password"]
            != data["new_password2"]
        ):

            raise serializers.ValidationError({
                "new_password":
                    "New passwords do not match."
            })

        # -------------------------------------------------
        # Prevent using the same password
        # -------------------------------------------------

        if user.check_password(
            data["new_password"]
        ):

            raise serializers.ValidationError({
                "new_password":
                    "New password must be different from your current password."
            })

        # -------------------------------------------------
        # Django password validation
        # -------------------------------------------------

        validate_password(
            data["new_password"],
            user
        )

        return data


# =========================================================
# END OF SERIALIZERS
# =========================================================

