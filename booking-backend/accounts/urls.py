from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView,
    ProfileView,
    ChangePasswordView,
    DeleteAccountView,
)


urlpatterns = [

    # =====================================================
    # AUTHENTICATION
    # =====================================================

    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="login"
    ),

    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh"
    ),


    # =====================================================
    # USER PROFILE
    # =====================================================

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),


    # =====================================================
    # CHANGE PASSWORD
    # =====================================================
    # PATCH:
    # /api/auth/profile/password/
    # =====================================================

    path(
        "profile/password/",
        ChangePasswordView.as_view(),
        name="change-password"
    ),


    # =====================================================
    # DELETE ACCOUNT
    # =====================================================
    # DELETE:
    # /api/auth/profile/delete/
    #
    # Requires:
    # - Authenticated user
    # - Current password
    # =====================================================

    path(
        "profile/delete/",
        DeleteAccountView.as_view(),
        name="delete-account"
    ),
]

