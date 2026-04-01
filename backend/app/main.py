from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.routers import health, ingest, qualify, outreach


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # startup
    yield
    # shutdown


app = FastAPI(
    title="AgenticHire API",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(health.router)
app.include_router(ingest.router)
app.include_router(qualify.router)
app.include_router(outreach.router)
