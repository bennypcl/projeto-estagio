from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

class CPFAuthBackend(ModelBackend):
    """
    Autentica um usuário usando o cpf em vez do username.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            # Tenta encontrar o usuario, com o cpf.
            user = UserModel.objects.get(cpf=username)
            if user.check_password(password):
                return user
        except UserModel.DoesNotExist:
            # Se não encontrar, retorna None, o que significa falha na autenticação.
            return None

    def get_user(self, user_id):
        UserModel = get_user_model()
        try:
            return UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None