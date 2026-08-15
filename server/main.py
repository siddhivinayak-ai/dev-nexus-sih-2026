"""
BidShield AI — Server Entry Point
FastAPI application for Procurement Cartel Detection System
SIH 2026 | Team Dev Nexus
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.bids import router as bids_router
from api.documents import router as documents_router
from api.reports import router as reports_router

app = FastAPI(
    title="BidShield AI",
    description="AI-powered real-time fraud detection for government e-procurement portals",
    version="0.1.0",
)

# CORS — allow the React frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(bids_router)
app.include_router(documents_router)
app.include_router(reports_router)


@app.get("/")
async def root():
    return {
        "project": "BidShield AI",
        "team": "Dev Nexus",
        "hackathon": "SIH 2026",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
