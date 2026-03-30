from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ks_mod_rigging.backend.routes import rigs

app = FastAPI(title="Rig System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(rigs.router)

