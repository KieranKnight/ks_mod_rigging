# /core/nodes/limb.py

from ks_mod_rigging.core.nodes.base import BaseNode
from ks_mod_rigging.core.registry import NodeRegistry


_NAME = "limb"

class LimbNode(BaseNode):
    def __init__(
        self, 
        name: str,
        side: str = "C",
        joint_count: int = 3,
        length: float = 5.0
    ):
        super().__init__(
            node_type=_NAME,
            name=name,
            params={
                "side": side,
                "joint_count": joint_count,
                "length": length
            }
        )
        
NodeRegistry.register(_NAME, LimbNode)