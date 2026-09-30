from typing import Any, Literal

from pydantic import BaseModel, Field

Tier = Literal["everyday", "heavy"]


class Usage(BaseModel):
    input_tokens: int = 0
    output_tokens: int = 0


class CompleteRequest(BaseModel):
    system: str = Field(max_length=32_000)
    prompt: str = Field(min_length=1, max_length=64_000)
    tier: Tier = "everyday"
    temperature: float = Field(default=0.7, ge=0, le=2)
    max_tokens: int = Field(default=1500, ge=1, le=16_000)
    seed: int | None = None
    # When set, decoding is grammar-constrained to this JSON Schema and `json` is populated.
    json_schema: dict[str, Any] | None = None


class CompleteResponse(BaseModel):
    text: str
    json_: Any | None = Field(default=None, alias="json")
    model: str
    usage: Usage

    model_config = {"populate_by_name": True}


class TranscriptSegment(BaseModel):
    start: float
    end: float
    text: str


class TranscribeResponse(BaseModel):
    text: str
    language: str | None = None
    duration_s: float | None = None
    segments: list[TranscriptSegment] = []
    model: str


class EmbedRequest(BaseModel):
    texts: list[str] = Field(min_length=1, max_length=256)


class EmbedResponse(BaseModel):
    vectors: list[list[float]]
    model: str
    dimensions: int
    usage: Usage


class Health(BaseModel):
    status: Literal["ok"]
    version: str


class Readiness(BaseModel):
    llm: bool
    stt: bool
    embed: bool
