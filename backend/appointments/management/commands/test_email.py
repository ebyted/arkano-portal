"""
Comando para probar la configuración de email.
Uso: python manage.py test_email
"""
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings


class Command(BaseCommand):
    help = 'Prueba el envío de email con la configuración actual'

    def handle(self, *args, **options):
        self.stdout.write('\n=== Test de Email — Arkano-IA ===\n')
        self.stdout.write(f'  HOST:     {settings.EMAIL_HOST}:{settings.EMAIL_PORT}')
        self.stdout.write(f'  USER:     {settings.EMAIL_HOST_USER}')
        self.stdout.write(f'  PASSWORD: {"✓ configurado" if settings.EMAIL_HOST_PASSWORD else "✗ VACÍO"}')
        self.stdout.write(f'  DESTINO:  {settings.NOTIFY_EMAIL}\n')

        if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
            self.stderr.write(self.style.ERROR(
                '✗ EMAIL_HOST_USER o EMAIL_HOST_PASSWORD están vacíos en .env'
            ))
            return

        self.stdout.write('Enviando correo de prueba...')
        try:
            send_mail(
                subject='[Arkano-IA] Test de email ✓',
                message=(
                    'Este es un correo de prueba enviado desde el backend de Arkano-IA.\n\n'
                    'Si recibes este mensaje, la configuración de email es correcta.'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.NOTIFY_EMAIL],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(
                f'\n✓ Correo enviado correctamente a {settings.NOTIFY_EMAIL}'
            ))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'\n✗ Error: {e}'))
            self.stderr.write('\nPosibles causas:')
            self.stderr.write('  1. App Password incorrecto (debe ser de 16 caracteres sin espacios)')
            self.stderr.write('  2. 2FA no está activado en la cuenta de Gmail')
            self.stderr.write('  3. La cuenta tiene bloqueado el acceso SMTP')
            self.stderr.write('  → Verificar en: myaccount.google.com/apppasswords\n')
