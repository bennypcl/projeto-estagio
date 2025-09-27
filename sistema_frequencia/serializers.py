from rest_framework import serializers
from .models import (Programa, Usuario, Setor, 
                     PerfilResidente, Turma, PerfilPreceptor, 
                     PerfilCoordenadorPrograma, PerfilCoordenadorGeral)

# Serializer = Tradutor modelos django para JSON, assim o frontend entende mais fácil

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'cpf', 'role', 'telefone']

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
        # usuario = id do usuário \\ turma = id da turma \\ preceptor = id do perfil do preceptor
        fields = [
            'usuario', 'nome_completo', 'email', 'cpf', 'telefone', 'matricula', 'turma', 'turma_codigo', 'preceptor', 'preceptor_nome'
        ]


class PreceptorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='usuario.username')
    first_name = serializers.CharField(source='usuario.first_name')
    last_name = serializers.CharField(source='usuario.last_name')
    email = serializers.EmailField(source='usuario.email')
    cpf = serializers.CharField(source='usuario.cpf')
    telefone = serializers.CharField(source='usuario.telefone')
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = PerfilPreceptor
        fields = ['usuario', 'username', 'first_name', 'last_name', 'email', 'cpf', 'telefone', 'password', 'especialidade']
        read_only_fields = ['usuario'] # O ID do usuário não deve ser editável diretamente
    
    def create(self, validated_data):
        dados_usuario = validated_data.pop('usuario')
        senha = validated_data.pop('password')

        usuario_obj = Usuario.objects.create_user(
            username=dados_usuario['username'],
            first_name=dados_usuario['first_name'],
            last_name=dados_usuario['last_name'],
            email=dados_usuario['email'],
            cpf=dados_usuario['cpf'],
            telefone=dados_usuario['telefone'],
            password=senha,
            role='preceptor' # Define o perfil correto
        )

        perfil_preceptor = PerfilPreceptor.objects.create(
            usuario=usuario_obj,
            especialidade=validated_data['especialidade']
        )
        return perfil_preceptor
    
    def update(self, instance, validated_data):
        dados_usuario = validated_data.get('usuario', {})
        usuario = instance.usuario
        usuario.first_name = dados_usuario.get('first_name', usuario.first_name)
        usuario.last_name = dados_usuario.get('last_name', usuario.last_name)
        usuario.email = dados_usuario.get('email', usuario.email)
        usuario.cpf = dados_usuario.get('cpf', usuario.cpf)
        usuario.telefone = dados_usuario.get('telefone', usuario.telefone)
        usuario.save()

        instance.especialidade = validated_data.get('especialidade', instance.especialidade)
        instance.save()
        return instance
    
class TurmaSerializer(serializers.ModelSerializer):
    programa_nome = serializers.CharField(source='programa.nome', read_only=True)
    residentes_count = serializers.SerializerMethodField()

    class Meta:
        model = Turma
        fields = ['id', 'codigo', 'programa', 'programa_nome', 'residentes_count']

    def get_residente_count(self, obj):
        return obj.perfilresidente_set_count()
    
class Coordenadorserializer(serializers.ModelSerializer):
    descricao_cargo = serializers.SerializerMethodField()
    programa = serializers.PrimaryKeyRelatedField(queryset=Programa.objects.all(), required=False, allow_null=True)
    titulo = serializers.CharField(max_length=100, required=False, allow_null=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'cpf', 'telefone', 'role', 
            'password', 'descricao_cargo', 'programa', 'titulo']
        read_only_fields = ['id', 'descricao_cargo']
        extra_kwargs = {'password': {'write_only': True}}

    def get_descricao_cargo(self, obj):
        if obj.role == 'coordenador_programa':
            try:
                return f"Coord. Programa: {obj.perfilcoordenadorprograma.programa.nome}"
            except:
                return "Coord. Programa (sem programa vinculado)"
        elif obj.role == 'coordenador_geral':
            try:
                return obj.perfilcoordenadorgeneral.titulo
            except:
                return "Coordenador(a) Geral"
        return "N/A"
    
    def create(self, validated_data):
        role = validated_data.get('role')
        programa = validated_data.pop('programa', None)
        titulo = validated_data.pop('titulo', None)

        user = Usuario.objects.create_user(**validated_data)

        if role == 'coordenador_programa':
            PerfilCoordenadorPrograma.objects.create(usuario = user, programa = programa)
        elif role == 'coordenador_programa':
            PerfilCoordenadorGeral.objects.create(usuario = user, titulo = titulo)

        return user