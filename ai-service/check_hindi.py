from deep_translator import GoogleTranslator
import sys

def test_translation():
    try:
        text = "This is a test summary."
        translated = GoogleTranslator(source="en", target="hi").translate(text)
        # Using repr to avoid encoding issues in terminal output
        print(f"Original: {text}")
        print(f"Translated (repr): {repr(translated)}")
        print(f"Success: {translated is not None and len(translated) > 0}")
    except Exception as e:
        print(f"Error during translation: {e}")

if __name__ == "__main__":
    test_translation()
