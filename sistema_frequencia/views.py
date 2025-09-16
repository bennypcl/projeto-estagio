from django.shortcuts import render

from rest_framework import generics
from .models import Programa, PerfilResidente
from .serializers import ProgramaSerializer, ResidenteSerializer


class ProgramaListCreateAPIView(generics.ListCreateAPIView):
    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer

class ResidenteListCreateAPIView(generics.ListCreateAPIView):
    # ".select_related()" otimiza a busca, fazendo o Django retornar dados do usuario, turma e preceptor
    queryset = PerfilResidente.objects.select_related('usuario', 'turma', 'preceptor__usuario').all()
    serializer_class = ResidenteSerializer