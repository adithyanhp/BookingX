from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.contrib.auth import update_session_auth_hash
from django.contrib.admin.options import IS_POPUP_VAR
from django.contrib.admin.utils import unquote
from django.core.exceptions import PermissionDenied
from django.http import Http404, HttpResponseRedirect
from django.template.response import TemplateResponse
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.utils.html import escape
from django.utils.translation import gettext
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.csrf import csrf_protect

from .models import (
    UserProfile,
    PasswordChangeLog,
    UserActivity,
)


# =========================================================
# USER PROFILE ADMIN
# =========================================================

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "profile_image",
    )

    search_fields = (
        "user__username",
        "user__email",
    )

    ordering = (
        "user__username",
    )


# =========================================================
# PASSWORD CHANGE LOG ADMIN
# =========================================================

@admin.register(PasswordChangeLog)
class PasswordChangeLogAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "changed_by",
        "change_type",
        "changed_at",
    )

    list_filter = (
        "change_type",
        "changed_at",
    )

    search_fields = (
        "user__username",
        "user__email",
        "changed_by__username",
        "changed_by__email",
    )

    ordering = (
        "-changed_at",
    )

    readonly_fields = (
        "user",
        "changed_by",
        "change_type",
        "changed_at",
    )


# =========================================================
# USER AUTHENTICATION ACTIVITY ADMIN
# =========================================================
#
# Shows:
# - User
# - Login / Logout
# - Date and time
# - IP address
# - Browser / device information
#
# UserActivity uses SET_NULL for the User relationship,
# so authentication history remains available even after
# the user permanently deletes their account.
# =========================================================

@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "action",
        "timestamp",
        "ip_address",
        "user_agent",
    )

    list_filter = (
        "action",
        "timestamp",
    )

    search_fields = (
        "user__username",
        "user__email",
        "ip_address",
        "user_agent",
    )

    ordering = (
        "-timestamp",
    )

    readonly_fields = (
        "user",
        "action",
        "timestamp",
        "ip_address",
        "user_agent",
    )

    list_per_page = 25


# =========================================================
# CUSTOM USER ADMIN
# =========================================================

class CustomUserAdmin(BaseUserAdmin):

    @method_decorator(
        [
            sensitive_post_parameters(),
            csrf_protect,
        ]
    )
    def user_change_password(
        self,
        request,
        id,
        form_url=""
    ):
        """
        Custom Django Admin password-change flow.

        Uses Django's built-in password-change form and
        creates a PasswordChangeLog after the password
        has been successfully changed.
        """

        # -------------------------------------------------
        # GET USER
        # -------------------------------------------------

        user = self.get_object(
            request,
            unquote(id)
        )

        if not self.has_change_permission(
            request,
            user
        ):
            raise PermissionDenied

        if user is None:
            raise Http404(
                "%s object with primary key %r does not exist."
                % (
                    self.opts.verbose_name,
                    id,
                )
            )

        # =================================================
        # POST - PASSWORD CHANGE
        # =================================================

        if request.method == "POST":

            form = self.change_password_form(
                user,
                request.POST
            )

            if form.is_valid():

                # -----------------------------------------
                # Check valid password action
                # -----------------------------------------

                valid_submission = (
                    form.cleaned_data[
                        "set_usable_password"
                    ]
                    or "unset-password" in request.POST
                )

                if not valid_submission:

                    messages.error(
                        request,
                        gettext(
                            "Conflicting form data submitted. "
                            "Please try again."
                        )
                    )

                    return HttpResponseRedirect(
                        request.get_full_path()
                    )

                # -----------------------------------------
                # SAVE PASSWORD
                # -----------------------------------------

                user = form.save()

                # -----------------------------------------
                # CREATE PASSWORD AUDIT LOG
                # -----------------------------------------

                PasswordChangeLog.objects.create(
                    user=user,
                    changed_by=request.user,
                    change_type="ADMIN",
                )

                # -----------------------------------------
                # SUCCESS MESSAGE
                # -----------------------------------------

                if user.has_usable_password():

                    msg = gettext(
                        "Password changed successfully."
                    )

                else:

                    msg = gettext(
                        "Password-based authentication "
                        "was disabled."
                    )

                messages.success(
                    request,
                    msg
                )

                # -----------------------------------------
                # KEEP ADMIN SESSION ACTIVE
                # -----------------------------------------
                #
                # Only necessary when the admin changes
                # their own password.
                # -----------------------------------------

                if user.pk == request.user.pk:

                    update_session_auth_hash(
                        request,
                        user
                    )

                # -----------------------------------------
                # RETURN TO USER CHANGE PAGE
                # -----------------------------------------

                return HttpResponseRedirect(
                    reverse(
                        "%s:%s_%s_change"
                        % (
                            self.admin_site.name,
                            user._meta.app_label,
                            user._meta.model_name,
                        ),
                        args=(user.pk,),
                    )
                )

        # =================================================
        # GET - DISPLAY PASSWORD FORM
        # =================================================

        else:

            form = self.change_password_form(user)

        # -------------------------------------------------
        # BUILD ADMIN FORM
        # -------------------------------------------------

        fieldsets = [
            (
                None,
                {
                    "fields": list(
                        form.base_fields
                    )
                },
            )
        ]

        admin_form = admin.helpers.AdminForm(
            form,
            fieldsets,
            {}
        )

        # -------------------------------------------------
        # PAGE TITLE
        # -------------------------------------------------

        if user.has_usable_password():

            title = gettext(
                "Change password: %s"
            )

        else:

            title = gettext(
                "Set password: %s"
            )

        # -------------------------------------------------
        # TEMPLATE CONTEXT
        # -------------------------------------------------

        context = {

            "title": title % escape(
                user.get_username()
            ),

            "adminForm": admin_form,

            "form_url": form_url,

            "form": form,

            "is_popup": (
                IS_POPUP_VAR in request.POST
                or IS_POPUP_VAR in request.GET
            ),

            "is_popup_var": IS_POPUP_VAR,

            "add": True,

            "change": False,

            "has_delete_permission": False,

            "has_change_permission": True,

            "has_absolute_url": False,

            "opts": self.opts,

            "original": user,

            "save_as": False,

            "show_save": True,

            **self.admin_site.each_context(request),
        }

        request.current_app = self.admin_site.name

        return TemplateResponse(
            request,
            self.change_user_password_template
            or "admin/auth/user/change_password.html",
            context,
        )


# =========================================================
# REPLACE DEFAULT USER ADMIN
# =========================================================

try:

    admin.site.unregister(User)

except admin.sites.NotRegistered:

    pass


admin.site.register(
    User,
    CustomUserAdmin
)
