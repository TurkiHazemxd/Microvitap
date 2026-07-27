import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(__file__)
dataset_path = os.path.join(BASE_DIR, "data", "dataset.json")

# Load dataset with error handling
try:
    with open(dataset_path, "r", encoding="utf-8") as f:
        DATASET = json.load(f)
        print("✅ Dataset loaded successfully")
except FileNotFoundError:
    print(f"❌ Dataset not found at {dataset_path}")
    DATASET = {"knowledge": {}}
except json.JSONDecodeError as e:
    print(f"❌ Invalid JSON in dataset: {e}")
    DATASET = {"knowledge": {}}

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def safe_get(data, keys, default=None):
    """Safely get nested dictionary values"""
    for key in keys:
        if isinstance(data, dict):
            data = data.get(key, {})
        else:
            return default
    return data if data else default

def build_context(lang: str = "en") -> str:
    knowledge = DATASET.get("knowledge", {}).get(lang, {})
    
    # Safely get each section with fallbacks
    general = knowledge.get('general', 'Microgreens are young vegetable greens harvested just after the first true leaves appear.')
    varieties = knowledge.get('varieties', {})
    growing = knowledge.get('growing', {})
    nutrition = knowledge.get('nutrition', {})
    troubleshooting = knowledge.get('troubleshooting', {})
    
    context = f"""
GENERAL OVERVIEW:
{general}

VARIETIES:
{json.dumps(varieties, indent=2) if varieties else '{}'}

GROWING GUIDE:
{json.dumps(growing, indent=2) if growing else '{}'}

NUTRITION:
{json.dumps(nutrition, indent=2) if nutrition else '{}'}

TROUBLESHOOTING:
{json.dumps(troubleshooting, indent=2) if troubleshooting else '{}'}
"""
    return context

def build_system_prompt(lang: str = "en") -> str:
    context = build_context(lang)

    if lang == "fr":
        return f"""Tu es un assistant expert en micropousses, amical et pédagogue.
Tu réponds TOUJOURS en français, de manière claire et précise.
Tu te souviens de tout ce qui a été dit dans la conversation.
Tu t'appuies sur les connaissances suivantes :

{context}

Règles :
- Réponds uniquement aux questions liées aux micropousses.
- Si une question est hors sujet, redirige poliment.
- Sois précis, pratique et encourageant."""

    return f"""You are a friendly and knowledgeable microgreens expert assistant.
You ALWAYS respond in English, clearly and precisely.
You remember everything said in the conversation so far.
You use the following knowledge base to answer accurately:

{context}

Rules:
- dont put asterisk in the answers.
- don't give long answers unless required to.
- Only answer questions related to microgreens.
- If a question is off-topic, politely redirect.
- Be practical, specific, and encouraging."""

def get_llm_answer(user_message: str, history: list, lang: str = "en") -> tuple[str, list]:
    """
    user_message: the new message from the user
    history: list of previous messages [{"role": "user/assistant", "content": "..."}]
    
    Returns the answer AND the updated history.
    """
    try:
        messages = [
            {"role": "system", "content": build_system_prompt(lang)}
        ]
        messages.extend(history)
        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=600,
        )
        answer = response.choices[0].message.content

        history.append({"role": "user", "content": user_message})
        history.append({"role": "assistant", "content": answer})

        return answer, history

    except Exception as e:
        print(f"❌ Error in get_llm_answer: {e}")
        error_msg = ("Désolé, problème technique. Réessayez."
                     if lang == "fr"
                     else "Sorry, technical issue. Please try again.")
        return error_msg, history