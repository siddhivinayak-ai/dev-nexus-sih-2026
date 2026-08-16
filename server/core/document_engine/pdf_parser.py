"""
BidShield AI / DevNexus — Engine 2: PDF Parser (Layout-Aware)
Author: Siddhivinayak Waghmode

Extracts structural and layout features from vendor proposal PDFs using PyMuPDF (fitz):
- Text content per page and per block
- Font families, sizes, styles, and frequencies
- Table structures and bounding boxes
- Watermarks, low-opacity text, and background layers
- Metadata (author, producer, creation timestamps)
- Content hashing for duplicate detection
"""

import os
import hashlib
from dataclasses import dataclass, field
from typing import Optional, List, Set, Dict, Any
import fitz  # PyMuPDF


@dataclass
class PageFeatures:
    """Extracted features from a single PDF page."""
    page_number: int
    text_content: str = ""
    fonts: List[Dict[str, Any]] = field(default_factory=list)  # [{name, size, flags, count}]
    tables: List[Dict[str, Any]] = field(default_factory=list)  # [table_data]
    images: List[Dict[str, Any]] = field(default_factory=list)  # [{width, height, bbox}]
    blocks: List[Dict[str, Any]] = field(default_factory=list)  # raw text blocks
    has_watermark: bool = False
    watermark_text: Optional[str] = None


@dataclass
class DocumentFeatures:
    """Complete feature set extracted from a PDF document."""
    filename: str
    filepath: str = ""
    page_count: int = 0
    pages: List[PageFeatures] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    unique_fonts: Set[str] = field(default_factory=set)
    total_tables: int = 0
    total_images: int = 0
    has_watermark: bool = False
    watermark_text: Optional[str] = None
    file_hash: str = ""
    full_text: str = ""


class PDFParser:
    """
    Layout-aware PDF parser using PyMuPDF (fitz).
    Extracts deep structural features that fingerprint a document's origin.
    """

    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)

    def parse(self, pdf_path: str) -> DocumentFeatures:
        """
        Parse a PDF file and extract all text and layout features.
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        # Compute SHA-256 hash of file
        with open(pdf_path, "rb") as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()

        doc = fitz.open(pdf_path)
        features = DocumentFeatures(
            filename=os.path.basename(pdf_path),
            filepath=pdf_path,
            page_count=len(doc),
            metadata=dict(doc.metadata or {}),
            file_hash=file_hash
        )

        all_text_parts = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            page_feat = self._extract_page_features(page, page_num + 1)
            features.pages.append(page_feat)
            
            all_text_parts.append(page_feat.text_content)
            features.unique_fonts.update(f["name"] for f in page_feat.fonts)
            features.total_tables += len(page_feat.tables)
            features.total_images += len(page_feat.images)
            
            if page_feat.has_watermark:
                features.has_watermark = True
                if not features.watermark_text and page_feat.watermark_text:
                    features.watermark_text = page_feat.watermark_text

        features.full_text = "\n\n".join(all_text_parts)
        doc.close()
        return features

    def _extract_page_features(self, page: fitz.Page, page_num: int) -> PageFeatures:
        """Extract font, text, table, and watermark features from a single page."""
        page_feat = PageFeatures(page_number=page_num)
        
        # 1. Extract plain text
        page_feat.text_content = page.get_text("text").strip()

        # 2. Extract rich layout text blocks and font fingerprints
        font_counts = {}
        try:
            page_dict = page.get_text("dict")
            blocks = page_dict.get("blocks", [])
            for block in blocks:
                if block.get("type") == 0:  # Text block
                    page_feat.blocks.append({
                        "bbox": block.get("bbox"),
                        "lines": len(block.get("lines", []))
                    })
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            font_name = span.get("font", "Unknown")
                            font_size = round(span.get("size", 10), 1)
                            font_flags = span.get("flags", 0)
                            key = f"{font_name}_{font_size}"
                            
                            if key not in font_counts:
                                font_counts[key] = {
                                    "name": font_name,
                                    "size": font_size,
                                    "flags": font_flags,
                                    "count": 0
                                }
                            font_counts[key]["count"] += len(span.get("text", ""))
        except Exception:
            pass

        page_feat.fonts = list(font_counts.values())

        # 3. Detect images
        try:
            image_list = page.get_images()
            for img in image_list:
                page_feat.images.append({
                    "xref": img[0],
                    "width": img[2],
                    "height": img[3]
                })
        except Exception:
            pass

        # 4. Detect tables (PyMuPDF table finder)
        try:
            tabs = page.find_tables()
            if tabs and tabs.tables:
                for tab in tabs.tables:
                    page_feat.tables.append({
                        "bbox": tab.bbox,
                        "row_count": tab.row_count,
                        "col_count": tab.col_count
                    })
        except Exception:
            pass

        # 5. Detect watermarks / background metadata
        has_wm, wm_text = self._detect_watermark(page)
        page_feat.has_watermark = has_wm
        page_feat.watermark_text = wm_text

        return page_feat

    def _detect_watermark(self, page: fitz.Page) -> tuple[bool, Optional[str]]:
        """
        Detect watermarks by checking:
        1. Low opacity or light-gray text layers
        2. Known watermark keywords in background text (e.g. CONFIDENTIAL, DRAFT, INTERNAL)
        """
        wm_keywords = ["CONFIDENTIAL", "DRAFT", "INTERNAL", "PROPRIETARY", "RESTRICTED", "DO NOT COPY"]
        page_text = page.get_text("text").upper()
        
        for kw in wm_keywords:
            if kw in page_text:
                return True, kw

        # Check drawings / text with low opacity
        try:
            drawings = page.get_drawings()
            for d in drawings:
                fill_opacity = d.get("fill_opacity", 1.0)
                stroke_opacity = d.get("stroke_opacity", 1.0)
                if fill_opacity < 0.4 or stroke_opacity < 0.4:
                    return True, "VECTOR_WATERMARK"
        except Exception:
            pass

        return False, None
