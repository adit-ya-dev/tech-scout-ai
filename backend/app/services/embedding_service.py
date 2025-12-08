from app.core.config import settings
import logging
from typing import List, Optional
# Using requests for HF Inference API to avoid heavy local model loading if preferred, 
# or sentence-transformers for local. Given "Granite 4.0", API is likely better.
import requests

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.api_key = settings.HUGGINGFACE_API_KEY
        self.api_url = "https://api-inference.huggingface.co/models/ibm-granite/granite-embedding-278m-multilingual" 
        # Note: Adjust model ID to exact Granite 4.0 embedding model if different.
        # Fallback to a clear compatible model if Granite specific path is unknown.
        
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts using HF Inference API.
        """
        if not self.api_key:
            logger.warning("HUGGINGFACE_API_KEY not set. Returning mock embeddings.")
            # Return dummy 384-dim embeddings for testing
            return [[0.0] * 384 for _ in texts]
            
        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            response = requests.post(self.api_url, headers=headers, json={"inputs": texts, "options": {"wait_for_model": True}})
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise e

    def classify_text(self, text: str, labels: List[str]) -> dict:
        """
        Zero-shot classification for category/maturity.
        """
        if not self.api_key:
            return {"labels": labels, "scores": [1.0/len(labels)] * len(labels)}

        # Use a zero-shot classification model
        url = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            response = requests.post(url, headers=headers, json={
                "inputs": text,
                "parameters": {"candidate_labels": labels}
            })
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error classifying text: {e}")
            raise e

embedding_service = EmbeddingService()
