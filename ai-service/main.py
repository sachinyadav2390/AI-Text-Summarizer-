"""
AI Summarization Service — FastAPI Wrapper
============================================
REST API that exposes the Transformer summarization engine
as a scalable microservice.

Endpoints:
  POST /ai/summarize  — Generate a summary
  GET  /health        — Health check & loaded models info
  GET  /models        — List all available models
  POST /models/load   — Pre-load a model into memory
"""

import logging
import time
import sys
import os
from typing import Optional

# Force UTF-8 encoding for standard out/err to prevent charmap errors on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import MODELS, DEFAULT_MODEL, HOST, PORT
from engine import (
    summarize,
    load_model,
    get_loaded_models,
    extract_keywords,
    summary_to_bullets,
    translate_text,
    extract_article_from_url,
)

# ─── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(name)-10s │ %(levelname)-7s │ %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ai-api")

# ─── FastAPI App ──────────────────────────────────────────────
app = FastAPI(
    title="AI Text Summarizer — Engine API",
    description="HuggingFace Transformers-based summarization microservice",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Startup: pre-load default model ─────────────────────────
startup_time = None


@app.on_event("startup")
async def on_startup():
    global startup_time
    logger.info("="*50)
    logger.info("  AI Summarization Engine Starting...")
    logger.info("="*50)
    startup_time = time.time()
    # Note: Model loading is deferred to first request or can be done via /models/load
    # to avoid blocking the server startup, especially on slower connections.
    logger.info("Server ready! Models will load on demand or via /models/load")


# ─── Request / Response Schemas ───────────────────────────────

class SummarizeRequest(BaseModel):
    """Request body for POST /ai/summarize"""
    text: str = Field(
        ...,
        min_length=20,
        max_length=50000,
        description="The text to summarize",
    )
    length: str = Field(
        default="medium",
        description="Summary length: short | medium | long",
    )
    model: str = Field(
        default=DEFAULT_MODEL,
        description=f"Model to use: {', '.join(MODELS.keys())}",
    )
    max_words: Optional[int] = Field(
        default=None,
        description="Optional max word count for the summary",
    )
    format: str = Field(
        default="paragraph",
        description="Output format: paragraph | bullets",
    )
    extract_keywords: bool = Field(
        default=False,
        description="Whether to extract keywords from the text",
    )
    source_lang: Optional[str] = Field(
        default=None,
        description="Source language code for translation (e.g. 'hi' for Hindi)",
    )
    target_lang: Optional[str] = Field(
        default=None,
        description="Target language code for output (e.g. 'hi' for Hindi)",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Artificial intelligence has transformed the way we interact with technology...",
                "length": "medium",
                "model": "bart",
                "format": "paragraph",
                "extract_keywords": True,
            }
        }


class SummarizeResponse(BaseModel):
    """Response body for POST /ai/summarize"""
    success: bool
    summary: str
    bullets: Optional[list] = None
    keywords: Optional[list] = None
    model: str
    model_key: str
    device: str
    processing_time_ms: int
    input_tokens: int
    output_tokens: int
    translated_from: Optional[str] = None
    translated_to: Optional[str] = None


class HealthResponse(BaseModel):
    """Response body for GET /health"""
    status: str
    uptime_seconds: Optional[float]
    loaded_models: list
    available_models: list
    default_model: str


class ModelInfo(BaseModel):
    """Model metadata"""
    key: str
    name: str
    model_id: str
    description: str
    max_input_tokens: int
    loaded: bool


class LoadModelRequest(BaseModel):
    """Request body for POST /models/load"""
    model: str = Field(..., description=f"Model to load: {', '.join(MODELS.keys())}")


class TranslateRequest(BaseModel):
    """Request body for POST /ai/translate"""
    text: str = Field(..., min_length=1)
    source_lang: str = Field(default="en")
    target_lang: str = Field(default="hi")


# ─── Endpoints ────────────────────────────────────────────────

