from passlib.context import CryptContext


password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)


def _truncate_password(password: str) -> bytes:
    """Truncate password to 72 bytes (bcrypt limit)."""
    return password.encode("utf-8")[:72]


def hash_password(password: str) -> str:
    truncated = _truncate_password(password)
    return password_context.hash(truncated)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    truncated = _truncate_password(plain_password)
    return password_context.verify(truncated, hashed_password)
