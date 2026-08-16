"""
BidShield AI / DevNexus — API Routes: Documents
Author: Siddhivinayak Waghmode
Handles PDF upload, feature extraction, and cross-document comparison via Layout-Aware RAG.
"""

import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from pydantic import BaseModel
from core.document_engine.rag_pipeline import RAGPipeline
from core.document_engine.pdf_parser import PDFParser

router = APIRouter(prefix="/api/documents", tags=["documents"])

# Global RAG orchestrator instance
rag_pipeline = RAGPipeline()
pdf_parser = PDFParser()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class DocumentComparisonResult(BaseModel):
    tender_id: str
    document_pairs: list
    cartel_clusters: list
    overall_fraud_probability: float
    details: dict


@router.post("/upload/{tender_id}")
async def upload_vendor_pdf(tender_id: str, files: List[UploadFile] = File(...)):
    """
    Upload one or more vendor proposal PDFs for a specific tender and save to storage.
    """
    tender_upload_dir = os.path.join(UPLOAD_DIR, tender_id)
    os.makedirs(tender_upload_dir, exist_ok=True)

    uploaded = []
    for file in files:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail=f"Only PDF files are accepted. Got: {file.filename}",
            )
        
        file_path = os.path.join(tender_upload_dir, file.filename)
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        uploaded.append({
            "filename": file.filename,
            "size": len(contents),
            "status": "saved",
            "path": file_path
        })

    return {
        "tender_id": tender_id,
        "files_uploaded": len(uploaded),
        "files": uploaded,
        "message": "PDFs uploaded successfully. Layout analysis ready.",
    }


@router.get("/compare/{tender_id}")
async def compare_documents(tender_id: str):
    """
    Run cross-document comparison on all PDFs for a tender using Engine 2.
    """
    tender_upload_dir = os.path.join(UPLOAD_DIR, tender_id)
    if not os.path.exists(tender_upload_dir):
        return {
            "tender_id": tender_id,
            "status": "no_documents",
            "message": "No PDFs uploaded for this tender yet.",
            "document_pairs": [],
            "cartel_clusters": []
        }

    pdf_files = [
        os.path.join(tender_upload_dir, f)
        for f in os.listdir(tender_upload_dir)
        if f.endswith(".pdf")
    ]

    if len(pdf_files) < 2:
        return {
            "tender_id": tender_id,
            "status": "insufficient_documents",
            "message": f"Need at least 2 PDFs to run pairwise comparison. Found {len(pdf_files)}.",
            "document_pairs": [],
            "cartel_clusters": []
        }

    results = rag_pipeline.process_tender_documents(tender_id, pdf_files)
    return results


@router.get("/extract/{tender_id}/{filename}")
async def extract_document_features(tender_id: str, filename: str):
    """Extract layout features from a specific PDF."""
    file_path = os.path.join(UPLOAD_DIR, tender_id, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Document {filename} not found.")

    features = pdf_parser.parse(file_path)
    return {
        "tender_id": tender_id,
        "filename": filename,
        "features": {
            "page_count": features.page_count,
            "unique_fonts": list(features.unique_fonts),
            "table_count": features.total_tables,
            "image_count": features.total_images,
            "has_watermark": features.has_watermark,
            "watermark_text": features.watermark_text,
            "metadata": features.metadata,
            "file_hash": features.file_hash,
        },
        "message": "Feature extraction successful"
    }
