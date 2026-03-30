# /core/nodes/joint.py

from ks_mod_rigging.core.nodes.base import BaseNode
from ks_mod_rigging.core.registry import NodeRegistry


_NAME = "joint"

class JointNode(BaseNode):
    def __init__(self, name: str, position=(0, 0, 0)):
        super().__init__(
            node_type=_NAME,
            name=name,
            params={"position": position}
        )
        
NodeRegistry.register(_NAME, JointNode)