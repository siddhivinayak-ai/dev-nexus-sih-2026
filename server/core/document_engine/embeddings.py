"""
BidShield AI / DevNexus — Engine 2: Document Embeddings
Author: Siddhivinayak Waghmode

Generates semantic embeddings for text and structural layout vectors for document formatting.
Supports sentence-transformers when present, and includes high-efficiency TF-IDF/n-gram
vectorization with layout-feature normalization for ultra-fast local evaluation.
"""

from dataclasses import dataclass
from typing import Optional, Dict, Any, List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer


@dataclass
class DocumentEmbedding:
    """Embedding representation of a document."""
    filename: str
    text_embedding: Optional[np.ndarray] = None
    layout_embedding: Optional[np.ndarray] = None
    combined_embedding: Optional[np.ndarray] = None
    embedding_model: str = "tfidf-layout-hybrid"


class EmbeddingGenerator:
    """
    Generates embeddings for document text and structural layout features.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.st_model = None
        self._has_tried_st = False

    def _get_sentence_transformer(self):
        if not self._has_tried_st:
            self._has_tried_st = True
            try:
                from sentence_transformers import SentenceTransformer
                self.st_model = SentenceTransformer(self.model_name)
            except Exception:
                self.st_model = None
        return self.st_model

    def generate_text_embedding(self, text: str, corpus: Optional[List[str]] = None) -> np.ndarray:
        """
        Generate semantic embedding from text.
        Uses sentence-transformers if available, else TF-IDF n-gram vectorizer.
        """
        st = self._get_sentence_transformer()
        if st is not None:
            emb = st.encode(text)
            norm = np.linalg.norm(emb)
            return emb / norm if norm > 0 else emb

        # Fallback to high-performance char+word n-gram TF-IDF vectorization
        all_texts = corpus if corpus else [text]
        if text not in all_texts:
            all_texts = [text] + all_texts

        vectorizer = TfidfVectorizer(ngram_range=(1, 3), max_features=384)
        vectorizer.fit(all_texts)
        vec = vectorizer.transform([text]).toarray()[0]
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else vec

    def generate_layout_embedding(self, layout_features: Dict[str, Any]) -> np.ndarray:
        """
        Generate a standardized layout vector representing:
        - Font fingerprint distribution
        - Table counts and page counts
        - Presence of watermarks and images
        """
        vector = []
        
        # 1. Basic structural counts
        vector.append(min(layout_features.get("page_count", 1) / 50.0, 1.0))
        vector.append(min(layout_features.get("table_count", 0) / 20.0, 1.0))
        vector.append(min(layout_features.get("image_count", 0) / 20.0, 1.0))
        vector.append(1.0 if layout_features.get("has_watermark", False) else 0.0)

        # 2. Font signature hash bins (32-dim fixed projection)
        font_bins = np.zeros(32)
        for font in layout_features.get("fonts", []):
            bin_idx = hash(font) % 32
            font_bins[bin_idx] += 1.0
        
        font_norm = np.linalg.norm(font_bins)
        if font_norm > 0:
            font_bins = font_bins / font_norm

        combined = np.concatenate([np.array(vector), font_bins])
        norm = np.linalg.norm(combined)
        return combined / norm if norm > 0 else combined

    def generate_combined_embedding(
        self,
        text: str,
        layout_features: Dict[str, Any],
        text_weight: float = 0.4,
        layout_weight: float = 0.6,
        corpus: Optional[List[str]] = None
    ) -> DocumentEmbedding:
        """
        Combine text and layout embeddings into a single hybrid vector.
        """
        text_emb = self.generate_text_embedding(text, corpus=corpus)
        layout_emb = self.generate_layout_embedding(layout_features)

        # Equalize dimensions for weighted sum or concatenate
        dim = max(len(text_emb), len(layout_emb))
        t_pad = np.pad(text_emb, (0, max(0, dim - len(text_emb))))
        l_pad = np.pad(layout_emb, (0, max(0, dim - len(layout_emb))))

        combined = (text_weight * t_pad) + (layout_weight * l_pad)
        norm = np.linalg.norm(combined)
        combined_norm = combined / norm if norm > 0 else combined

        return DocumentEmbedding(
            filename=layout_features.get("filename", "unknown"),
            text_embedding=text_emb,
            layout_embedding=layout_emb,
            combined_embedding=combined_norm
        )
