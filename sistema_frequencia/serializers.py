from rest_framework import serializers
from .models import Programa, Usuario, Setor, PerfilResidente, Turma

# Serializer = Tradutor modelos django para JSON, assim o frontend entende mais fácil

class ProgramaSerializer(serializers.ModelSerializer):
    # Para mostrar os nomes em vez de apenas os ids
    coordenador_nome = serializers.CharField(source='coordenador.get_full_name', read_only=True)
    setor_nome = serializers.CharField(source='setor.nome', read_only=True)

    class Meta:
        model = Programa
        # Lista dos campos do nosso modelo que queremos expor na API
        fields = ['id', 'codigo', 'nome', 'duracao', 'setor', 'setor_nome', 'coordenador', 'coordenador_nome']

class ResidenteSerializer(serializers.ModelSerializer):
    # Pega os campos do modelo 'Usuario' relacionado
    nome_completo = serializers.CharField(source='usuario.get_full_name', read_only=True)
    email = serializers.EmailField(source='usuario.email', read_only=True)
    cpf = serializers.CharField(source='usuario.cpf', read_only=True)
    telefone = serializers.CharField(source='usuario.telefone', read_only=True)

    # Mostra o código da turma em vez do id
    turma_codigo = serializers.CharField(source='turma.codigo', read_only=True)
    # Mostra o nome do preceptor em vez do id do perfil
    preceptor_nome = serializers.CharField(source='preceptor.usuario.get_full_name', read_only=True)

    class Meta:
        model = PerfilResidente
        # Lista dos campos do nosso perfil e os campos especificados acima
        fields = [
            'usuario', # id do usuário
            'nome_completo',
            'email',
            'cpf',
            'telefone',
            'matricula',
            'turma', # id da turma
            'turma_codigo',
            'preceptor', # id do perfil do preceptor
            'preceptor_nome'
        ]