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
)


urlpatterns = [

    # =========================================================
    # AUTHENTICATION
    # =========================================================

    # ---------------------------------------------------------
    # REGISTER
    # ---------------------------------------------------------
    #
    # POST:
    # /api/auth/register/
    #
    # ---------------------------------------------------------

    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    # ---------------------------------------------------------
    # LOGIN
    # ---------------------------------------------------------
    #
    # POST:
    # /api/auth/login/
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
        name="login"
    ),

    # ---------------------------------------------------------
    # TOKEN REFRESH
    # ---------------------------------------------------------
    #
    # POST:
    # /api/auth/refresh/
    #
    # Refreshes an expired access token.
    #
    # ---------------------------------------------------------

    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh"
    ),

    # ---------------------------------------------------------
    # LOGOUT
    # ---------------------------------------------------------
    #
    # POST:
    # /api/auth/logout/
    #
    # Requires authentication.
    #
    # Creates a LOGOUT activity record containing:
    # - User
    # - Date/time
    # - IP address
    # - Browser/device information
    #
    # The frontend must still remove the JWT tokens.
    #
    # ---------------------------------------------------------

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout"
    ),


    # =========================================================
    # USER PROFILE
    # =========================================================

    # GET /api/auth/profile/
    # PATCH /api/auth/profile/

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),


    # =========================================================
    # CHANGE PASSWORD
    # =========================================================

    # PATCH /api/auth/profile/password/

    path(
        "profile/password/",
        ChangePasswordView.as_view(),
        name="change-password"
    ),


    # =========================================================
    # DELETE ACCOUNT
    # =========================================================

    # DELETE /api/auth/profile/delete/
    #
    # Requires:
    # - Authentication
    # - Current password
    #
    # Permanently deletes the User account.
    #
    # UserActivity records remain because the UserActivity.user
    # relationship uses SET_NULL.
    #

    path(
        "profile/delete/",
        DeleteAccountView.as_view(),
        name="delete-account"
    ),
]

