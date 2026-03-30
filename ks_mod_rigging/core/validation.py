# /core/validation.py


def validate_graph(graph):
    errors = []
    
    # Check all connections are valid.
    for conn in graph.connections:
        if conn["from"] not in graph.nodes:
            errors.append(f"Invalid node 'from' node: {conn['from']}")
        if conn["to"] not in graph.nodes:
            errors.append(f"Invalid 'to node: {conn['to']}")
            
    return errors