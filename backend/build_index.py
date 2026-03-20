"""Build FAISS index from agri_docs_sample.csv."""
import os
import pickle
import pandas as pd
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "agri_docs_sample.csv")
INDEX_DIR = os.path.join(os.path.dirname(__file__), "data")

def build():
    print("Loading CSV…")
    df = pd.read_csv(DATA_PATH)
    texts = df["content"].tolist()

    print("Computing embeddings with all-MiniLM-L6-v2…")
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    embeddings = model.encode(texts, show_progress_bar=True, normalize_embeddings=True)
    embeddings = np.array(embeddings, dtype="float32")

    print(f"Building FAISS index ({embeddings.shape})…")
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    faiss.write_index(index, os.path.join(INDEX_DIR, "faiss.index"))
    with open(os.path.join(INDEX_DIR, "documents.pkl"), "wb") as f:
        pickle.dump(df.to_dict("records"), f)

    print("✅ Index saved to data/faiss.index & data/documents.pkl")

if __name__ == "__main__":
    build()
