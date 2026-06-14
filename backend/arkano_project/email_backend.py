"""
Backend SMTP personalizado que desactiva la verificación de certificado SSL.
Necesario cuando Avast u otro antivirus intercepta la conexión TLS a smtp.gmail.com.
"""
import ssl
import smtplib
from django.core.mail.backends.smtp import EmailBackend


class TLSNoVerifyEmailBackend(EmailBackend):
    """
    Igual que el backend SMTP estándar de Django pero con SSL sin verificar.
    Solo usar en entornos locales donde un proxy/AV intercepta TLS.
    En producción (servidor Linux real) el backend estándar funciona sin esto.
    """

    def open(self):
        if self.connection:
            return False

        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE

        try:
            self.connection = smtplib.SMTP(
                self.host,
                self.port,
                timeout=self.timeout or 10,
            )
            self.connection.ehlo()
            if self.use_tls:
                self.connection.starttls(context=ssl_ctx)
                self.connection.ehlo()
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            return True
        except OSError:
            if not self.fail_silently:
                raise
            return False
