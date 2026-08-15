"""
BidShield AI — Engine 2: RAG Pipeline
Author: Siddhivinayak Waghmode

Orchestrates the full Layout-Aware RAG pipeline:
1. Parse PDFs → extract layout features
2. Generate embeddings (text + layout)
3. Store in vector database (FAISS)
4. Compare documents pairwise
5. Generate fraud flags and evidence
"""

from typing import List, Dict, Any
from .pdf_parser import PDFParser, DocumentFeatures
from .embeddings import EmbeddingGenerator, DocumentEmbedding
from .similarity import DocumentSimilarityEngine, SimilarityResult


class RAGPipeline:
    """
    Complete Layout-Aware RAG pipeline for document fraud detection.
    This is the main orchestrator for Engine 2.
    """

    def __init__(self):
        self.parser = PDFParser()
        self.embedder = EmbeddingGenerator()
        self.similarity_engine = DocumentSimilarityEngine()
        self.document_store: Dict[str, List[DocumentFeatures]] = {}  # tender_id → docs

    async def process_tender_documents(
        self, tender_id: str, pdf_paths: List[str]
    ) -> Dict[str, Any]:
        """
        Full pipeline: parse → embed → compare → flag.

        Args:
            tender_id: The tender these documents belong to
            pdf_paths: List of paths to uploaded vendor PDFs

        Returns:
            Complete analysis results with fraud flags
        """
        # Step 1: Parse all PDFs
        features_list = []
        for path in pdf_paths:
            features = self.parser.parse(path)
            features_list.append(features)

        self.document_store[tender_id] = features_list

        # Step 2: Generate embeddings for each document
        embeddings = []
        for features in features_list:
            full_text = " ".join(
                page.text_content for page in features.pages
            )
            layout_dict = {
                "fonts": list(features.unique_fonts),
                "table_count": features.total_tables,
                "page_count": features.page_count,
                "has_watermark": features.has_watermark,
            }
            embedding = self.embedder.generate_combined_embedding(
                full_text, layout_dict
            )
            embeddings.append(embedding)

        # Step 3: Pairwise comparison
        similarity_results = self.similarity_engine.compare_all(features_list)

        # Step 4: Identify document clusters (potential cartel groups)
        clusters = self.similarity_engine.identify_clusters(similarity_results)

        # Step 5: Build result
        return {
            "tender_id": tender_id,
            "documents_analyzed": len(pdf_paths),
            "comparisons_made": len(similarity_results),
            "suspicious_pairs": [
                r for r in similarity_results if r.is_suspicious
            ],
            "document_clusters": clusters,
            "engine": "Layout-Aware RAG (Engine 2)",
        }
