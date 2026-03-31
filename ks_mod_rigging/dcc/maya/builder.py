import json

try:
    import maya.cmds as cmds
except ImportError:
    cmds = None


def build_rig_from_file(filepath: str):
    if cmds is None:
        raise RuntimeError("This must be run inside of Maya")

    with open(filepath, "r") as f:
        data = json.load(f)

    _build(data)


def _build(data: dict):
    node_map = {}

    # -----------------------------
    # IMPORTANT: prevent Maya chain state issues
    # -----------------------------
    cmds.select(clear=True)

    # CREATE NODES
    for node in data["nodes"]:
        if node["type"] == "joint":

            pos = node["params"].get("position", [0, 0, 0])

            # 🔥 CRITICAL FIX: create joint in world mode
            joint = cmds.joint(
                name=node["name"],
                position=(0, 0, 0)
            )

            # 🔥 FORCE WORLD SPACE POSITION
            cmds.xform(joint, worldSpace=True, translation=pos)

            # prevent chain contamination
            cmds.select(clear=True)

            node_map[node["rig_id"]] = joint

        elif node["type"] == "limb":
            chain = build_limb(node)
            node_map[node["rig_id"]] = chain[0]

    # -----------------------------
    # CONNECTIONS (PARENTING)
    # -----------------------------
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

    cmds.select(clear=True)

    for i in range(joint_count):

        joint = cmds.joint(
            name=f"{node['name']}_{i}",
            position=(0, 0, 0)
        )

        # 🔥 same fix here
        cmds.xform(joint, worldSpace=True, translation=[i * spacing, 0, 0])

        joints.append(joint)
        cmds.select(clear=True)

    return joints