"""
AI Summarization Engine
========================
Core module that handles:
  1. Model loading & caching
  2. Text preprocessing / tokenization
  3. Transformer inference (BART / T5 / Pegasus)
  4. Post-processing of generated summary
  5. Keyword extraction
  6. Bullet-point formatting
  7. Multilingual pipeline (translate → summarize → translate back)
"""

import re
import time
import logging
from typing import Optional, Dict, Any, List
from collections import Counter

import torch
from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    pipeline as hf_pipeline,
    PreTrainedTokenizer,
    PreTrainedModel,
)

from config import MODELS, LENGTH_PRESETS, DEFAULT_MODEL, ModelConfig, LengthPreset

logger = logging.getLogger("ai-engine")


# ─── Model Cache (singleton per model) ────────────────────────

_loaded_models: Dict[str, Dict[str, Any]] = {}


def _get_device() -> str:
    """Detect best available device."""
    if torch.cuda.is_available():
        return "cuda"
    # MPS for Apple Silicon
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def load_model(model_key: str = DEFAULT_MODEL) -> Dict[str, Any]:
    """
    Load a Transformer model + tokenizer into memory.
    Caches after first load so subsequent calls are instant.
    """
    if model_key in _loaded_models:
        logger.info(f"Model '{model_key}' already loaded (cached)")
        return _loaded_models[model_key]

    if model_key not in MODELS:
        raise ValueError(f"Unknown model: '{model_key}'. Available: {list(MODELS.keys())}")

    cfg: ModelConfig = MODELS[model_key]
    device = _get_device()

    logger.info(f"Loading model '{cfg.name}' ({cfg.model_id}) on {device}...")
    start = time.time()

    tokenizer: PreTrainedTokenizer = AutoTokenizer.from_pretrained(cfg.model_id)
    model: PreTrainedModel = AutoModelForSeq2SeqLM.from_pretrained(cfg.model_id)
    model = model.to(device)
    model.eval()

    elapsed = time.time() - start
    logger.info(f"Model '{cfg.name}' loaded in {elapsed:.1f}s on {device}")

    _loaded_models[model_key] = {
        "tokenizer": tokenizer,
        "model": model,
        "config": cfg,
        "device": device,
    }

    return _loaded_models[model_key]


def get_loaded_models() -> list:
    """Return list of currently loaded model keys."""
    return list(_loaded_models.keys())


# ─── Text Preprocessing ───────────────────────────────────────

def preprocess_text(text: str, model_key: str = DEFAULT_MODEL) -> str:
    """
    Clean and prepare input text for the model.
    T5 requires a 'summarize: ' prefix.
    """
    # Basic cleanup
    text = text.strip()
    text = " ".join(text.split())  # normalize whitespace

    # T5-specific: prepend task prefix
    if model_key.startswith("t5"):
        text = "summarize: " + text

    return text


def truncate_to_max_tokens(
    text: str,
    tokenizer: PreTrainedTokenizer,
    max_tokens: int,
) -> str:
    """Truncate text to fit within the model's max token limit."""
    tokens = tokenizer.encode(text, truncation=True, max_length=max_tokens)
    return tokenizer.decode(tokens, skip_special_tokens=True)


# ─── Summarization Pipeline ───────────────────────────────────

