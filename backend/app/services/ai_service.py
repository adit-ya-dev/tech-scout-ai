"""
AI/ML Service using HuggingFace Transformers with IBM Granite models.
Runs locally without any API keys required.
"""
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from fastembed import TextEmbedding
from typing import List, Optional
import asyncio
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

# Model configurations
GRANITE_MODEL = "ibm-granite/granite-3.0-2b-instruct"  # Smaller model for faster inference
EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"  # Fast embedding model


class AIService:
    """AI Service using HuggingFace Transformers locally."""
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if AIService._initialized:
            return
        
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Initializing AI Service on device: {self.device}")
        
        # Initialize embedding model (fast, lightweight)
        self._embedding_model = None
        
        # Initialize LLM (lazy loading)
        self._llm_pipeline = None
        self._tokenizer = None
        
        AIService._initialized = True
    
    @property
    def embedding_model(self) -> TextEmbedding:
        """Lazy load embedding model."""
        if self._embedding_model is None:
            logger.info(f"Loading embedding model: {EMBEDDING_MODEL}")
            self._embedding_model = TextEmbedding(model_name=EMBEDDING_MODEL)
        return self._embedding_model
    
    @property
    def llm_pipeline(self):
        """Lazy load LLM pipeline."""
        if self._llm_pipeline is None:
            logger.info(f"Loading LLM model: {GRANITE_MODEL}")
            try:
                self._tokenizer = AutoTokenizer.from_pretrained(GRANITE_MODEL)
                model = AutoModelForCausalLM.from_pretrained(
                    GRANITE_MODEL,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    device_map="auto" if self.device == "cuda" else None,
                    low_cpu_mem_usage=True,
                )
                self._llm_pipeline = pipeline(
                    "text-generation",
                    model=model,
                    tokenizer=self._tokenizer,
                    max_new_tokens=512,
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                )
                logger.info("LLM model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load LLM model: {e}")
                self._llm_pipeline = None
        return self._llm_pipeline
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text."""
        try:
            embeddings = list(self.embedding_model.embed([text]))
            return embeddings[0].tolist() if len(embeddings) > 0 else []
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return []
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        try:
            embeddings = list(self.embedding_model.embed(texts))
            return [emb.tolist() for emb in embeddings]
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {e}")
            return [[] for _ in texts]
    
    def generate_text(self, prompt: str, max_tokens: int = 512) -> str:
        """Generate text using the LLM."""
        if self.llm_pipeline is None:
            logger.warning("LLM not available, returning empty string")
            return ""
        
        try:
            result = self.llm_pipeline(
                prompt,
                max_new_tokens=max_tokens,
                return_full_text=False,
            )
            return result[0]["generated_text"].strip()
        except Exception as e:
            logger.error(f"Error generating text: {e}")
            return ""
    
    def extract_technologies(self, text: str) -> List[str]:
        """Extract technology domains from text using pattern matching + optional LLM."""
        # Fast pattern-based extraction (no LLM needed)
        tech_patterns = {
            "Quantum Computing": ["quantum", "qubit", "superposition", "entanglement", "quantum computer"],
            "Machine Learning": ["machine learning", "deep learning", "neural network", "AI", "artificial intelligence", "transformer", "LLM"],
            "Cryptography": ["cryptograph", "encryption", "blockchain", "security", "cipher"],
            "Robotics": ["robot", "autonomous", "drone", "UAV", "unmanned"],
            "Materials Science": ["material", "composite", "alloy", "metamaterial", "graphene", "nano"],
            "Aerospace": ["aerospace", "hypersonic", "satellite", "rocket", "spacecraft"],
            "Biotechnology": ["biotech", "genetic", "crispr", "pharma", "genomic", "protein"],
            "Computer Vision": ["computer vision", "image recognition", "object detection", "CNN"],
            "Natural Language Processing": ["NLP", "language model", "text processing", "sentiment"],
            "Cybersecurity": ["cybersecurity", "malware", "intrusion", "firewall", "vulnerability"],
            "Internet of Things": ["IoT", "sensor network", "smart device", "embedded"],
            "5G/6G Communications": ["5G", "6G", "wireless", "spectrum", "millimeter wave"],
        }
        
        text_lower = text.lower()
        found_tech = []
        
        for tech, keywords in tech_patterns.items():
            if any(kw.lower() in text_lower for kw in keywords):
                found_tech.append(tech)
        
        return found_tech
    
    def summarize_text(self, text: str, max_length: int = 200) -> str:
        """Summarize text using the LLM."""
        if not text or len(text) < 100:
            return text
        
        prompt = f"""Summarize the following text in 2-3 sentences:

{text[:2000]}

Summary:"""
        
        return self.generate_text(prompt, max_tokens=100)


# Singleton instance
ai_service = AIService()


def get_ai_service() -> AIService:
    """Get the AI service singleton."""
    return ai_service
