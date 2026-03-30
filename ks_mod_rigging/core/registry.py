# /core/registry.py

class NodeRegistry:
    _registry = {}
    
    @classmethod
    def register(cls, node_type: str, node_class):
        cls._registry[node_type] = node_class
        
    @classmethod
    def create_from_dict(cls, data: dict):
        node_type = data["type"]
        
        if node_type not in cls._registry:
            raise ValueError(f"Unknown node type: {node_type}")
        
        node_class = cls._registry[node_type]
        return node_class.from_dict(data)
    
    @classmethod
    def get_registered_types(cls):
        return list(cls._registry.keys())
