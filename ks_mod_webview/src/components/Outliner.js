export default function Outliner({ nodes, onSelect }) {
  return (
    <div style={{ padding: 10 }}>
      <h3>Outliner</h3>

      {nodes.map((node) => (
        <div
          key={node.id}
          style={{
            padding: "6px",
            cursor: "pointer",
            borderBottom: "1px solid #333"
          }}
          onClick={() => onSelect(node.id)}
        >
          {node.data.name || node.type}
        </div>
      ))}
    </div>
  );
}