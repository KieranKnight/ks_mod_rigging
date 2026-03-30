import React, { useCallback, useState, useRef } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState
} from "reactflow";

import "reactflow/dist/style.css";

//Custom node
import JointNode from "./nodes/JointNode";
import LimbNode from "./nodes/limbNode";
import RigPreview from "./components/RigPreview";

const nodeTypes = {
  joint: JointNode,
  limb: LimbNode
};

const initialNodes = [
  {
    id: "1",
    type: "joint",
    position: { x: 100, y: 100 },
    data: { name: "root" }
  },
  {
    id: "2",
    type: "joint",
    position: { x: 300, y: 200 },
    data: { name: "arm_L" }
  }
];

const initialEdges = [];

export default function App() {
  const containerRef = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  //FIXED selection handling
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const [menuPosition, setMenuPosition] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // Add node
  const addNode = (type) => {
    const id = (nodes.length + 1).toString();

    const newNode = {
      id,
      type,
      position: {
        x: menuPosition.x - 100,
        y: menuPosition.y - 100
      },
      data: {
        name: `${type}_${id}`
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setMenuPosition(null);
  };

  //Save to FastAPI
  const saveRig = async () => {
    const rig = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        name: n.data.name,
        params: {
          position: [n.position.x, n.position.y, 0]
        }
      })),
      connections: edges.map((e) => ({
        from_node: e.source,
        to_node: e.target
      }))
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/rigs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(rig)
      });

      const data = await res.json();
      console.log("Saved rig:", data);
    } catch (err) {
      console.error("Error saving rig:", err);
    }
  };


  const buildInMaya = async () => {
    // First save rig
    const rig = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        name: n.data.name,
        params: {
          position: [n.position.x, n.position.y, 0],
          joint_count: n.data.joint_count || 3
        }
      })),
      connections: edges.map((e) => ({
        from_node: e.source,
        to_node: e.target
      }))
    };

    const saveRes = await fetch("http://127.0.0.1:8000/rigs/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rig)
    });

    const saveData = await saveRes.json();

    console.log("RAW SAVE RESPONSE:", saveData);
    console.log("IS ARRAY?", Array.isArray(saveData));
    

    // Then build
    const buildRes = await fetch(
      `http://127.0.0.1:8000/rigs/${saveData['rig_id']}/build`,
      { method: "POST" }
    );

    alert(saveData["rig_id"])

    const buildData = await buildRes.json();

    console.log("Build file:", buildData.filepath);

    alert(`Run this in Maya:\n\nbuild_rig_from_file("${buildData.filepath}")`);
  };
  

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>

      {/* 🧊 LEFT: 3D Preview */}
      <div style={{ width: "40%", height: "100%", borderRight: "1px solid #333" }}>
        <RigPreview nodes={nodes} edges={edges} />
      </div>

      {/* 🧠 RIGHT: Node Editor */}
      <div
        ref={containerRef}
        style={{ width: "60%", height: "100%", position: "relative" }}
      >
        
        {/* Buttons */}
        <button
          onClick={saveRig}
          style={{ position: "absolute", zIndex: 10, top: 10, left: 10 }}
        >
          Save
        </button>

        <button
          onClick={buildInMaya}
          style={{ position: "absolute", zIndex: 10, top: 50, left: 10 }}
        >
          Build
        </button>

        {/* Inspector */}
        {selectedNode && (
          <div style={{
            position: "absolute",
            right: 10,
            top: 10,
            background: "#222",
            color: "white",
            padding: 10,
            zIndex: 10
          }}>
            <h3>Inspector</h3>

            <label>Name:</label>
            <input
              value={selectedNode.data.name || ""}
              onChange={(e) => {
                const newName = e.target.value;

                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === selectedNodeId
                      ? { ...n, data: { ...n.data, name: newName } }
                      : n
                  )
                );
              }}
            />
          </div>
        )}

        {/* React Flow */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(event, node) => setSelectedNodeId(node.id)}
          onPaneContextMenu={(event) => {
            event.preventDefault();

            const bounds = containerRef.current.getBoundingClientRect();

            const x = Math.min(event.clientX - bounds.left, bounds.width - 150);
            const y = Math.min(event.clientY - bounds.top, bounds.height - 100);

            setMenuPosition({ x, y });
          }}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>

        {/* Context Menu */}
        {menuPosition && (
          <div style={{
            position: "absolute",
            top: menuPosition.y,
            left: menuPosition.x,
            background: "#333",
            color: "white",
            padding: 10,
            zIndex: 20
          }}>
            <div onClick={() => addNode("joint")}>➕ Joint</div>
            <div onClick={() => addNode("limb")}>➕ Limb</div>
          </div>
        )}

      </div>
    </div>
  );
}