import json
import os

import ks_mod_rigging.core.nodes  # ensures all nodes are registered

from fastapi import APIRouter, HTTPException
from ks_mod_rigging.backend.models import RigModel
from ks_mod_rigging.backend import storage

from ks_mod_rigging.core.graph import RigGraph
from ks_mod_rigging.core.validation import validate_graph


router = APIRouter(prefix="/rigs", tags=["rigs"])


# -------------------------------------------------------
# CREATE RIG
# -------------------------------------------------------
@router.post("/")
def create_rig(rig: RigModel):
    graph = RigGraph.from_dict({
        "nodes": [n.dict() for n in rig.nodes],
        "connections": [
            {"from": c.from_node, "to": c.to_node}
            for c in rig.connections
        ]
    })

    errors = validate_graph(graph)
    if errors:
        raise HTTPException(status_code=400, detail=errors)

    rig_id = storage.create_rig(graph.to_dict())

    return {
        "rig_id": rig_id,
        "status": "created"
    }


# -------------------------------------------------------
# GET RIG
# -------------------------------------------------------
@router.get("/{rig_id}")
def get_rig(rig_id: str):
    rig = storage.get_rig(rig_id)

    if not rig:
        raise HTTPException(status_code=404, detail="Rig not found")

    return rig


# -------------------------------------------------------
# BUILD RIG (MAYA EXPORT STEP)
# -------------------------------------------------------
@router.post("/{rig_id}/build")
def build_rig(rig_id: str):
    rig = storage.get_rig(rig_id)

    if not rig:
        raise HTTPException(status_code=404, detail="Rig not found")

    filepath = f"temp_{rig_id}.json"

    with open(filepath, "w") as f:
        json.dump(rig, f, indent=2)

    abs_path = os.path.abspath(filepath)

    return {
        "rig_id": rig_id,
        "filepath": abs_path,
        "status": "built"
    }


# -------------------------------------------------------
# EXPORT RIG (optional external use)
# -------------------------------------------------------
@router.post("/{rig_id}/export")
def export_rig(rig_id: str):
    rig = storage.get_rig(rig_id)

    if not rig:
        raise HTTPException(status_code=404, detail="Rig not found")

    filepath = f"temp_{rig_id}.json"

    with open(filepath, "w") as f:
        json.dump(rig, f, indent=2)

    return {
        "rig_id": rig_id,
        "filepath": os.path.abspath(filepath),
        "status": "exported"
    }


# -------------------------------------------------------
# LIST RIGS
# -------------------------------------------------------
@router.get("/")
def list_rigs():
    return storage.list_rigs()