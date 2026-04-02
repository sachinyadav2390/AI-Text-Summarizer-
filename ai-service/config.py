"""
Configuration for the AI Summarization Engine.
Defines available models, their parameters, and length presets.
"""

from dataclasses import dataclass, field
from typing import Dict


# ─── Model Registry ───────────────────────────────────────────

@dataclass
class ModelConfig:
    """Configuration for a single Transformer model."""
    name: str
    model_id: str
    description: str
    max_input_tokens: int
    default_max_length: int
    default_min_length: int


# All supported models
MODELS: Dict[str, ModelConfig] = {
    "bart": ModelConfig(
        name="DistilBART",
        model_id="sshleifer/distilbart-cnn-12-6",
        description="Distilled BART — significantly faster on CPU",
        max_input_tokens=1024,
        default_max_length=150,
        default_min_length=40,
    ),
    "t5": ModelConfig(
        name="T5",
        model_id="t5-small",
        description="Google T5 — lightweight, fast, good accuracy",
        max_input_tokens=512,
        default_max_length=150,
        default_min_length=30,
    ),
    "pegasus": ModelConfig(
        name="Pegasus",
        model_id="google/pegasus-xsum",
        description="Google Pegasus — excellent for abstractive single-doc summaries",
        max_input_tokens=512,
        default_max_length=128,
        default_min_length=20,
    ),
}

DEFAULT_MODEL = "t5"


# ─── Summary Length Presets ────────────────────────────────────

@dataclass
class LengthPreset:
    """Token length range for a summary length option."""
    min_length: int
    max_length: int
    num_beams: int
    length_penalty: float


LENGTH_PRESETS: Dict[str, Dict[str, LengthPreset]] = {
    # Per-model length presets
    "bart": {
        "short":  LengthPreset(min_length=20,  max_length=60,  num_beams=2, length_penalty=1.0),
        "medium": LengthPreset(min_length=50,  max_length=150, num_beams=2, length_penalty=1.0),
        "long":   LengthPreset(min_length=100, max_length=300, num_beams=2, length_penalty=1.2),
    },
    "t5": {
        "short":  LengthPreset(min_length=15,  max_length=50,  num_beams=2, length_penalty=0.8),
        "medium": LengthPreset(min_length=40,  max_length=130, num_beams=2, length_penalty=1.0),
        "long":   LengthPreset(min_length=80,  max_length=250, num_beams=2, length_penalty=1.2),
    },
    "pegasus": {
        "short":  LengthPreset(min_length=10,  max_length=40,  num_beams=2, length_penalty=0.8),
        "medium": LengthPreset(min_length=30,  max_length=100, num_beams=2, length_penalty=1.0),
        "long":   LengthPreset(min_length=60,  max_length=200, num_beams=2, length_penalty=1.2),
    },
}


# ─── Server Config ─────────────────────────────────────────────

HOST = "0.0.0.0"
PORT = 8000
