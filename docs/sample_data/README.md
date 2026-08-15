# Sample Test Data

This directory contains sample vendor proposal PDFs for testing the BidShield AI fraud detection engines.

## How to Generate Test PDFs

Use the prompt provided in the main README.md to generate 3 sample vendor proposal PDFs using Claude or any AI assistant.

## Expected Test Scenarios

### Scenario 1: Cover Bidding (Colluding Pair)
- **TechNova Solutions** (L1 bidder, ₹15 Cr) — the intended winner
- **Digital Infra Systems** (cover bid, ₹15.9 Cr) — same formatting, identical template
- **CompuWorld Enterprises** (genuine bidder, ₹14.5 Cr) — completely independent

### Scenario 2: Shell Vendor Network
- 3 PDFs from "different companies" that share the same creator metadata, font set, and document structure

### Scenario 3: Regional Market Allocation
- Bid data showing Company A only bids in Maharashtra, Company B only in Gujarat (no PDF overlap needed — Engine 1 test)
