from supabase import create_client, Client
from app.core.config import settings
import logging
from uuid import UUID
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        else:
            logger.warning("Supabase credentials not set.")
            self.client = None

    def create_technology(self, tech_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.client: raise ValueError("Supabase not configured")
        
        # Ensure jsonb fields are properly formatted if needed, usually passed as dict is fine
        try:
            response = self.client.table('technologies').insert(tech_data).execute()
            return response.data[0]
        except Exception as e:
            logger.error(f"Supabase Error: {e}")
            raise e

    def get_technologies(self) -> List[Dict[str, Any]]:
        if not self.client: raise ValueError("Supabase not configured")
        response = self.client.table('technologies').select("*").execute()
        return response.data

    def search_similar_technologies(self, embedding: List[float], match_threshold: float = 0.7, match_count: int = 5):
        """
        Calls a Supabase RPC function 'match_documents' (need to define this logic in SQL if using pgvector match)
        or generally queries embeddings.
        For now, this assumes we add a 'match_technologies' function in SQL later.
        """
        if not self.client: raise ValueError("Supabase not configured")
        
        try:
            response = self.client.rpc(
                'match_technologies',
                {
                    'query_embedding': embedding,
                    'match_threshold': match_threshold,
                    'match_count': match_count
                }
            ).execute()
            return response.data
        except Exception as e:
            logger.error(f"Vector Search Error: {e}")
            raise e

supabase_service = SupabaseService()