def summarize(
    text: str,
    length: str = "medium",
    model_key: str = DEFAULT_MODEL,
) -> Dict[str, Any]:
    """
    Full summarization pipeline:
      Input Text → Preprocess → Tokenize → Model Forward → Decode → Return

    Args:
        text:      Raw input text
        length:    "short" | "medium" | "long"
        model_key: "bart" | "t5" | "pegasus"

    Returns:
        dict with keys: summary, model, device, processing_time_ms,
                        input_tokens, output_tokens
    """
    start = time.time()

    # 1. Load model (from cache if available)
    bundle = load_model(model_key)
    tokenizer: PreTrainedTokenizer = bundle["tokenizer"]
    model: PreTrainedModel = bundle["model"]
    cfg: ModelConfig = bundle["config"]
    device: str = bundle["device"]

    # 2. Get length preset
    presets = LENGTH_PRESETS.get(model_key, LENGTH_PRESETS[DEFAULT_MODEL])
    preset: LengthPreset = presets.get(length, presets["medium"])

    # 3. Preprocess
    processed = preprocess_text(text, model_key)

    # 4. Tokenize
    inputs = tokenizer(
        processed,
        return_tensors="pt",
        max_length=cfg.max_input_tokens,
        truncation=True,
        padding="longest",
    )
    input_ids = inputs["input_ids"].to(device)
    attention_mask = inputs["attention_mask"].to(device)
    input_token_count = input_ids.shape[1]

    logger.info(
        f"Generating summary: model={model_key}, length={length}, "
        f"input_tokens={input_token_count}, device={device}"
    )

    # 5. Generate summary (Transformer forward pass)
    with torch.no_grad():
        output_ids = model.generate(
            input_ids=input_ids,
            attention_mask=attention_mask,
            max_length=preset.max_length,
            min_length=preset.min_length,
            num_beams=preset.num_beams,
            length_penalty=preset.length_penalty,
            early_stopping=True,
            no_repeat_ngram_size=3,
        )

    # 6. Decode
    summary = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    output_token_count = output_ids.shape[1]

    # 7. Post-process
    summary = postprocess_summary(summary)

    elapsed_ms = int((time.time() - start) * 1000)

    logger.info(
        f"Summary generated: {output_token_count} tokens in {elapsed_ms}ms"
    )

    return {
        "summary": summary,
        "model": f"{cfg.name} ({cfg.model_id})",
        "model_key": model_key,
        "device": device,
        "processing_time_ms": elapsed_ms,
        "input_tokens": input_token_count,
        "output_tokens": output_token_count,
    }


# ─── Post-processing ──────────────────────────────────────────

def postprocess_summary(summary: str) -> str:
    """Clean up the generated summary text."""
    # Remove extra whitespace
    summary = " ".join(summary.split())

    # Ensure it ends with proper punctuation
    if summary and summary[-1] not in ".!?":
        summary += "."

    return summary.strip()


# ─── Keyword Extraction ───────────────────────────────────────

# Common English stop-words for keyword filtering
_STOP_WORDS = set(
    "a an the and or but in on at to for of is it its was were be been being "
    "have has had do does did will would shall should can could may might must "
    "i me my we our you your he him his she her they them their this that these "
    "those what which who whom when where why how all each every both few more "
    "most other some such no not only same so than too very just about above "
    "after again against as before between by during from into out over through "
    "under until up with also are if then because while".split()
)


def extract_keywords(text: str, max_keywords: int = 10) -> List[str]:
    """
    Lightweight TF-based keyword extraction.
    Extracts the most frequent meaningful words/phrases.
    """
    # Normalise
    text_lower = text.lower()
    # Tokenize into words
    words = re.findall(r"\b[a-z][a-z'-]{2,}\b", text_lower)
    # Filter stop-words
    filtered = [w for w in words if w not in _STOP_WORDS and len(w) > 2]

    # Count frequencies
    freq = Counter(filtered)

    # Extract bigrams for compound keywords
    bigrams = []
    for i in range(len(words) - 1):
        if words[i] not in _STOP_WORDS and words[i + 1] not in _STOP_WORDS:
            bigrams.append(f"{words[i]} {words[i+1]}")
    bigram_freq = Counter(bigrams)

    # Merge: boost bigrams that appear 2+ times
    keywords = []
    used_words = set()
    for bg, count in bigram_freq.most_common(max_keywords):
        if count >= 2:
            keywords.append(bg)
            for w in bg.split():
                used_words.add(w)

    # Fill remaining with top unigrams
    for word, count in freq.most_common(max_keywords * 2):
        if len(keywords) >= max_keywords:
            break
        if word not in used_words and count >= 2:
            keywords.append(word)
            used_words.add(word)

    # If still short, add remaining top single words
    if len(keywords) < 3:
        for word, _ in freq.most_common(5):
            if word not in used_words:
                keywords.append(word)
                if len(keywords) >= max_keywords:
                    break

    return keywords[:max_keywords]


