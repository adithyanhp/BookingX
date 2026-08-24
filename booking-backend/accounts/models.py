from django.db import models
from django.contrib.auth.models import User


# =========================================================
# USER PROFILE
# =========================================================

class UserProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    profile_image = models.ImageField(
        upload_to="profile_images/",
        blank=True,
        null=True
    )

    def __str__(self):

        return self.user.username


# =========================================================
# PASSWORD CHANGE LOG
# =========================================================

class PasswordChangeLog(models.Model):

    CHANGE_TYPE_CHOICES = [
        ("USER", "User"),
        ("ADMIN", "Admin"),
    ]

    # -----------------------------------------------------
    # User whose password was changed
    #
    # SET_NULL is intentional.
    #
    # If the user permanently deletes their account,
    # the password-change history remains available
    # in Django Admin.
    #
    # The user relationship becomes NULL instead of
    # deleting the password-change record.
    # -----------------------------------------------------

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="password_change_logs"
    )

    # -----------------------------------------------------
    # User/admin who performed the password change
    #
    # SET_NULL allows the audit record to remain even if
    # the account that performed the action is deleted.
    # -----------------------------------------------------

    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="password_changes_performed"
    )

    # -----------------------------------------------------
    # When the password was changed
    # -----------------------------------------------------

    changed_at = models.DateTimeField(
        auto_now_add=True
    )

    # -----------------------------------------------------
    # How the password was changed
    # -----------------------------------------------------

    change_type = models.CharField(
        max_length=10,
        choices=CHANGE_TYPE_CHOICES
    )

    class Meta:

        ordering = ["-changed_at"]

        verbose_name = "Password Change Log"

        verbose_name_plural = "Password Change Logs"

    def __str__(self):

        username = (
            self.user.username
            if self.user
            else "Deleted User"
        )

        return (
            f"{username} - "
            f"{self.get_change_type_display()} - "
            f"{self.changed_at:%Y-%m-%d %H:%M}"
        )


# =========================================================
# USER AUTHENTICATION ACTIVITY LOG
# =========================================================

class UserActivity(models.Model):

    ACTION_CHOICES = [
        ("LOGIN", "Login"),
        ("LOGOUT", "Logout"),
    ]

    # -----------------------------------------------------
    # User associated with this activity
    #
    # SET_NULL is intentional.
    #
    # If the user permanently deletes their account,
    # the authentication history remains available
    # in Django Admin.
    #
    # The user relationship becomes NULL instead of
    # deleting the activity history.
    # -----------------------------------------------------

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs"
    )

    # -----------------------------------------------------
    # Authentication action
    # -----------------------------------------------------

    action = models.CharField(
        max_length=10,
        choices=ACTION_CHOICES
    )

    # -----------------------------------------------------
    # When the activity occurred
    # -----------------------------------------------------

    timestamp = models.DateTimeField(
        auto_now_add=True
    )

    # -----------------------------------------------------
    # IP address
    # -----------------------------------------------------

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True
    )

    # -----------------------------------------------------
    # Browser / device information
    # -----------------------------------------------------

    user_agent = models.TextField(
        blank=True
    )

    class Meta:

        ordering = ["-timestamp"]

        verbose_name = "User Activity"

        verbose_name_plural = "User Activities"

    def __str__(self):

        username = (
            self.user.username
            if self.user
            else "Deleted User"
        )

        return (
            f"{username} - "
            f"{self.get_action_display()} - "
            f"{self.timestamp:%Y-%m-%d %H:%M:%S}"
        )

    