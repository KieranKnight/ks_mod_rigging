# /dcc/maya/builder.py

import json

try:
    import maya.cmds as cmds
except ImportError:
    cmds = None  # Testing outside of maya
    
    
def build_rig_from_file(filepath: str):
    if cmds is None:
        raise RuntimeError("This must be run inside of Maya")
    
    with open(filepath, "r") as f:
        data = json.load(f)
        
    _build(data)
    

def _build(data: dict):
    node_map = {}
    
    # Create joints
    for node in data["nodes"]:
        if node["type"] == "joint":
            pos = node["params"].get("position", [0, 0, 0])
            joint = cmds.joint(name=node["name"], position=pos)
            node_map[node["id"]] = joint
        
        elif node["type"] == "limb":
            chain = build_limb(node)
            node_map[node["id"]] = chain[0]  # root of limb
            
    for conn in data["connections"]:
        parent = node_map.get(conn["from"])
        child = node_map.get(conn["to"])
        
        if parent and child:
            cmds.parent(child, parent)
            
        

def build_limb(node):
    joint_count = node["params"].get("joint_count", 3)
    length = node["params"].get("length", 5.0)
    
    joints = []
    spacing = length / (joint_count - 1)
    
    for i in range(joint_count):
        joint = cmds.joint(
            name=f"{node["name"]}_{i}",
            position=[i + spacing, 0, 0]
        )
        joints.append(joint)
    
    return joints
        
        