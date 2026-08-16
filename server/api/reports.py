"""
BidShield AI — API Routes: Reports
Generates compliance reports and fraud summaries for auditors.
"""

import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/reports", tags=["reports"])

API_BASE_URL = "http://localhost:8000"


@router.get("/fraud-summary/{tender_id}")
async def get_fraud_summary(tender_id: str):
    """Generate a combined fraud report from both engines."""
    try:
        async with httpx.AsyncClient() as client:
            # Fetch document analysis results (Engine 2)
            doc_response = await client.get(
                f"{API_BASE_URL}/api/documents/compare/{tender_id}",
                timeout=30.0
            )
            doc_results = doc_response.json() if doc_response.status_code == 200 else None

            # Fetch bid analysis results (Engine 1)
            bid_response = await client.get(
                f"{API_BASE_URL}/api/bids/analyze/{tender_id}",
                timeout=30.0
            )
            bid_results = bid_response.json() if bid_response.status_code == 200 else None

        # Extract scores from both engines
        engine1_score = 0.0
        engine2_score = 0.0
        recommendation = "PROCEED"
        halt_award = False

        # Engine 2 (Document Analysis) scoring
        if doc_results and doc_results.get("status") != "no_documents":
            max_similarity = doc_results.get("max_document_similarity", 0.0)
            suspicious_count = doc_results.get("suspicious_pairs_count", 0)
            documents_count = doc_results.get("documents_analyzed", 0)

            # Higher similarity and more suspicious documents = higher fraud score
            if documents_count >= 2:
                engine2_score = min(0.99, max_similarity * 0.8 + (suspicious_count / documents_count) * 0.2)

        # Engine 1 (Bid Analysis) scoring
        if bid_results and bid_results.get("status") != "analysis_pending":
            # Placeholder for Engine 1 results; to be filled by Prathamesh/Mansi
            engine1_score = bid_results.get("anomaly_score", 0.0)

        # Combined probability: weighted average
        combined_fraud_probability = (engine1_score * 0.4 + engine2_score * 0.6)

        # Recommendation logic
        if combined_fraud_probability > 0.85:
            recommendation = "HALT_AWARD"
            halt_award = True
        elif combined_fraud_probability > 0.70:
            recommendation = "MANUAL_REVIEW_CCI"
        elif combined_fraud_probability > 0.50:
            recommendation = "FLAG_FOR_MONITORING"
        else:
            recommendation = "PROCEED"

        return {
            "tender_id": tender_id,
            "report": {
                "engine1_score": round(engine1_score, 4),
                "engine2_score": round(engine2_score, 4),
                "combined_fraud_probability": round(combined_fraud_probability, 4),
                "recommendation": recommendation,
                "halt_award": halt_award,
                "engine1_details": bid_results,
                "engine2_details": doc_results,
            },
            "message": "Report generated successfully",
            "timestamp": str(__import__('datetime').datetime.utcnow()),
        }

    except Exception as e:
        return {
            "tender_id": tender_id,
            "report": {
                "engine1_score": 0.0,
                "engine2_score": 0.0,
                "combined_fraud_probability": 0.0,
                "recommendation": "ERROR",
                "halt_award": False,
            },
            "message": f"Error generating report: {str(e)}",
            "error": str(e),
        }


@router.get("/dashboard-stats")
async def get_dashboard_stats():
    """Return aggregate statistics for the compliance dashboard."""
    # TODO: Query database for aggregate stats
    return {
        "total_tenders_analyzed": 0,
        "fraud_detected": 0,
        "money_saved_estimate": 0,
        "active_alerts": 0,
        "recent_flags": [],
    }
