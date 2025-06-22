import os
from pdfminer.high_level import extract_text
from sentence_transformers import SentenceTransformer
import psycopg2
from pgvector.psycopg2 import register_vector
from nltk.tokenize import sent_tokenize

# ✅ Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# ✅ Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="annotator_dev",
    user="k-is-for-krwele",
    password="yourpass",
    host="127.0.0.1",
    port=5432
)
register_vector(conn)
cur = conn.cursor()

# ✅ Ensure table exists
cur.execute("""
CREATE TABLE IF NOT EXISTS chunks (
    id serial PRIMARY KEY,
    content text,
    embedding vector(384)
);
""")
conn.commit()

# ✅ Split text into manageable chunks (~3–5 sentences per)
def chunk_text(text, chunk_size=3):
    sentences = sent_tokenize(text)
    return [" ".join(sentences[i:i+chunk_size]) for i in range(0, len(sentences), chunk_size)]

# ✅ Process PDF and store chunks
def index_pdf(filepath):
    print(f"📄 Processing: {filepath}")
    text = extract_text(filepath)
    chunks = chunk_text(text)

    for chunk in chunks:
        embedding = model.encode(chunk).tolist()
        cur.execute(
            "INSERT INTO chunks (content, embedding) VALUES (%s, %s)",
            (chunk, embedding)
        )
    conn.commit()
    print(f"✅ Indexed {len(chunks)} chunks.")

# ✅ Search
def search(query, top_k=3):
    embedding = model.encode(query).tolist()
    cur.execute(
        "SELECT content FROM chunks ORDER BY embedding <-> %s::vector LIMIT %s",
        (embedding, top_k)
    )
    results = cur.fetchall()
    print("\n🔍 Results:")
    for row in results:
        print(f"- {row[0]}\n")

# ✅ Example usage
if __name__ == "__main__":
    index_pdf("your-document.pdf")  # 👈 Replace with actual path
    search("What is the main idea?")
    cur.close()
    conn.close()