# ─── Bullet Point Formatting ──────────────────────────────────

def summary_to_bullets(summary: str) -> List[str]:
    """
    Convert a paragraph summary into bullet points.
    Splits on sentences and cleans each one.
    """
    # Split on sentence boundaries
    sentences = re.split(r'(?<=[.!?])\s+', summary.strip())
    bullets = []
    for s in sentences:
        s = s.strip()
        if len(s) > 10:  # skip very short fragments
            # Remove leading dash/bullet if any
            s = re.sub(r'^[-•·]\s*', '', s)
            # Capitalise first letter
            if s:
                s = s[0].upper() + s[1:]
            bullets.append(s)
    return bullets if bullets else [summary]


# ─── Multilingual Translation Pipeline ────────────────────────
# Uses deep-translator (Google Translate) for reliable, instant translation
# across all supported languages. No model downloads required.

# Language code mapping: our codes → Google Translate codes
_LANG_CODE_MAP: Dict[str, str] = {
    "en": "en",
    "hi": "hi",
    "fr": "fr",
    "de": "de",
    "es": "es",
    "zh": "zh-CN",
    "ar": "ar",
    "ja": "ja",
    "ru": "ru",
}


def _map_lang_code(code: str) -> str:
    """Map our language codes to Google Translate codes."""
    return _LANG_CODE_MAP.get(code, code)


def translate_text(text: str, src_lang: str, tgt_lang: str) -> str:
    """
    Translate text using Google Translate (via deep-translator).
    Handles long texts by splitting into chunks under the 5000-char limit.
    """
    from deep_translator import GoogleTranslator

    src = _map_lang_code(src_lang)
    tgt = _map_lang_code(tgt_lang)

    logger.info(f"Translating: {src} → {tgt} ({len(text)} chars)")

    # Google Translate has a ~5000 char limit per request.
    # Split into sentence-based chunks.
    max_chunk = 4500

    if len(text) <= max_chunk:
        chunks = [text]
    else:
        sentences = re.split(r'(?<=[.!?।。！？])\s+', text)
        chunks = []
        current_chunk = ""
        for s in sentences:
            if len(current_chunk) + len(s) + 1 > max_chunk:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = s
            else:
                current_chunk += " " + s
        if current_chunk.strip():
            chunks.append(current_chunk.strip())

    translated_parts = []
    for chunk in chunks:
        try:
            result = GoogleTranslator(source=src, target=tgt).translate(chunk)
            if result:
                translated_parts.append(result)
            else:
                logger.warning("Translation returned empty, using original")
                translated_parts.append(chunk)
        except Exception as e:
            logger.error(f"Translation chunk failed: {e}")
            translated_parts.append(chunk)

    translated = " ".join(translated_parts)
    logger.info(f"Translation complete: {len(translated)} chars output")
    return translated


# ─── URL Article Extraction ───────────────────────────────────

def extract_article_from_url(url: str) -> Dict[str, str]:
    """
    Fetch a URL and extract the main article text using newspaper3k.
    Returns dict with keys: title, text, authors.
    """
    try:
        from newspaper import Article

        article = Article(url)
        article.download()
        article.parse()

        return {
            "title": article.title or "",
            "text": article.text or "",
            "authors": ", ".join(article.authors) if article.authors else "",
        }
    except Exception as e:
        logger.error(f"Article extraction failed for {url}: {e}")
        # Fallback with requests + BeautifulSoup
        try:
            import requests
            from bs4 import BeautifulSoup

            resp = requests.get(url, timeout=15, headers={
                "User-Agent": "Mozilla/5.0 (compatible; AISummarizer/1.0)"
            })
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")

            # Remove scripts and styles
            for tag in soup(["script", "style", "nav", "footer", "header"]):
                tag.decompose()

            title = soup.title.string if soup.title else ""
            paragraphs = soup.find_all("p")
            text = " ".join(p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 30)

            return {"title": title, "text": text, "authors": ""}
        except Exception as e2:
            logger.error(f"Fallback extraction also failed: {e2}")
            raise ValueError(f"Could not extract article from URL: {str(e)}")
