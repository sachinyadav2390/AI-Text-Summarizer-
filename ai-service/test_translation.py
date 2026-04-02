import logging
from engine import translate_text

logging.basicConfig(level=logging.INFO)

def test_hindi_translation():
    text = "Hello, how are you? This is a test for English to Hindi translation."
    print(f"Original: {text}")
    try:
        translated = translate_text(text, "en", "hi")
        print(f"Translated (Hindi): {translated}")
    except Exception as e:
        print(f"Translation failed: {e}")

if __name__ == "__main__":
    test_hindi_translation()
