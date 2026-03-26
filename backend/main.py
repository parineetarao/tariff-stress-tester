"""
Entry point for the Tariff Stress Tester API.

This module creates the FastAPI application, configures CORS,
and registers all routers. No business logic lives here —
this file is purely wiring.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import scenarios

app = FastAPI(
    title="Tariff Stress Tester API",
    description="Monte Carlo portfolio stress testing under tariff scenarios",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(scenarios.router)


@app.get("/health")
def health_check():
    """
    Health check endpoint.
    Returns a simple status response. Used by deployment platforms
    to verify the service is running.
    """
    return {"status": "ok", "version": "0.1.0"}


@app.get("/")
def root():
    """Root endpoint — confirms the API is reachable."""
    return {
        "message": "Tariff Stress Tester API",
        "docs": "/docs",
        "health": "/health",
        "scenarios": "/scenarios",
    }