"""
Automated Test Suite for Engine 2: Layout-Aware RAG Pipeline
Author: Siddhivinayak Waghmode

Tests:
1. PyMuPDF parsing of layout, font families, and table structures
2. Pairwise cross-document similarity between cartel documents (TechNova vs Digital Infra)
3. Independence verification for genuine bidders (TechNova vs CompuWorld)
4. Cartel cluster discovery and collusion flag validation
"""

import os
import sys

SERVER_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

from core.document_engine.rag_pipeline import RAGPipeline


def test_rag_pipeline():
    sample_dir = os.path.join(SERVER_DIR, "docs", "sample_data")
    doc1 = os.path.join(sample_dir, "TechNova_Proposal.pdf")
    doc2 = os.path.join(sample_dir, "DigitalInfra_CoverBid.pdf")
    doc3 = os.path.join(sample_dir, "CompuWorld_Independent.pdf")

    assert os.path.exists(doc1), f"Missing {doc1}"
    assert os.path.exists(doc2), f"Missing {doc2}"
    assert os.path.exists(doc3), f"Missing {doc3}"

    print("=" * 70)
    print("RUNNING DEVNEUXUS ENGINE 2 (LAYOUT-AWARE RAG) TEST SUITE")
    print("=" * 70)

    pipeline = RAGPipeline()
    tender_id = "tender-2026-001"
    pdf_paths = [doc1, doc2, doc3]

    results = pipeline.process_tender_documents(tender_id, pdf_paths)

    print(f"\n[+] Tender ID: {results['tender_id']}")
    print(f"[+] Total Documents Parsed: {results['documents_analyzed']}")
    print(f"[+] Pairwise Comparisons: {results['comparisons_made']}")
    print(f"[+] Suspicious Pairs Flagged: {results['suspicious_pairs_count']}")
    print(f"[+] Cartel Ring Clusters Detected: {results['cartel_clusters']}")

    print("\n" + "-" * 70)
    print("PAIRWISE SIMILARITY MATRIX")
    print("-" * 70)

    cartel_pair_found = False
    independent_pairs_clean = True

    for p in results['document_pairs']:
        status_flag = "[!] COLLUSION FLAGGED" if p['is_suspicious'] else "[OK] CLEAN / INDEPENDENT"
        print(f"\nPair: {p['doc_a']} <--> {p['doc_b']} => {status_flag}")
        print(f"  * Overall Similarity Score: {p['overall_score'] * 100:.1f}%")
        print(f"  * Text Similarity:          {p['text_similarity'] * 100:.1f}%")
        print(f"  * Font Match Ratio:         {p['font_match_ratio'] * 100:.1f}%")
        print(f"  * Table Structure Match:    {p['table_structure_match'] * 100:.1f}%")
        print(f"  * Boilerplate Overlap:      {p['boilerplate_overlap'] * 100:.1f}%")
        print(f"  * Watermark Match:          {'YES' if p['watermark_match'] else 'NO'}")
        print(f"  * Matching Paragraphs:      {len(p['flagged_sections'])} snippets")

        # Validation assertions
        if "TechNova" in p['doc_a'] and "DigitalInfra" in p['doc_b']:
            assert p['is_suspicious'] == True, "Cartel pair was not flagged!"
            assert p['overall_score'] >= 0.70, "Cartel similarity score too low!"
            cartel_pair_found = True

        if "CompuWorld" in p['doc_a'] or "CompuWorld" in p['doc_b']:
            if p['is_suspicious']:
                independent_pairs_clean = False

    assert cartel_pair_found, "Failed to detect TechNova + Digital Infra cartel pair!"
    assert independent_pairs_clean, "False positive detected on CompuWorld independent proposal!"

    print("\n" + "=" * 70)
    print("ALL TESTS PASSED! ENGINE 2 RAG ACCURATELY DETECTED THE CARTEL RING!")
    print("=" * 70)


if __name__ == "__main__":
    test_rag_pipeline()
