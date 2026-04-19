import { NodeRegistry, PALETTE_GROUP_ORDER } from '../../registry/NodeRegistry';

function DraggableItem({ type }: { type: string }) {
  const def = NodeRegistry[type];
  if (!def) return null;
  const { label, description, color, icon: Icon } = def.meta;

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/reactflow-type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="palette-item"
      draggable
      onDragStart={onDragStart}
      style={{ '--item-color': color } as React.CSSProperties}
    >
      <div className="palette-item__icon" style={{ background: `${color}18`, color }}>
        <Icon size={16} />
      </div>
      <div className="palette-item__text">
        <span className="palette-item__label">{label.replace(' Node', '').replace(' Step', '')}</span>
        <span className="palette-item__desc">{description}</span>
      </div>
      <div className="palette-item__drag-hint">⠿</div>
    </div>
  );
}

export function NodePalette() {
  // Build groups from registry in defined order
  const groups = PALETTE_GROUP_ORDER.map((groupName) => ({
    title: groupName,
    types: Object.entries(NodeRegistry)
      .filter(([, def]) => def.meta.paletteGroup === groupName)
      .map(([type]) => type),
  }));

  return (
    <aside className="node-palette">
      <div className="palette-header">
        <h2 className="palette-title">Node Library</h2>
        <p className="palette-subtitle">Drag nodes to the canvas</p>
      </div>

      <div className="palette-groups">
        {groups.map((group) => (
          <div key={group.title} className="palette-group">
            <span className="palette-group__title">{group.title}</span>
            {group.types.map((type) => (
              <DraggableItem key={type} type={type} />
            ))}
          </div>
        ))}
      </div>

      <div className="palette-hint">
        <p>💡 Click a node to configure it</p>
      </div>
    </aside>
  );
}
