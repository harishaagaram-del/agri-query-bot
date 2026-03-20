"""FastAPI backend for AgriVoice RAG advisory system."""
import os
import logging
import pickle
from datetime import datetime

import faiss
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from transformers import pipeline

# --- Logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("query_log.txt", mode="a")],
)
logger = logging.getLogger("agrivoice")

# --- Config ---
INDEX_PATH = os.path.join(os.path.dirname(__file__), "data", "faiss.index")
DOCS_PATH = os.path.join(os.path.dirname(__file__), "data", "documents.pkl")
TOP_K = 3

# --- Load models & data ---
logger.info("Loading sentence-transformer model…")
embed_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

logger.info("Loading FAISS index…")
if not os.path.exists(INDEX_PATH):
    raise RuntimeError("FAISS index not found. Run: python build_index.py")
index = faiss.read_index(INDEX_PATH)

with open(DOCS_PATH, "rb") as f:
    documents = pickle.load(f)

logger.info("Loading flan-t5-small for generation…")
generator = pipeline("text2text-generation", model="google/flan-t5-small", max_new_tokens=200)

# --- App ---
app = FastAPI(title="AgriVoice API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    answer: str
    sources: list[str]


@app.get("/health")
def health():
    return {"status": "ok", "documents": len(documents)}


@app.post("/query", response_model=QueryResponse)
def query(req: QueryRequest):
    question = req.question.strip()
    if not question:
        raise HTTPException(400, "Question cannot be empty")

    logger.info(f"QUERY: {question}")

    # Embed question
    q_vec = embed_model.encode([question], normalize_embeddings=True).astype("float32")

    # Search FAISS
    scores, indices = index.search(q_vec, TOP_K)
    retrieved = [documents[i] for i in indices[0] if i < len(documents)]
    sources = list({doc["source"] for doc in retrieved})

    # Build prompt
    context = "\n\n".join(
        f"[{doc['source']}] {doc['content']}" for doc in retrieved
    )
    prompt = (
        f"You are an agriculture expert. Based on the following information, "
        f"answer the farmer's question concisely.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {question}\n\n"
        f"Answer:"
    )

    # Generate
    result = generator(prompt)[0]["generated_text"]
    answer = result.strip()

    logger.info(f"ANSWER: {answer} | SOURCES: {sources}")

    return QueryResponse(answer=answer, sources=sources)
