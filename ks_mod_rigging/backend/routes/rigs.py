import json
import os

import ks_mod_rigging.core.nodes  # ensuring all nodes are registered.

from fastapi import APIRouter, HTTPException
from ks_mod_rigging.backend.models import RigModel
from ks_mod_rigging.backend import storage

from ks_mod_rigging.core.graph import RigGraph
from ks_mod_rigging.core.validation import validate_graph
from ks_mod_rigging.core.registry import NodeRegistry


router = APIRouter(prefix="/rigs", tags=["rigs"])

@router.post("/{rig_id}/build")
def build_rig(rig_id: str):
    rig = storage.get_rig(rig_id)
    
    if not rig:
        raise HTTPException(status_code=404, detail="Rig not found")
    
    filepath = f"temp_{rig_id}.json"
    with open(filepath, "w") as f:
        json.dump(rig, f, indent=2)
        
    return {"filepath": os.path.abspath(filepath)}

@router.post("/")
def create_rig(rig: RigModel):
    # convert to core graph.
    graph = RigGraph.from_dict({
        "nodes": [n.dict() for n in rig.nodes],
        "connections": [
            {"from": c.from_node, "to": c.to_node}
            for c in rig.connections
        ]
    })
    
    # Validate
    errors = validate_graph(graph)
    if errors:
        raise HTTPException(status_code=400, detail=errors)
    
    # Store
    rig_id = storage.create_rig(graph.to_dict())
    return {"rig_id": rig_id}


@router.get("/{rig_id}")
def get_rig(rig_id: str):
    rig = storage.get_rig(rig_id)
    
    if not rig:
        raise HTTPException(satus_code=404, detail="Rig not found.")
    
    return rig


@router.post("/{rig_id}/export")
def export_rig(rig_id: str):
    rig = storage.get_rig(rig_id)
    
    if not rig:
        raise HTTPException(status_code=404, detail="Rig not found")
    
    filepath = f"temp_{rig_id}.json"
    
    with open(filepath, "w") as f:
        json.dump(rig, f, indent=2)
        
    return {"filepath": filepath}


@router.get("/")
def list_rigs():
    return storage.list_rigs()