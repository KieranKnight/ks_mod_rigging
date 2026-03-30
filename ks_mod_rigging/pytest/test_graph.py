import ks_mod_rigging.core.nodes 
from ks_mod_rigging.core.graph import RigGraph
from ks_mod_rigging.core.nodes.joint import JointNode
from ks_mod_rigging.core.registry import NodeRegistry

print("Registered node types: ", NodeRegistry.get_registered_types())

graph = RigGraph()

root = JointNode("root")
arm = JointNode("arm_L")

graph.add_nodes(root)
graph.add_nodes(arm)

graph.connect(root.id, arm.id)

print(graph.to_dict())
