"""
Sample PDF Proposal Generator for Testing Layout-Aware RAG Engine
Generates 3 realistic PDF proposals:
- Doc 1 (TechNova): Cartel ringleader proposal
- Doc 2 (Digital Infra): Cover bid with matching layout, fonts, and copied warranty clause
- Doc 3 (CompuWorld): Independent genuine proposal
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def create_sample_pdfs(output_dir="docs/sample_data"):
    os.makedirs(output_dir, exist_ok=True)

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=12
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=10
    )

    # 1. TechNova Proposal (Doc 1)
    doc1_path = os.path.join(output_dir, "TechNova_Proposal.pdf")
    doc1 = SimpleDocTemplate(doc1_path, pagesize=letter)
    story1 = [
        Paragraph("<b>TENDER SUBMISSION PROPOSAL</b>", title_style),
        Paragraph("<b>Tender Ref:</b> GEM/2026/IT/4521 | <b>Bidder:</b> TechNova Solutions Pvt. Ltd.", body_style),
        Paragraph("<b>CONFIDENTIAL DRAFT - GEM TENDER BID SUBMISSION</b>", ParagraphStyle('WM', parent=body_style, textColor=colors.HexColor('#94a3b8'), fontSize=8)),
        Spacer(1, 12),
        Paragraph("<b>1. Vendor Profile</b><br/>TechNova Solutions Pvt. Ltd. (Corporate Reg: REG-90214812) is a premier systems integrator with 12 years of public procurement delivery. Authorized director: Rajesh Waghmode.", body_style),
        Paragraph("<b>2. Technical Compliance</b><br/>The computing node features a cooling system optimized for tropical ambient temperatures, running at a nominal sound profile under 28dB. Power supply units are certified 80-Plus Gold with active power factor correction.", body_style),
        Spacer(1, 8),
        Table([
            ['Item Specification', 'Quantity', 'Unit Rate (INR)', 'Total (INR)'],
            ['Intel i5 Desktop Tower (16GB RAM, 512GB SSD)', '5,000 Nos', 'Rs. 24,000', 'Rs. 12,00,00,000'],
            ['24" IPS LED Backlit Full HD Monitor', '5,000 Nos', 'Rs. 6,500', 'Rs. 3,25,00,000'],
            ['600VA Line Interactive Offline UPS', '5,000 Nos', 'Rs. 1,500', 'Rs. 75,00,000'],
            ['<b>Total Bid Price</b>', '', '', '<b>Rs. 15,20,00,000</b>']
        ], style=[
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
        ]),
        Spacer(1, 14),
        Paragraph("<b>3. Terms & Conditions - Clause 4.2 (Warranty & SLA)</b><br/>TechNova Solutions Pvt. Ltd. warrants that all goods supplied under this tender will be free from defects in material and workmanship for a period of three (3) years from date of commissioning. Any replacement of parts will be performed on-site within 24 hours of ticket resolution.", body_style),
    ]
    doc1.build(story1)

    # 2. Digital Infra Cover Bid (Doc 2 - Cartel Clone)
    doc2_path = os.path.join(output_dir, "DigitalInfra_CoverBid.pdf")
    doc2 = SimpleDocTemplate(doc2_path, pagesize=letter)
    story2 = [
        Paragraph("<b>TENDER SUBMISSION PROPOSAL</b>", title_style),
        Paragraph("<b>Tender Ref:</b> GEM/2026/IT/4521 | <b>Bidder:</b> Digital Infra Systems", body_style),
        Paragraph("<b>CONFIDENTIAL DRAFT - GEM TENDER BID SUBMISSION</b>", ParagraphStyle('WM', parent=body_style, textColor=colors.HexColor('#94a3b8'), fontSize=8)),
        Spacer(1, 12),
        Paragraph("<b>1. Vendor Profile</b><br/>Digital Infra Systems (Corporate Reg: REG-31849182) provides enterprise infrastructure solutions for public educational institutions. Authorized director: Rajesh Waghmode.", body_style),
        Paragraph("<b>2. Technical Compliance</b><br/>The computing node features a cooling system optimized for tropical ambient temperatures, running at a nominal sound profile under 28dB. Power supply units are certified 80-Plus Gold with active power factor correction.", body_style),
        Spacer(1, 8),
        Table([
            ['Item Specification', 'Quantity', 'Unit Rate (INR)', 'Total (INR)'],
            ['Intel i5 Desktop Tower (16GB RAM, 512GB SSD)', '5,000 Nos', 'Rs. 25,440', 'Rs. 12,72,00,000'],
            ['24" IPS LED Backlit Full HD Monitor', '5,000 Nos', 'Rs. 6,890', 'Rs. 3,44,50,000'],
            ['600VA Line Interactive Offline UPS', '5,000 Nos', 'Rs. 1,590', 'Rs. 79,50,000'],
            ['<b>Total Bid Price</b>', '', '', '<b>Rs. 16,11,20,000</b>']
        ], style=[
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
        ]),
        Spacer(1, 14),
        Paragraph("<b>3. Terms & Conditions - Clause 4.2 (Warranty & SLA)</b><br/>Digital Infra Systems warrants that all goods supplied under this tender will be free from defects in material and workmanship for a period of three (3) years from date of commissioning. Any replacement of parts will be performed on-site within 24 hours of ticket resolution.", body_style),
    ]
    doc2.build(story2)

    # 3. CompuWorld Proposal (Doc 3 - Genuine Independent)
    doc3_path = os.path.join(output_dir, "CompuWorld_Independent.pdf")
    doc3 = SimpleDocTemplate(doc3_path, pagesize=letter)
    story3 = [
        Paragraph("<b>COMMERCIAL BID RESPONSE FOR DESKTOP SUPPLY</b>", ParagraphStyle('IndTitle', parent=styles['Heading2'], fontName='Times-Bold', fontSize=16, textColor=colors.HexColor('#0f172a'))),
        Paragraph("<b>Project:</b> Desktop Computers Procurement | <b>Entity:</b> CompuWorld Enterprises", body_style),
        Spacer(1, 12),
        Paragraph("<b>Executive Summary:</b> CompuWorld Enterprises brings over 18 years of IT hardware supply chain expertise across South India with certified ISO-9001 assembly lines. Contact: contact@compuworld.in", ParagraphStyle('IndBody', parent=body_style, fontName='Times-Roman')),
        Paragraph("<b>Specification Breakdown:</b> Custom manufactured chassis with high efficiency dual-intake fan design, meeting Bureau of Indian Standards (BIS) grade requirements.", ParagraphStyle('IndBody', parent=body_style, fontName='Times-Roman')),
        Spacer(1, 8),
        Table([
            ['Description', 'Units', 'Rate', 'Extended Price'],
            ['Desktop Computing Unit Core i5', '5,000', '28,900', '14,45,00,000'],
            ['24-inch Display Screen', '5,000', '8,000', '4,00,00,000'],
            ['Power Backup UPS 600VA', '5,000', '2,100', '1,05,00,000'],
            ['Grand Total', '', '', 'Rs. 18,50,00,000']
        ], style=[
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#64748b')),
            ('FONTNAME', (0,0), (-1,-1), 'Times-Roman'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
        ]),
        Spacer(1, 14),
        Paragraph("<b>Warranty Policy:</b> CompuWorld provides standard comprehensive OEM warranty coverage for 36 months covering hardware defects. Normal turnaround time is 48 business hours through regional service depots.", ParagraphStyle('IndBody', parent=body_style, fontName='Times-Roman')),
    ]
    doc3.build(story3)

    print(f"Generated 3 sample PDFs in: {os.path.abspath(output_dir)}")
    return [doc1_path, doc2_path, doc3_path]


if __name__ == "__main__":
    create_sample_pdfs()
