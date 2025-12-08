from app.core.config import settings
from app.api import technologies

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(technologies.router, prefix=f"{settings.API_V1_STR}/technologies", tags=["technologies"])

@app.get("/")
async def root():
    return {"message": "Welcome to Tech Scout AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
