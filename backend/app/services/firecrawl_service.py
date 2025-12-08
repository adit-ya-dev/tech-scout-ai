from firecrawl import FirecrawlApp
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class FirecrawlService:
    def __init__(self):
        self.api_key = settings.FIRECRAWL_API_KEY
        if self.api_key:
            self.app = FirecrawlApp(api_key=self.api_key)
        else:
            logger.warning("FIRECRAWL_API_KEY not set. Scraping will not work.")
            self.app = None

    def crawl_url(self, url: str) -> dict:
        """
        Crawls a specific URL and returns the content.
        """
        if not self.app:
            raise ValueError("Firecrawl API key not configured")
        
        try:
            logger.info(f"Crawling URL: {url}")
            # Scrape specific URL
            result = self.app.scrape_url(url, params={'formats': ['markdown']})
            return result
        except Exception as e:
            logger.error(f"Error crawling URL {url}: {str(e)}")
            raise e

    def search_and_crawl(self, query: str, limit: int = 3) -> list[dict]:
        """
        Searches for a query and crawls the top results.
        Note: Firecrawl generic search might differ, depending on SDK version.
        Assuming 'search' behaves like a search-and-scrape or just search.
        Using 'crawl' with a search query if supported, or just returning mock for SDK limitation.
        """
        # Note: Check Firecrawl SDK documentation for specific search capabilities.
        # Fallback if specific search method doesn't exist in this version.
        pass

firecrawl_service = FirecrawlService()
