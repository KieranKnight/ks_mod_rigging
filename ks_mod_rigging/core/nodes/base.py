# /core/nodes/base.py

from typing import Dict, Any
import uuid

from ks_mod_rigging.core.registry import NodeRegistry


class BaseNode:
    def __init__(self, node_type: str, name: str, params: Dict[str, Any] = None):
        self.id = str(uuid.uuid4())
        self.node_type = node_type
        self.name = name
        self.params = params or {}        
        
    @classmethod
    def from_dict(cls, data: dict):
        params = data.get("params", {})
        
        # only pass params that constructor expects
        import inspect
        sig = inspect.signature(cls.__init__)
        valid_params = {
            k: v for k, v in params.items()
            if k in sig.parameters
        }
        
        node = cls(name=data["name"], **valid_params)
        node.id = data["id"]
        return node
        
    def to_dict(self):
        return {
            "rig_id": self.id,
            "type": self.node_type,
            "name": self.name,
            "params": self.params
        }