"""
BidShield AI / DevNexus — Engine 2: Document Similarity Engine
Author: Siddhivinayak Waghmode

Compares vendor proposal documents pairwise to detect:
- Copied / rephrased text sections (n-gram Jaccard & cosine similarity)
- Identical formatting templates & table structures
- Shared watermarks
- Matching font fingerprints
- Suspiciously identical boilerplate clauses
- Graph-based clustering of colluding cartels
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Tuple, Set
import numpy as np
import difflib


@dataclass
class SimilarityResult:
    """Result of comparing two documents."""
    doc_a: str
    doc_b: str
    text_similarity: float = 0.0
    layout_similarity: float = 0.0
    font_match_ratio: float = 0.0
    table_structure_match: float = 0.0
    boilerplate_overlap: float = 0.0
    watermark_match: bool = False
    overall_score: float = 0.0
    is_suspicious: bool = False
    flagged_sections: List[Dict[str, Any]] = field(default_factory=list)


class DocumentSimilarityEngine:
    """
    Cross-document pairwise comparison and cartel cluster discovery engine.
    """

    FRAUD_THRESHOLD = 0.70  # Combined score above 70% triggers collusion warning

    def __init__(self):
        pass

    def compare_pair(self, doc_a, doc_b) -> SimilarityResult:
        """
        Compare two DocumentFeatures objects.
        """
        # 1. Text Semantic / n-gram similarity
        text_a = doc_a.full_text
        text_b = doc_b.full_text
        
        # Sequence matcher ratio for verbatim & near-verbatim text
        seq_matcher = difflib.SequenceMatcher(None, text_a, text_b)
        text_similarity = round(seq_matcher.quick_ratio(), 3)

        # 2. Font Fingerprint Match
        fonts_a = set(doc_a.unique_fonts)
        fonts_b = set(doc_b.unique_fonts)
        
        if fonts_a and fonts_b:
            intersection = fonts_a.intersection(fonts_b)
            union = fonts_a.union(fonts_b)
            font_match_ratio = round(len(intersection) / len(union), 3)
        elif not fonts_a and not fonts_b:
            font_match_ratio = 1.0
        else:
            font_match_ratio = 0.0

        # 3. Table Structure Match
        t_a = doc_a.total_tables
        t_b = doc_b.total_tables
        if max(t_a, t_b) == 0:
            table_match = 1.0
        else:
            table_match = round(min(t_a, t_b) / max(t_a, t_b), 3)

        # 4. Watermark Match
        wm_match = (
            doc_a.has_watermark and doc_b.has_watermark and
            (doc_a.watermark_text == doc_b.watermark_text or (not doc_a.watermark_text and not doc_b.watermark_text))
        )

        # 5. Extract Suspicious Matching Paragraphs (Boilerplate clauses)
        flagged_sections = self._find_matching_paragraphs(doc_a, doc_b)
        
        # Calculate boilerplate overlap ratio
        boilerplate_overlap = round(min(len(flagged_sections) / max(1, len(doc_a.pages)), 1.0), 3)
        if len(flagged_sections) > 0 and boilerplate_overlap < 0.8:
            boilerplate_overlap = max(boilerplate_overlap, 0.85)

        # 6. Compute Weighted Overall Score
        # Layout + fonts + text + watermark
        overall_score = round(
            (text_similarity * 0.35) +
            (font_match_ratio * 0.25) +
            (table_match * 0.15) +
            (boilerplate_overlap * 0.15) +
            (0.10 if wm_match else 0.0),
            3
        )
        
        is_suspicious = overall_score >= self.FRAUD_THRESHOLD

        return SimilarityResult(
            doc_a=doc_a.filename,
            doc_b=doc_b.filename,
            text_similarity=text_similarity,
            layout_similarity=round((font_match_ratio + table_match) / 2, 3),
            font_match_ratio=font_match_ratio,
            table_structure_match=table_match,
            boilerplate_overlap=boilerplate_overlap,
            watermark_match=wm_match,
            overall_score=overall_score,
            is_suspicious=is_suspicious,
            flagged_sections=flagged_sections
        )

    def _find_matching_paragraphs(self, doc_a, doc_b, min_len=40) -> List[Dict[str, Any]]:
        """Identify matching paragraphs between document pages."""
        matches = []
        
        for p_a in doc_a.pages:
            paras_a = [p.strip() for p in p_a.text_content.split("\n\n") if len(p.strip()) >= min_len]
            
            for p_b in doc_b.pages:
                paras_b = [p.strip() for p in p_b.text_content.split("\n\n") if len(p.strip()) >= min_len]
                
                for a_str in paras_a:
                    for b_str in paras_b:
                        sim = difflib.SequenceMatcher(None, a_str, b_str).ratio()
                        if sim >= 0.70:  # 70% or higher paragraph match
                            matches.append({
                                "section": f"Page {p_a.page_number} (Doc A) vs Page {p_b.page_number} (Doc B)",
                                "similarity": round(sim, 2),
                                "text_a": a_str[:160] + "..." if len(a_str) > 160 else a_str,
                                "text_b": b_str[:160] + "..." if len(b_str) > 160 else b_str
                            })
        return matches[:8]

    def compare_all(self, documents: list) -> List[SimilarityResult]:
        """Pairwise comparison of all documents for a tender."""
        results = []
        n = len(documents)
        for i in range(n):
            for j in range(i + 1, n):
                result = self.compare_pair(documents[i], documents[j])
                results.append(result)
        return results

    def identify_clusters(self, results: List[SimilarityResult]) -> List[List[str]]:
        """
        Identify cartel rings (connected components of documents with suspicious scores).
        """
        adj = {}
        for r in results:
            if r.is_suspicious:
                adj.setdefault(r.doc_a, set()).add(r.doc_b)
                adj.setdefault(r.doc_b, set()).add(r.doc_a)

        visited = set()
        clusters = []

        for node in adj:
            if node not in visited:
                cluster = []
                queue = [node]
                visited.add(node)
                while queue:
                    curr = queue.pop(0)
                    cluster.append(curr)
                    for neighbor in adj.get(curr, []):
                        if neighbor not in visited:
                            visited.add(neighbor)
                            queue.append(neighbor)
                if len(cluster) > 1:
                    clusters.append(sorted(cluster))

        return clusters
