import { useState, useCallback } from "react";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import DownloadLinks from "./DownloadLinks";

const ROOT_STYLE = {
  background: "#6366f1",
  color: "white",
  borderRadius: "10px",
  padding: "8px 16px",
  fontWeight: "bold",
  fontSize: "13px",
  border: "none",
  boxShadow: "0 0 12px rgba(99,102,241,0.5)",
  cursor: "pointer",
};

const CHILD_STYLE = {
  background: "#1e293b",
  color: "#e2e8f0",
  borderRadius: "8px",
  padding: "6px 14px",
  fontSize: "12px",
  border: "1px solid #475569",
  cursor: "pointer",
};

const SELECTED_STYLE = {
  background: "#0f172a",
  color: "#a5b4fc",
  borderRadius: "8px",
  padding: "6px 14px",
  fontSize: "12px",
  border: "2px solid #6366f1",
  cursor: "pointer",
  boxShadow: "0 0 8px rgba(99,102,241,0.4)",
};

function buildFlowNodes(apiNodes, apiEdges, selectedId) {
  if (!apiNodes || apiNodes.length === 0) return [];

  const targets = new Set((apiEdges || []).map((e) => e.target));
  const rootId = apiNodes.find((n) => !targets.has(n.id))?.id || apiNodes[0].id;
  const nonRoot = apiNodes.filter((n) => n.id !== rootId);
  const count = nonRoot.length;

  return apiNodes.map((node) => {
    const isRoot = node.id === rootId;
    const isSelected = node.id === selectedId;

    let style;
    if (isSelected) {
      style = isRoot
        ? { ...ROOT_STYLE, border: "2px solid #a5b4fc", boxShadow: "0 0 16px rgba(99,102,241,0.8)" }
        : SELECTED_STYLE;
    } else {
      style = isRoot ? ROOT_STYLE : CHILD_STYLE;
    }

    if (isRoot) {
      return {
        id: node.id,
        data: { label: node.label, detail: node.detail },
        position: { x: 220, y: 20 },
        style,
      };
    }

    const idx = nonRoot.findIndex((n) => n.id === node.id);
    const angle =
      count === 1 ? Math.PI / 2 : (idx / count) * 2 * Math.PI - Math.PI / 2;
    const radius = 180;

    return {
      id: node.id,
      data: { label: node.label, detail: node.detail },
      position: {
        x: 220 + radius * Math.cos(angle),
        y: 230 + radius * Math.sin(angle),
      },
      style,
    };
  });
}

function buildFlowEdges(apiEdges) {
  return (apiEdges || []).map((e) => ({
    id: e.id || `e-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
  }));
}

export default function GraphView({ nodes: apiNodes, edges: apiEdges, exportData }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeClick = useCallback(
    (_, node) => {
      if (selectedNode?.id === node.id) {
        setSelectedNode(null);
      } else {
        setSelectedNode({ id: node.id, label: node.data.label, detail: node.data.detail });
      }
    },
    [selectedNode]
  );

  // Reset selection when new data comes in
  const nodes = buildFlowNodes(apiNodes, apiEdges, selectedNode?.id);
  const edges = buildFlowEdges(apiEdges);

  if (!apiNodes || apiNodes.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-500 gap-3">
        <span className="text-5xl">🗺️</span>
        <p className="text-sm">생각을 입력하면 마인드맵이 생성됩니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <h2 className="text-lg font-semibold text-slate-200 flex-shrink-0">
        🗺️ 생각 그래프
        <span className="ml-2 text-xs text-slate-500 font-normal">
          노드를 클릭하면 상세 내용을 볼 수 있습니다
        </span>
      </h2>

      {/* Detail panel */}
      <div
        className={`flex-shrink-0 overflow-hidden transition-all duration-300 ${
          selectedNode ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {selectedNode && (
          <div className="bg-slate-900 border border-indigo-500/50 rounded-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-indigo-300 font-semibold text-sm mb-2">
                  📌 {selectedNode.label}
                </p>
                {Array.isArray(selectedNode.detail) && selectedNode.detail.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {selectedNode.detail.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-xs">상세 정보가 없습니다.</p>
                )}
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-slate-300 flex-shrink-0 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Graph */}
      <div className="flex-1 rounded-lg overflow-hidden border border-slate-700">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background color="#334155" gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {/* 다운로드 링크 */}
      <DownloadLinks exportData={exportData} />
    </div>
  );
}
