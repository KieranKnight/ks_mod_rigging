import React from "react";
import { Handle, Position } from "reactflow";

export default function LimbNode({ data }) {
    return (
        <div style={{
            padding:10,
            border: "2px solid #2196F3",
            borderRadius: 5,
            background: "#1e1e1e",
            color: "white"
        }}>
            <Handle type="target" position={Position.Top} />
            <strong>Limb</strong>
            <div>{data.name}</div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}