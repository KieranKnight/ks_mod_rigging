import { useState, useEffect } from "react";

export default function Inspector({ selectedNode, onChange }) {
  const [name, setName] = useState("");
  const [jointCount, setJointCount] = useState(3);

  useEffect(() => {
    if (!selectedNode) return;

    setName(selectedNode.data.name || "");
    setJointCount(selectedNode.data.joint_count || 3);
  }, [selectedNode]);

  if (!selectedNode) {
    return <div style={{ padding: 10 }}>No selection</div>;
  }

  const applyChanges = () => {
    onChange(selectedNode.id, {
      name,
      joint_count: jointCount
    });
  };

  return (
    <div style={{ padding: 10 }}>
      <h3>Inspector</h3>

      <label>Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%" }}
      />

      <label>Joint Count</label>
      <input
        type="number"
        value={jointCount}
        onChange={(e) => setJointCount(parseInt(e.target.value))}
        style={{ width: "100%" }}
      />

      <button onClick={applyChanges}>Apply</button>
    </div>
  );
}