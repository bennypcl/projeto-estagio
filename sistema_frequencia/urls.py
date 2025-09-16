from django.urls import path
from .views import ProgramaListCreateAPIView, ResidenteListCreateAPIView

urlpatterns = [
    # 'api/'
    path('programas/', ProgramaListCreateAPIView.as_view(), name='programa-list-create'),
    path('residentes/', ResidenteListCreateAPIView.as_view(), name='residente-list-create'),
]