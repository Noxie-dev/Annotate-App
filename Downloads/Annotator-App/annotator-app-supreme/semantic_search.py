from sentence_transformers import SentenceTransformer
import psycopg2
from pgvector.psycopg2 import register_vector

# Load local sentence embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")  # 384-dim vectors

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="annotator_dev",
    user="k-is-for-krwele",
    password="yourpass",  # 🔐 Use dotenv or input() for production
    host="127.0.0.1",
    port=5432
)
register_vector(conn)
cur = conn.cursor()

# ========== INSERT EXAMPLES ==========

def insert_document(text):
    vector = model.encode(text).tolist()
    cur.execute(
        "INSERT INTO documents (content, embedding) VALUES (%s, %s)",
        (text, vector)
    )
    conn.commit()
    print(f"✅ Inserted: {text}")

# ========== SEARCH EXAMPLES ==========

def search_similar(text, top_k=3):
    vector = model.encode(text).tolist()
    cur.execute(
    "SELECT content FROM documents ORDER BY embedding <-> %s::vector LIMIT %s",
    (vector, top_k)
)

    results = cur.fetchall()
    print("🔍 Search results:")
    for row in results:
        print(f"- {row[0]}")

# ========== DEMO RUN ==========

if __name__ == "__main__":
    insert_document("The quick brown fox jumps over the lazy dog.")
    insert_document("A fast animal leaped over a sleeping canine.")
    insert_document("The rain in Spain falls mainly on the plain.")

    search_similar("A fast fox jumping")
    
    cur.close()
    conn.close()
