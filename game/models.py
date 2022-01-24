from django.db import models

# Create your models here.
class UserInfo(models.Model):
    user_name = models.CharField(max_length=200)
    played = models.IntegerField(default=0)

    def __str__(self):
        return self.user_name + "님! 환영합니다."