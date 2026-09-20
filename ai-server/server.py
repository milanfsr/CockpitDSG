import os
import json
import traceback
import chromadb
import anthropic
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

CHROMA_DIR = "chroma_db"
TOP_K      = 8

print("Loading embedding model...")
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

print("Connecting to ChromaDB...")
chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
try:
    collection = chroma_client.get_collection("regulations")
    print(f"Loaded regulation collection ({collection.count()} chunks)")
except Exception as e:
    print(f"WARNING: Could not load regulation collection: {e}")
    print("Run ingest.py first to build the vector database.")
    collection = None

print("Initialising Anthropic client...")
claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SURVEY_SUMMARY = """
Survey conducted with aviation professionals and students.
Key findings:
- Overhead panel strongly preferred for fuel, electrical, hydraulic, pressurization, and bleed air systems.
- Glareshield strongly preferred for autoflight controls and master warning/caution buttons.
- Center pedestal preferred for communication radios, transponder, TCAS, FMS entry.
- Main instrument panel expected for primary flight displays (PFD, ND, ECAM).
- Physical buttons strongly preferred for safety-critical and emergency systems.
- Touchscreen acceptable for information/monitoring displays and non-critical controls.
- Display systems (PFD, ND, ECAM) considered standardised in position by most respondents.
"""

def retrieve_regulations(query_text, top_k=TOP_K):
    if collection is None or collection.count() == 0:
        return []
    try:
        query_embedding = embed_model.encode([query_text]).tolist()[0]
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, collection.count()),
        )
        chunks = []
        for i, doc in enumerate(results["documents"][0]):
            meta = results["metadatas"][0][i]
            chunks.append(f"[Source: {meta['source']}]\n{doc}")
        return chunks
    except Exception as e:
        print(f"Regulation retrieval error: {e}")
        return []

def build_prompt(layout, regulation_chunks):
    layout_summary    = json.dumps(layout, indent=2)
    regulations_text  = "\n\n---\n\n".join(regulation_chunks) if regulation_chunks \
        else "No regulation documents loaded yet — provide general aviation human factors guidance."

    return f"""You are an expert cockpit design reviewer with deep knowledge of aviation human factors,
CS-25/FAR Part 25 airworthiness regulations, and cockpit ergonomics standards.

## Current Cockpit Layout
{layout_summary}

## Relevant Regulation Excerpts
{regulations_text}

## Pilot Survey Summary
{SURVEY_SUMMARY}

## Your Task
Review the cockpit layout and provide specific, actionable feedback. For each issue:
1. Identify the system or panel affected
2. Describe the issue clearly
3. Suggest what should be changed
4. Rate severity: HIGH (safety/regulatory), MEDIUM (ergonomic/convention), LOW (preference)

Focus on:
- Regulation violations (CS 25.1302, 25.1321, 25.1322, 25.777)
- Systems placed in unexpected zones compared to pilot survey data
- Emergency/safety-critical systems using touchscreen (should be physical buttons)
- Reach and visibility concerns

Respond ONLY with a valid JSON array, no other text:
[
  {{
    "system_id": "system_id_here",
    "system_name": "Human readable name",
    "severity": "HIGH",
    "issue": "Description of the problem",
    "suggestion": "What to do",
    "regulation_ref": "CS 25.XXXX or null"
  }}
]

If no issues found, return: []
"""

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "db_loaded": collection is not None,
        "chunks": collection.count() if collection else 0,
    })

@app.route("/feedback", methods=["POST"])
def feedback():
    raw = ""
    try:
        body   = request.get_json(force=True)
        layout = body.get("layout", body)  # handle both wrapped and unwrapped

        systems_in_layout = []
        for panel in layout.get("panels", []):
            for sys in panel.get("systems", []):
                systems_in_layout.append(
                    f"{sys.get('system_name', sys.get('system_id',''))} on {panel.get('panel_id','')}"
                )

        query = f"cockpit placement regulations {' '.join(systems_in_layout[-3:])}"
        regulation_chunks = retrieve_regulations(query)

        prompt   = build_prompt(layout, regulation_chunks)
        response = claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
        )

        raw = response.content[0].text.strip()

        # Strip markdown fences
        if "```" in raw:
            parts = raw.split("```")
            for part in parts:
                stripped = part.strip()
                if stripped.startswith("[") or stripped.startswith("json\n["):
                    raw = stripped.replace("json\n", "").strip()
                    break

        feedback_items = json.loads(raw)
        return jsonify({
            "feedback":    feedback_items,
            "chunks_used": len(regulation_chunks),
        })

    except Exception as e:
        print(f"ERROR in /feedback: {e}")
        print(traceback.format_exc())
        return jsonify({"error": str(e), "raw": raw}), 500

@app.route("/chat", methods=["POST"])
def chat():
    try:
        body    = request.get_json(force=True)
        message = body.get("message", "")
        layout  = body.get("layout", {})

        regulation_chunks = retrieve_regulations(message)
        context = f"""Current cockpit layout: {json.dumps(layout)}
Relevant regulations: {chr(10).join(regulation_chunks)}
Pilot survey summary: {SURVEY_SUMMARY}"""

        response = claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=800,
            system="""You are a cockpit design assistant with expertise in aviation regulations
and human factors. Answer questions about the current cockpit layout concisely.
Reference specific regulations when relevant. Keep responses under 150 words.""",
            messages=[{"role": "user", "content": f"{context}\n\nDesigner question: {message}"}],
        )
        return jsonify({"reply": response.content[0].text.strip()})

    except Exception as e:
        print(f"ERROR in /chat: {e}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("\nCockpit AI Server starting on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
