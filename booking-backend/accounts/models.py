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
    # -----------------------------------------------------

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="password_change_logs"
    )

    # -----------------------------------------------------
    # User/admin who performed the password change
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
        return (
            f"{self.user.username} - "
            f"{self.get_change_type_display()} - "
            f"{self.changed_at:%Y-%m-%d %H:%M}"
        )

    