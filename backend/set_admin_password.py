"""One-time setup / rotation for the admin panel's password.

Run with: python -m backend.set_admin_password

Not exposed anywhere in the app itself — the admin panel's own CRUD hardcodes the
admin_auth table out of its allow-list, so this is the only way to set or change it.
"""

import getpass
import secrets

from backend.admin_auth import hash_password
from backend.db import get_connection
from backend.models import create_schema, migrate_schema


def main() -> None:
    conn = get_connection()
    try:
        create_schema(conn)
        migrate_schema(conn)

        password = getpass.getpass("Nova senha de admin: ")
        confirm = getpass.getpass("Confirme a senha: ")
        if not password:
            print("a senha não pode ficar em branco")
            raise SystemExit(1)
        if password != confirm:
            print("as senhas não coincidem")
            raise SystemExit(1)

        salt = secrets.token_hex(16)
        password_hash = hash_password(password, salt)
        conn.execute(
            "INSERT OR REPLACE INTO admin_auth (id, password_hash, salt) VALUES (1, ?, ?)",
            (password_hash, salt),
        )
        conn.commit()
        print("senha de admin atualizada.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
