import hmac
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status

from .config import Settings, get_settings


def require_secret(
    settings: Annotated[Settings, Depends(get_settings)],
    authorization: Annotated[str | None, Header()] = None,
) -> None:
    """Every `/v1/*` route requires `Authorization: Bearer <DAVINCI_SECRET>`."""
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not hmac.compare_digest(token, settings.secret):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid Da Vinci secret")
