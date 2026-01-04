"""
Advanced Async Scraping Service.
No API keys required - uses free public sources.
"""
import asyncio
import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
from datetime import datetime
import re
import logging
from urllib.parse import quote_plus, urljoin
import hashlib

logger = logging.getLogger(__name__)

# Request configuration
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
}

# Rate limiting
RATE_LIMIT_DELAY = 1.0  # seconds between requests to same domain


class AsyncScraper:
    """High-performance async web scraper."""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.last_request_time: Dict[str, float] = {}
    
    async def get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session."""
        if self.session is None or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=30)
            connector = aiohttp.TCPConnector(limit=10, limit_per_host=2)
            self.session = aiohttp.ClientSession(
                headers=HEADERS,
                timeout=timeout,
                connector=connector,
            )
        return self.session
    
    async def close(self):
        """Close the session."""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def rate_limit(self, domain: str):
        """Apply rate limiting per domain."""
        now = asyncio.get_event_loop().time()
        last = self.last_request_time.get(domain, 0)
        wait_time = RATE_LIMIT_DELAY - (now - last)
        if wait_time > 0:
            await asyncio.sleep(wait_time)
        self.last_request_time[domain] = asyncio.get_event_loop().time()
    
    async def fetch(self, url: str) -> Optional[str]:
        """Fetch a URL with rate limiting."""
        try:
            domain = url.split("/")[2]
            await self.rate_limit(domain)
            
            session = await self.get_session()
            async with session.get(url) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    logger.warning(f"HTTP {response.status} for {url}")
                    return None
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
    
    async def fetch_json(self, url: str) -> Optional[Dict]:
        """Fetch JSON from URL."""
        try:
            domain = url.split("/")[2]
            await self.rate_limit(domain)
            
            session = await self.get_session()
            async with session.get(url) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.warning(f"HTTP {response.status} for {url}")
                    return None
        except Exception as e:
            logger.error(f"Error fetching JSON {url}: {e}")
            return None


# Global scraper instance
scraper = AsyncScraper()


async def search_google_patents(entity_name: str, max_results: int = 20) -> List[Dict[str, Any]]:
    """
    Search Google Patents for an entity.
    Uses the public Google Patents interface.
    """
    patents = []
    query = quote_plus(entity_name)
    url = f"https://patents.google.com/?q={query}&num=20"
    
    logger.info(f"Searching Google Patents for: {entity_name}")
    
    try:
        html = await scraper.fetch(url)
        if not html:
            return patents
        
        soup = BeautifulSoup(html, 'lxml')
        
        # Parse patent results
        results = soup.find_all('search-result-item', limit=max_results)
        if not results:
            # Try alternative selector
            results = soup.find_all('article', class_='result', limit=max_results)
        
        for result in results:
            try:
                # Extract patent info
                title_elem = result.find(['h3', 'span'], class_=['result-title', 'title'])
                patent_num_elem = result.find(['span', 'a'], class_=['patent-number', 'style-scope'])
                
                title = title_elem.get_text(strip=True) if title_elem else "Unknown Patent"
                patent_number = patent_num_elem.get_text(strip=True) if patent_num_elem else f"PAT{hash(title) % 100000}"
                
                patents.append({
                    "patent_number": patent_number,
                    "title": title,
                    "abstract": "",
                    "filing_date": datetime.now(),
                    "status": "granted",
                    "inventors": [],
                    "source_url": url,
                })
            except Exception as e:
                logger.debug(f"Error parsing patent result: {e}")
                continue
        
        logger.info(f"Found {len(patents)} patents from Google Patents")
        
    except Exception as e:
        logger.error(f"Error searching Google Patents: {e}")
    
    return patents


async def search_arxiv(entity_name: str, max_results: int = 20) -> List[Dict[str, Any]]:
    """
    Search arXiv for papers (free, no API key required).
    """
    papers = []
    query = quote_plus(entity_name)
    url = f"http://export.arxiv.org/api/query?search_query=all:{query}&start=0&max_results={max_results}&sortBy=submittedDate&sortOrder=descending"
    
    logger.info(f"Searching arXiv for: {entity_name}")
    
    try:
        xml_content = await scraper.fetch(url)
        if not xml_content:
            return papers
        
        soup = BeautifulSoup(xml_content, 'lxml-xml')
        entries = soup.find_all('entry')
        
        for entry in entries[:max_results]:
            try:
                title = entry.find('title').get_text(strip=True) if entry.find('title') else ""
                abstract = entry.find('summary').get_text(strip=True) if entry.find('summary') else ""
                published = entry.find('published').get_text(strip=True) if entry.find('published') else ""
                
                # Extract authors
                authors = []
                for author in entry.find_all('author'):
                    name = author.find('name')
                    if name:
                        authors.append(name.get_text(strip=True))
                
                # Extract arXiv ID
                arxiv_id = entry.find('id').get_text(strip=True) if entry.find('id') else ""
                
                papers.append({
                    "title": title,
                    "abstract": abstract[:1000],
                    "authors": authors,
                    "publication_date": datetime.fromisoformat(published.replace('Z', '+00:00')) if published else datetime.now(),
                    "venue": "arXiv",
                    "doi": arxiv_id,
                    "citation_count": 0,
                    "source_url": arxiv_id,
                })
            except Exception as e:
                logger.debug(f"Error parsing arXiv entry: {e}")
                continue
        
        logger.info(f"Found {len(papers)} papers from arXiv")
        
    except Exception as e:
        logger.error(f"Error searching arXiv: {e}")
    
    return papers


async def search_semantic_scholar(entity_name: str, max_results: int = 20) -> List[Dict[str, Any]]:
    """
    Search Semantic Scholar (free tier, no API key for basic queries).
    """
    papers = []
    query = quote_plus(entity_name)
    url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={query}&limit={max_results}&fields=title,abstract,authors,year,venue,citationCount,externalIds"
    
    logger.info(f"Searching Semantic Scholar for: {entity_name}")
    
    try:
        data = await scraper.fetch_json(url)
        if not data or 'data' not in data:
            return papers
        
        for paper in data.get('data', []):
            try:
                authors = [a.get('name', '') for a in paper.get('authors', [])]
                year = paper.get('year')
                
                papers.append({
                    "title": paper.get('title', ''),
                    "abstract": paper.get('abstract', '')[:1000] if paper.get('abstract') else '',
                    "authors": authors,
                    "publication_date": datetime(year, 1, 1) if year else datetime.now(),
                    "venue": paper.get('venue', ''),
                    "doi": paper.get('externalIds', {}).get('DOI', ''),
                    "citation_count": paper.get('citationCount', 0),
                    "source_url": f"https://www.semanticscholar.org/paper/{paper.get('paperId', '')}",
                })
            except Exception as e:
                logger.debug(f"Error parsing S2 paper: {e}")
                continue
        
        logger.info(f"Found {len(papers)} papers from Semantic Scholar")
        
    except Exception as e:
        logger.error(f"Error searching Semantic Scholar: {e}")
    
    return papers


async def search_dblp(entity_name: str, max_results: int = 20) -> List[Dict[str, Any]]:
    """
    Search DBLP for computer science publications (free, no API key).
    """
    papers = []
    query = quote_plus(entity_name)
    url = f"https://dblp.org/search/publ/api?q={query}&format=json&h={max_results}"
    
    logger.info(f"Searching DBLP for: {entity_name}")
    
    try:
        data = await scraper.fetch_json(url)
        if not data or 'result' not in data:
            return papers
        
        hits = data.get('result', {}).get('hits', {}).get('hit', [])
        
        for hit in hits[:max_results]:
            try:
                info = hit.get('info', {})
                
                # Handle authors (can be string or list)
                authors_raw = info.get('authors', {}).get('author', [])
                if isinstance(authors_raw, str):
                    authors = [authors_raw]
                elif isinstance(authors_raw, list):
                    authors = [a if isinstance(a, str) else a.get('text', '') for a in authors_raw]
                else:
                    authors = []
                
                year = info.get('year', '')
                
                papers.append({
                    "title": info.get('title', ''),
                    "abstract": '',  # DBLP doesn't provide abstracts
                    "authors": authors[:10],  # Limit authors
                    "publication_date": datetime(int(year), 1, 1) if year and year.isdigit() else datetime.now(),
                    "venue": info.get('venue', ''),
                    "doi": info.get('doi', ''),
                    "citation_count": 0,
                    "source_url": info.get('url', ''),
                })
            except Exception as e:
                logger.debug(f"Error parsing DBLP entry: {e}")
                continue
        
        logger.info(f"Found {len(papers)} papers from DBLP")
        
    except Exception as e:
        logger.error(f"Error searching DBLP: {e}")
    
    return papers


async def search_crossref(entity_name: str, max_results: int = 20) -> List[Dict[str, Any]]:
    """
    Search CrossRef for academic publications (free, no API key).
    """
    papers = []
    query = quote_plus(entity_name)
    url = f"https://api.crossref.org/works?query={query}&rows={max_results}&sort=relevance"
    
    logger.info(f"Searching CrossRef for: {entity_name}")
    
    try:
        data = await scraper.fetch_json(url)
        if not data or 'message' not in data:
            return papers
        
        items = data.get('message', {}).get('items', [])
        
        for item in items[:max_results]:
            try:
                # Extract authors
                authors = []
                for author in item.get('author', []):
                    name = f"{author.get('given', '')} {author.get('family', '')}".strip()
                    if name:
                        authors.append(name)
                
                # Extract date
                date_parts = item.get('published-print', {}).get('date-parts', [[]])
                if not date_parts[0]:
                    date_parts = item.get('created', {}).get('date-parts', [[2024]])
                
                year = date_parts[0][0] if date_parts and date_parts[0] else 2024
                month = date_parts[0][1] if len(date_parts[0]) > 1 else 1
                day = date_parts[0][2] if len(date_parts[0]) > 2 else 1
                
                papers.append({
                    "title": item.get('title', [''])[0] if item.get('title') else '',
                    "abstract": item.get('abstract', '')[:1000] if item.get('abstract') else '',
                    "authors": authors[:10],
                    "publication_date": datetime(year, month, day),
                    "venue": item.get('container-title', [''])[0] if item.get('container-title') else '',
                    "doi": item.get('DOI', ''),
                    "citation_count": item.get('is-referenced-by-count', 0),
                    "source_url": item.get('URL', ''),
                })
            except Exception as e:
                logger.debug(f"Error parsing CrossRef entry: {e}")
                continue
        
        logger.info(f"Found {len(papers)} papers from CrossRef")
        
    except Exception as e:
        logger.error(f"Error searching CrossRef: {e}")
    
    return papers


async def scrape_entity_data(
    entity_name: str,
    website: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main function to scrape all data for an entity.
    Runs all scrapers concurrently for maximum speed.
    """
    logger.info(f"Starting comprehensive scrape for: {entity_name}")
    
    # Run all scrapers concurrently
    results = await asyncio.gather(
        search_google_patents(entity_name),
        search_arxiv(entity_name),
        search_semantic_scholar(entity_name),
        search_dblp(entity_name),
        search_crossref(entity_name),
        return_exceptions=True,
    )
    
    patents = results[0] if isinstance(results[0], list) else []
    
    # Combine papers from all sources
    all_papers = []
    seen_titles = set()
    
    for result in results[1:]:
        if isinstance(result, list):
            for paper in result:
                # Deduplicate by title
                title_key = paper.get('title', '').lower()[:50]
                if title_key and title_key not in seen_titles:
                    seen_titles.add(title_key)
                    all_papers.append(paper)
    
    # Extract unique personnel from papers
    personnel = {}
    for paper in all_papers:
        for author in paper.get('authors', []):
            if author and author not in personnel:
                personnel[author] = {
                    "name": author,
                    "role": "Researcher",
                    "publication_count": 0,
                    "expertise": [],
                }
            if author in personnel:
                personnel[author]["publication_count"] += 1
    
    # Extract technologies from all content
    from app.services.ai_service import get_ai_service
    ai = get_ai_service()
    
    all_text = " ".join([
        p.get("abstract", "") or p.get("title", "")
        for p in patents + all_papers
    ])
    technologies = ai.extract_technologies(all_text)
    
    logger.info(f"Scrape complete: {len(patents)} patents, {len(all_papers)} papers, {len(personnel)} personnel")
    
    # Close scraper session
    await scraper.close()
    
    return {
        "patents": patents,
        "papers": all_papers,
        "personnel": list(personnel.values()),
        "technologies": technologies,
    }
