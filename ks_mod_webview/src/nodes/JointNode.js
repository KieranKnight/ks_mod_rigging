import React from "react";
import { Handle, Position } from "reactflow";

export default function JointNode({ data }) {
  return (
    <div
      style={{
        padding: 10,
        border: "2px solid #4CAF50",
        borderRadius: 5,
        background: "#1e1e1e",
        color: "white"
      }}
    >
      <Handle type="target" position={Position.Top} />

      <strong>Joint</strong>
      <div>{data.name}</div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}