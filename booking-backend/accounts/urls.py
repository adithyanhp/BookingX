from django.urls import path

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    ChangePasswordView,
    DeleteAccountView,
    ForgotPasswordView,
    ResetPasswordView,
)


urlpatterns = [

    # =========================================================
    # AUTHENTICATION
    # =========================================================

    # ---------------------------------------------------------
    # REGISTER
    # ---------------------------------------------------------
    #
    # POST /api/auth/register/
    #
    # Creates a new user account.
    #
    # ---------------------------------------------------------

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),


    # ---------------------------------------------------------
    # LOGIN
    # ---------------------------------------------------------
    #
    # POST /api/auth/login/
    #
    # Custom LoginView:
    # - Validates username/password
    # - Generates JWT access + refresh tokens
    # - Creates LOGIN activity log
    #
    # ---------------------------------------------------------

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),


    # ---------------------------------------------------------
    # TOKEN REFRESH
    # ---------------------------------------------------------
    #
    # POST /api/auth/refresh/
    #
    # Generates a new access token using the refresh token.
    #
    # ---------------------------------------------------------

    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),


    # ---------------------------------------------------------
    # LOGOUT
    # ---------------------------------------------------------
    #
    # POST /api/auth/logout/
    #
    # Requires authentication.
    #
    # Creates a LOGOUT activity record.
    #
    # ---------------------------------------------------------

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),


    # =========================================================
    # PASSWORD RESET
    # =========================================================


    # ---------------------------------------------------------
    # FORGOT PASSWORD
    # ---------------------------------------------------------
    #
    # POST /api/auth/forgot-password/
    #
    # Request body:
    #
    # {
    #     "email": "user@example.com"
    # }
    #
    # Generates a secure password-reset token and sends
    # a password-reset email.
    #
    # The API intentionally does not reveal whether the
    # supplied email exists.
    #
    # ---------------------------------------------------------

    path(
        "forgot-password/",
        ForgotPasswordView.as_view(),
        name="forgot-password",
    ),


    # ---------------------------------------------------------
    # RESET PASSWORD
    # ---------------------------------------------------------
    #
    # POST /api/auth/reset-password/
    #
    # Request body:
    #
    # {
    #     "uid": "...",
    #     "token": "...",
    #     "new_password": "...",
    #     "new_password2": "..."
    # }
    #
    # The UID and token are received from the frontend.
    #
    # The frontend gets them from:
    #
    # /reset-password/<uid>/<token>
    #
    # This endpoint:
    #
    # - Validates the UID
    # - Validates the reset token
    # - Validates the new password
    # - Changes the user's password
    # - Invalidates the reset token after the password changes
    # - Creates a password-change audit record
    #
    # ---------------------------------------------------------

    path(
        "reset-password/",
        ResetPasswordView.as_view(),
        name="reset-password",
    ),


    # =========================================================
    # USER PROFILE
    # =========================================================


    # ---------------------------------------------------------
    # GET /api/auth/profile/
    # PATCH /api/auth/profile/
    #
    # GET:
    # - Returns authenticated user's profile
    #
    # PATCH:
    # - Updates profile information
    # - Supports profile image upload
    #
    # ---------------------------------------------------------

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),


    # =========================================================
    # CHANGE PASSWORD
    # =========================================================


    # ---------------------------------------------------------
    # PATCH /api/auth/profile/password/
    #
    # Requires:
    # - current_password
    # - new_password
    # - new_password2
    #
    # ---------------------------------------------------------

    path(
        "profile/password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),


    # =========================================================
    # DELETE ACCOUNT
    # =========================================================


    # ---------------------------------------------------------
    # DELETE /api/auth/profile/delete/
    #
    # Requires:
    # - Authentication
    # - Current password
    #
    # Permanently deletes the authenticated user's account.
    #
    # ---------------------------------------------------------

    path(
        "profile/delete/",
        DeleteAccountView.as_view(),
        name="delete-account",
    ),
]

