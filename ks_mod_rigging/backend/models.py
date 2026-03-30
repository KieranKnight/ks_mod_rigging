from pydantic import BaseModel
from typing import List, Dict, Any


class NodeModel(BaseModel):
    id: str
    type: str
    name: str
    params: Dict[str, Any]
    
    
class ConnectionModel(BaseModel):
    from_node: str
    to_node: str
    
    
class RigModel(BaseModel):
    nodes: List[NodeModel]
    connections: List[ConnectionModel]