import hashlib
import secrets

PBKDF2_ITERATIONS = 200_000


def hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), PBKDF2_ITERATIONS).hex()


def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    return secrets.compare_digest(hash_password(password, salt), stored_hash)