@app.post("/ai/summarize", response_model=SummarizeResponse)
async def api_summarize(req: SummarizeRequest):
    """
    Generate a summary using a Transformer model.
    Supports: paragraph/bullet output, keyword extraction, multilingual.
    """
    # Validate length
    if req.length not in ("short", "medium", "long"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid length '{req.length}'. Use: short, medium, long",
        )

    # Validate model
    if req.model not in MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown model '{req.model}'. Available: {list(MODELS.keys())}",
        )

    try:
        text_to_summarize = req.text
        translated_from = None
        translated_to = None

        # ── Multilingual: translate source → English before summarizing ──
        if req.source_lang and req.source_lang != "en":
            logger.info(f"Translating from {req.source_lang} to en...")
            translated_from = req.source_lang
            text_to_summarize = translate_text(text_to_summarize, req.source_lang, "en")

        logger.info(
            f"📝 Summarize request: {len(text_to_summarize)} chars, "
            f"length={req.length}, model={req.model}, format={req.format}"
        )

        result = summarize(
            text=text_to_summarize,
            length=req.length,
            model_key=req.model,
        )

        summary_text = result["summary"]

        # ── Word limit: trim if max_words set ──
        if req.max_words and req.max_words > 0:
            words = summary_text.split()
            if len(words) > req.max_words:
                summary_text = " ".join(words[:req.max_words])
                if summary_text and summary_text[-1] not in ".!?":
                    summary_text += "."

        # ── Multilingual: translate summary back to target language ──
        if req.target_lang and req.target_lang != "en":
            logger.info(f"Translating summary to {req.target_lang}...")
            translated_to = req.target_lang
            summary_text = translate_text(summary_text, "en", req.target_lang)

        # ── Bullet points ──
        bullets = None
        if req.format == "bullets":
            bullets = summary_to_bullets(summary_text)

        # ── Keywords ──
        keywords = None
        if req.extract_keywords:
            keywords = extract_keywords(req.text, max_keywords=10)

        return SummarizeResponse(
            success=True,
            summary=summary_text,
            bullets=bullets,
            keywords=keywords,
            model=result["model"],
            model_key=result["model_key"],
            device=result["device"],
            processing_time_ms=result["processing_time_ms"],
            input_tokens=result["input_tokens"],
            output_tokens=result["output_tokens"],
            translated_from=translated_from,
            translated_to=translated_to,
        )

    except Exception as e:
        logger.error(f"Summarization failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Summarization failed: {str(e)}",
        )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint — returns service status and loaded models."""
    uptime = time.time() - startup_time if startup_time else None

    return HealthResponse(
        status="ok",
        uptime_seconds=round(uptime, 1) if uptime else None,
        loaded_models=get_loaded_models(),
        available_models=list(MODELS.keys()),
        default_model=DEFAULT_MODEL,
    )


@app.get("/models", response_model=list[ModelInfo])
async def list_models():
    """List all available models with their metadata."""
    loaded = get_loaded_models()
    return [
        ModelInfo(
            key=key,
            name=cfg.name,
            model_id=cfg.model_id,
            description=cfg.description,
            max_input_tokens=cfg.max_input_tokens,
            loaded=key in loaded,
        )
        for key, cfg in MODELS.items()
    ]


@app.post("/models/load")
async def preload_model(req: LoadModelRequest):
    """Pre-load a model into memory (avoids cold-start on first summarize)."""
    if req.model not in MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown model '{req.model}'. Available: {list(MODELS.keys())}",
        )

    try:
        load_model(req.model)
        return {"success": True, "message": f"Model '{req.model}' loaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── URL Article Extraction Endpoint ──────────────────────────

class URLRequest(BaseModel):
    """Request body for POST /ai/extract-url"""
    url: str = Field(..., description="The URL to extract article text from")


@app.post("/ai/extract-url")
async def api_extract_url(req: URLRequest):
    """Extract article text from a URL."""
    try:
        result = extract_article_from_url(req.url)
        if not result["text"].strip():
            raise HTTPException(
                status_code=422,
                detail="Could not extract meaningful text from this URL.",
            )
        return {
            "success": True,
            "title": result["title"],
            "text": result["text"],
            "authors": result["authors"],
            "wordCount": len(result["text"].split()),
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"URL extraction failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"URL extraction failed: {str(e)}")


# ─── Keyword-Only Endpoint ────────────────────────────────────

class KeywordsRequest(BaseModel):
    """Request body for POST /ai/keywords"""
    text: str = Field(..., min_length=20, max_length=50000)
    max_keywords: int = Field(default=10, ge=1, le=30)


@app.post("/ai/keywords")
async def api_extract_keywords(req: KeywordsRequest):
    """Extract keywords from text."""
    keywords = extract_keywords(req.text, req.max_keywords)
    return {"success": True, "keywords": keywords}


@app.post("/ai/translate")
async def api_translate(req: TranslateRequest):
    """Translate text between supported languages."""
    try:
        translated = translate_text(req.text, req.source_lang, req.target_lang)
        return {
            "success": True,
            "translatedText": translated,
            "source": req.source_lang,
            "target": req.target_lang
        }
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Run ──────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=False,
        log_level="info",
    )
