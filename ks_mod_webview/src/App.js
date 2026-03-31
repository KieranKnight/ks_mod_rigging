import { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  applyNodeChanges
} from "reactflow";
import "reactflow/dist/style.css";

import Outliner from "./components/Outliner";
import Inspector from "./components/Inspector";
import RigPreview from "./components/RigPreview";

export default function App() {
  // ----------------------------
  // STATE
  // ----------------------------
  const [nodes, setNodes] = useState([
    { id: "1", position: { x: 100, y: 100 }, data: { label: "Shoulder", name: "Shoulder" } },
    { id: "2", position: { x: 200, y: 200 }, data: { label: "Elbow", name: "Elbow" } },
    { id: "3", position: { x: 300, y: 300 }, data: { label: "Wrist", name: "Wrist" } }
  ]);

  const [edges, setEdges] = useState([
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" }
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // ----------------------------
  // LOAD SAVE (STEP A)
  // ----------------------------
  useEffect(() => {
    const saved =
      localStorage.getItem("rig_save") ||
      localStorage.getItem("rig_autosave");

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (parsed.nodes) setNodes(parsed.nodes);
      if (parsed.edges) setEdges(parsed.edges);

      console.log("📦 Rig loaded");
    } catch (err) {
      console.error("Load failed:", err);
    }
  }, []);

  // ----------------------------
  // AUTOSAVE (STEP B)
  // ----------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(
        "rig_autosave",
        JSON.stringify({ nodes, edges, timestamp: Date.now() })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [nodes, edges]);

  // ----------------------------
  // SAVE
  // ----------------------------
  const saveRig = () => {
    const cleanNodes = nodes.map((n) => ({
      id: n.id,
      position: n.position,
      data: n.data
    }));

    const cleanEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target
    }));

    const data = {
      nodes: cleanNodes,
      edges: cleanEdges,
      timestamp: Date.now()
    };

    localStorage.setItem("rig_save", JSON.stringify(data));

    console.log("💾 Saved rig:", data);
    alert("Rig saved ✔"); // 🔥 immediate feedback
  };

  // ----------------------------
  // SAVE TO MAYA
  // ----------------------------
  const saveToMaya = async () => {
    try {
      const rig = {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type || "joint",
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

      if (!saveData?.rig_id) {
        throw new Error("Missing rig_id from backend");
      }

      const buildRes = await fetch(
        `http://127.0.0.1:8000/rigs/${saveData.rig_id}/build`,
        { method: "POST" }
      );

      const buildData = await buildRes.json();

      console.log("BUILD RESPONSE:", buildData);

      if (!buildData?.filepath) {
        throw new Error("Missing filepath from backend");
      }

      alert(`Run this in Maya:\n\nbuild_rig_from_file("${buildData.filepath}")`);

    } catch (err) {
      console.error("Save to Maya failed:", err);
      alert("Save to Maya failed — check console");
    }
  };

  // ----------------------------
  // NODE CHANGES (DRAG FIX)
  // ----------------------------
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  // ----------------------------
  // INSPECTOR UPDATE (GRAPH LABEL FIXED)
  // ----------------------------
  const updateSelectedNodeName = (value) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== selectedNodeId) return n;

        return {
          ...n,
          data: {
            ...n.data,
            name: value,
            label: value // 🔥 REQUIRED for React Flow display
          }
        };
      })
    );
  };

  // ----------------------------
  // ON Edge Connect
  // ----------------------------
  const onConnect = (connection) => {
    setEdges((eds) => addEdge(connection, eds));
  };

  // ----------------------------
  // RIGHT CLICK MENU
  // ----------------------------
  const [menu, setMenu] = useState(null);

  const onContextMenu = (event) => {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();

    setMenu({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  const closeMenu = () => setMenu(null);

  const addNode = () => {
    const id = (nodes.length + 1).toString();

    setNodes([
      ...nodes,
      {
        id,
        position: { x: 200, y: 200 },
        data: { label: `Node ${id}`, name: `Node ${id}` }
      }
    ]);

    closeMenu();
  };

  // ----------------------------
  // SELECTED NODE
  // ----------------------------
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* OUTLINER */}
      <div style={{ width: "18%", background: "#1e1e1e", color: "white" }}>
        <Outliner nodes={nodes} onSelect={setSelectedNodeId} />
      </div>

      {/* CENTER */}
      <div style={{ flex: 1, position: "relative" }}>

        {/* TOP BAR */}
        <div style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 10px",
          background: "#111",
          color: "white"
        }}>
          <button onClick={saveRig}>💾 Save</button>
          <button onClick={saveToMaya}>🚀 Save to Maya</button>
        </div>

        {/* GRAPH */}
        <div style={{ height: "calc(50% - 40px)" }} onContextMenu={onContextMenu}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onConnect={onConnect}   // 🔥 THIS FIXES CONNECTIONS
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        {/* 3D */}
        <div style={{ height: "50%" }}>
          <RigPreview
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
          />
        </div>

        {/* MENU */}
        {menu && (
          <div
            style={{
              position: "absolute",
              top: menu.y + 40,
              left: menu.x,
              background: "#222",
              color: "white",
              padding: 10,
              borderRadius: 6,
              zIndex: 9999
            }}
          >
            <div onClick={addNode}>➕ Add Node</div>
            <div onClick={closeMenu}>❌ Close</div>
          </div>
        )}
      </div>

      {/* INSPECTOR */}
      <div style={{ width: "25%", padding: 10, background: "#2a2a2a", color: "white" }}>
        <h3>Inspector</h3>

        {selectedNode ? (
          <input
            value={selectedNode.data.name || ""}
            onChange={(e) => updateSelectedNodeName(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        ) : (
          <div>Select a node</div>
        )}
      </div>
    </div>
  );
}