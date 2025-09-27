from django.shortcuts import render

from rest_framework import generics, viewsets
from .models import Programa, PerfilResidente, PerfilPreceptor, Turma, Usuario
from .serializers import (ProgramaSerializer, ResidenteSerializer, UsuarioSerializer, 
                          PreceptorSerializer, TurmaSerializer, Coordenadorserializer)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# cards de cada tipo de usuário em sua respectiva "home"
DASHBOARD_MODULES = {
    'secretario': [
        { "titulo": "Programas", "link": "secret-programas.html" },
        { "titulo": "Preceptores", "link": "secret-preceptores.html" },
        { "titulo": "Turmas", "link": "secret-turmas.html" },
        { "titulo": "Residentes", "link": "secret-residentes.html" },
        { "titulo": "Coordenadores", "link": "secret-coordenadores.html" }
    ],
    'residente': [
        { "titulo": "Bater Ponto", "link": "bater-ponto.html" },
        { "titulo": "Histórico", "link": "historico-residente.html" },
        { "titulo": "Notificações", "link": "notificacoes-residente.html" }
    ],
    'preceptor': [
        { "titulo": "Pendências", "link": "precept-pendencias.html" },
        { "titulo": "Turmas", "link": "precept-turmas.html" },
        { "titulo": "Atividades Realizadas", "link": "precept-atividades.html" },
        { "titulo": "Residentes", "link": "precept-residentes.html" },
        { "titulo": "Avaliações", "link": "precept-avaliacoes.html" }
    ],
    # Implementar os outros perfis de usuário...
}

class DashboardModulesAPIView(APIView):
    # "IsAuthenticated" = apenas usuários logados podem acessar este endpoint
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user # usuário que está fazendo a requisição
        role = user.role # tipo/perfil desse usuário
        # Busca dos módulos para o perfil no dicionário
        modules = DASHBOARD_MODULES.get(role, []) # Retorna [] se o perfil não for encontrado
        
        # Retorno dos módulos como uma resposta JSON
        return Response({'modulos': modules})

class ProgramaListCreateAPIView(generics.ListCreateAPIView):
    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer

class ResidenteListCreateAPIView(generics.ListCreateAPIView):
    # ".select_related()" otimiza a busca, fazendo o Django retornar dados do usuario, turma e preceptor
    queryset = PerfilResidente.objects.select_related('usuario', 'turma', 'preceptor__usuario').all()
    serializer_class = ResidenteSerializer

class CurrentUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)
    
class PreceptorViewSet(viewsets.ModelViewSet):
    """
    ViewSet serve pra listar, criar, ver, atualizar e deletar Preceptores (basicamente CRUD)
    """
    serializer_class = PreceptorSerializer
    queryset = PerfilPreceptor.objects.select_related('usuario').all()

class TurmaViewSet(viewsets.ModelViewSet):
    """
    ViewSet serve pra listar, criar, ver, atualizar e deletar Turmas (basicamente CRUD)
    """
    serializer_class = TurmaSerializer
    queryset = Turma.objects.select_related('programa').all()

class CoordenadorViewSet(viewsets.ModelViewSet):
    """
    ViewSet serve pra listar, criar, ver, atualizar e deletar tanto coordenadores de programa quanto gerais (basicamente CRUD)
    """
    serializer_class = Coordenadorserializer
    queryset = Usuario.objects.filter(role__in=['coordenador_programa', 'coordenador_geral'])