from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (ProgramaListCreateAPIView, ResidenteListCreateAPIView, DashboardModulesAPIView, 
                    CurrentUserAPIView, PreceptorViewSet, TurmaViewSet,
                    CoordenadorViewSet)

router = DefaultRouter()
router.register(r'preceptores', PreceptorViewSet, basename='preceptor')
router.register(r'turmas', TurmaViewSet, basename='turma')
router.register(r'coordenadores', CoordenadorViewSet, basename='coordenador')

urlpatterns = [
    # 'api/'
    path('programas/', ProgramaListCreateAPIView.as_view(), name='programa-list-create'),
    path('residentes/', ResidenteListCreateAPIView.as_view(), name='residente-list-create'),
    path('dashboard-modules/', DashboardModulesAPIView.as_view(), name='dashboard-modules'),
    path('usuarios/me/', CurrentUserAPIView.as_view(), name='current-user'),

    # preceptores, turmas, coordenadores
    path('', include(router.urls)),
]