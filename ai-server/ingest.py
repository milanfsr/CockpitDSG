"""
ingest.py
Run once to process all PDFs in the documents/ folder and build the vector database.
Usage: python ingest.py
"""

import os
import chromadb
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer

DOCUMENTS_DIR = "documents"
CHROMA_DIR    = "chroma_db"
CHUNK_SIZE    = 800
CHUNK_OVERLAP = 150

def extract_text_from_pdf(filepath):
    reader = PdfReader(filepath)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text

def chunk_text(text, source):
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunk = text[start:end].strip()
        if chunk:
            chunks.append({
                "text":   chunk,
                "source": source,
                "start":  start,
            })
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks

def main():
    print("Loading embedding model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    print("Setting up ChromaDB...")
    client = chromadb.PersistentClient(path=CHROMA_DIR)

    try:
        client.delete_collection("regulations")
        print("Cleared existing collection.")
    except:
        pass

    collection = client.create_collection(
        name="regulations",
        metadata={"hnsw:space": "cosine"}
    )

    all_texts  = []
    all_ids    = []
    all_embeds = []
    all_meta   = []

    pdf_files = [f for f in os.listdir(DOCUMENTS_DIR) if f.lower().endswith(".pdf")]
    if not pdf_files:
        print(f"No PDF files found in {DOCUMENTS_DIR}/")
        return

    print(f"Found {len(pdf_files)} PDF(s): {pdf_files}")

    for pdf_file in pdf_files:
        filepath = os.path.join(DOCUMENTS_DIR, pdf_file)
        print(f"Processing {pdf_file}...")
        text = extract_text_from_pdf(filepath)
        print(f"  Extracted {len(text)} characters")
        chunks = chunk_text(text, pdf_file)
        print(f"  Created {len(chunks)} chunks")
        for i, chunk in enumerate(chunks):
            all_texts.append(chunk["text"])
            all_ids.append(f"{pdf_file}_{i}")
            all_meta.append({"source": chunk["source"], "start": chunk["start"]})

    if not all_texts:
        print("No text extracted from PDFs. Check your documents folder.")
        return

    print(f"\nEmbedding {len(all_texts)} chunks...")
    embeddings = model.encode(all_texts, show_progress_bar=True).tolist()

    print("Storing in ChromaDB...")
    batch_size = 200
    for i in range(0, len(all_texts), batch_size):
        collection.add(
            documents=all_texts[i:i+batch_size],        # store TEXT as documents
            embeddings=embeddings[i:i+batch_size],       # store embeddings separately
            ids=all_ids[i:i+batch_size],
            metadatas=all_meta[i:i+batch_size],
        )
        print(f"  Stored {min(i+batch_size, len(all_texts))}/{len(all_texts)}")

    print(f"\nDone. {collection.count()} chunks indexed in {CHROMA_DIR}/")

if __name__ == "__main__":
    main()
