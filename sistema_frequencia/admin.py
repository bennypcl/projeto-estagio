from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Usuario, PerfilSecretario, PerfilPreceptor, PerfilTutor, 
    PerfilCoordenadorGeral, PerfilResidente, PerfilCoordenadorPrograma,
    Setor, Programa, Turma,
    Jornada, Atividade, Ponto
)

# A configuração do admin para o nosso Usuário customizado
class UsuarioAdmin(UserAdmin):
    # A base de fieldsets do UserAdmin já contém username, password, nome, email, etc.
    # Nós apenas adicionamos uma nova seção com os nossos campos customizados.
    fieldsets = UserAdmin.fieldsets + (
        ('Dados Customizados', {'fields': ('cpf', 'telefone', 'role')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Dados Customizados', {'fields': ('cpf', 'telefone', 'role')}),
    )

    # Adicionamos 'role' à lista de colunas na visualização principal
    list_display = ('username', 'get_full_name', 'role', 'is_staff')

class ProgramaAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nome', 'coordenador', 'setor', 'duracao')
    list_filter = ('setor', 'duracao')
    search_fields = ('nome', 'codigo')

class PerfilResidenteAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'turma', 'preceptor')
    list_filter = ('turma', 'preceptor')
    search_fields = ('usuario__first_name', 'usuario__last_name', 'matricula')

class JornadaAdmin(admin.ModelAdmin):
    list_display = ('residente', 'data', 'status', 'validador')
    list_filter = ('status', 'data')
    search_fields = ('residente__usuario__first_name', 'residente__usuario__last_name')


# Registrando os modelos mais complexos
admin.site.register(Usuario, UsuarioAdmin)
admin.site.register(Programa, ProgramaAdmin)
admin.site.register(PerfilResidente, PerfilResidenteAdmin)
admin.site.register(Jornada, JornadaAdmin)

# Registrando os outros modelos de forma simples
admin.site.register(Setor)
admin.site.register(Turma)
admin.site.register(PerfilSecretario)
admin.site.register(PerfilPreceptor)
admin.site.register(PerfilTutor)
admin.site.register(PerfilCoordenadorGeral)
admin.site.register(PerfilCoordenadorPrograma)
admin.site.register(Atividade)
admin.site.register(Ponto)
