from django.db import models
from django.contrib.auth.models import AbstractUser


# ============================================================================
# MODELO BASE DE USUÁRIO E PERFIS ("ESPECIALIZAÇÕES")

class Usuario(AbstractUser):
    # Django já dá username, password, email, first_name, last_name
    
    ROLE_CHOICES = [
        ('secretario', 'Secretário'),
        ('residente', 'Residente'),
        ('preceptor', 'Preceptor'),
        ('coordenador_programa', 'Coordenador de Programa'),
        ('coordenador_geral', 'Coordenador Geral'),
        ('tutor', 'Tutor')
    ]

    cpf = models.CharField(max_length=14, unique=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return self.get_full_name() or self.username

# ============================================================================
# PERFIS DE SECRETARIO, PRECEPTOR, TUTOR E COORD. GERAL

# Os perfis usam OneToOneField para estender o modelo Usuario

class PerfilSecretario(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    def __str__(self):
        return f"Perfil de Secretário: {self.usuario.get_full_name()}"

class PerfilPreceptor(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    especialidade = models.CharField(max_length=100)
    def __str__(self):
        return f"Perfil de Preceptor: {self.usuario.get_full_name()}"
    
class PerfilTutor(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    especialidade = models.CharField(max_length=100)
    def __str__(self):
        return f"Perfil de Tutor: {self.usuario.get_full_name()}"
        
class PerfilCoordenadorGeral(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    titulo = models.CharField(max_length=100)
    def __str__(self):
        return f"Perfil de Coordenador Geral: {self.usuario.get_full_name()}"

# ============================================================================
# MODELOS de SETORES, PROGRAMAS e TURMAS

class Setor(models.Model):
    nome = models.CharField(max_length=200)
    endereco = models.CharField(max_length=255)
    def __str__(self):
        return self.nome

class Programa(models.Model):
    codigo = models.CharField(max_length=50, unique=True)
    nome = models.CharField(max_length=200)
    duracao = models.CharField(max_length=50)
    # Relação ForeignKey: Muitos programas podem pertencer a um setor
    # "on_delete=models.PROTECT" = impede que um setor seja deletado se tiver programas associados
    setor = models.ForeignKey(Setor, on_delete=models.PROTECT)
    coordenador = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'coordenador_programa'})
    def __str__(self):
        return f"{self.codigo} - {self.nome}"

class Turma(models.Model):
    codigo = models.CharField(max_length=50, unique=True)
    # Relação ForeignKey: Muitas turmas podem pertencer a um programa.
    # "on_delete=models.CASCADE" = se um programa for deletado, suas turmas também serão.
    programa = models.ForeignKey(Programa, on_delete=models.CASCADE)
    def __str__(self):
        return self.codigo

# ============================================================================
# PERFIS DE RESIDENTE E COORD. PROGRAMA

class PerfilResidente(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    matricula = models.CharField(max_length=50, unique=True)
    # Relação ForeignKey: Um residente pode (ou não) pertencer a uma turma.
    turma = models.ForeignKey(Turma, on_delete=models.SET_NULL, null=True, blank=True)
    # Relação ForeignKey: Um residente pode (ou não) ter um preceptor.
    preceptor = models.ForeignKey(PerfilPreceptor, on_delete=models.SET_NULL, null=True, blank=True)
    def __str__(self):
        return f"Perfil de Residente: {self.usuario.get_full_name()}"

# O Perfil do Coordenador de Programa se liga a um Programa
class PerfilCoordenadorPrograma(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    programa = models.OneToOneField(Programa, on_delete=models.SET_NULL, null=True, blank=True)
    def __str__(self):
        return f"Perfil de Coordenador de Programa: {self.usuario.get_full_name()}"

# ============================================================================
# MODELOS DO SISTEMA DE PONTO (JORNADAS, ATIVIDADES, PONTOS)

class Jornada(models.Model):
    STATUS_CHOICES = [('pendente', 'Pendente'), ('aprovado', 'Aprovado'), ('reprovado', 'Reprovado'), ('justificado', 'Justificado')]
    residente = models.ForeignKey(PerfilResidente, on_delete=models.CASCADE)
    data = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    justificativa_geral = models.TextField(blank=True, null=True)
    validador = models.ForeignKey(PerfilPreceptor, on_delete=models.SET_NULL, null=True, blank=True, related_name='jornadas_validadas')
    data_validacao = models.DateTimeField(null=True, blank=True)
    observacao_validador = models.TextField(blank=True, null=True)
    class Meta:
        unique_together = ('residente', 'data') # Garante que um residente só pode ter uma jornada por dia
    def __str__(self):
        return f"Jornada de {self.residente.usuario.get_full_name()} em {self.data}"

class Atividade(models.Model):
    TIPO_CHOICES = [('normal', 'Normal'), ('aula_teorica', 'Aula Teórica'), ('atestado', 'Atestado'), ('evento_autorizado', 'Evento Autorizado')]
    jornada = models.ForeignKey(Jornada, related_name='atividades', on_delete=models.CASCADE)
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES)
    detalhe = models.CharField(max_length=200, blank=True, null=True)
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.jornada.data}"

class Ponto(models.Model):
    TIPO_CHOICES = [('entrada', 'Entrada'), ('saida', 'Saída'), ('inicio_intervalo', 'Início do Intervalo'), ('fim_intervalo', 'Fim do Intervalo')]
    atividade = models.ForeignKey(Atividade, related_name='pontos', on_delete=models.CASCADE)
    hora = models.TimeField()
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    def __str__(self):
        return f"{self.get_tipo_display()} às {self.hora}"

# ============================================================================
# MODELOS DO SISTEMA DE AVALIAÇÃO (A ser implementado)

# ...