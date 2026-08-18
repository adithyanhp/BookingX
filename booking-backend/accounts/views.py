from rest_framework import generics
from rest_framework.permissions import AllowAny

from .serializers import RegisterSerializer

#Registeration view
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


