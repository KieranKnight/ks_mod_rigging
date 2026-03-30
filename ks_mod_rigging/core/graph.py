# /core/graph.py

from typing import Dict, List

from ks_mod_rigging.core.registry import NodeRegistry


class RigGraph:
    def __init__(self):
        self.nodes: Dict[str, dict] = {}
        self.connections: List[dict] = []
        
    @classmethod
    def from_dict(cls, data: dict):
        graph = cls()
        
        # reconstruct nodes
        for node_data in data["nodes"]:
            node = NodeRegistry.create_from_dict(node_data)
            graph.add_nodes(node)

        graph.connections = data["connections"]
        return graph
        
    def add_nodes(self, node):
        self.nodes[node.id] = node
        
    def connect(self, from_node_id: str, to_node_id: str):
        self.connections.append({
            "from": from_node_id,
            "to": to_node_id
        })
        
    def to_dict(self):
        return {
            "nodes": [node.to_dict() for node in self.nodes.values()],
            "connections": self.connections
        }
        
    