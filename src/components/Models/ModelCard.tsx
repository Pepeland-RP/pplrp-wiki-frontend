'use client';

import '../../styles/Models/models.css';

interface ModelCardProps {
  name?: string;
  category?: string;
}

export default function ModelCard({
  name = 'test',
  category = 'Новое',
}: ModelCardProps) {
  return (
    <div className="model-card">
      <div className="model-preview">
        <div className="grid-background" />

        <div className="model-badge">{category}</div>

        <div className="image-container">
          <p>placeholder</p>
        </div>
      </div>

      <div className="model-info">
        <div className="model-details">
          <h3 className="model-name">{name}</h3>
          <div className="model-icons">
            <div className="model-icon-placeholder"></div>
            <div className="model-icon-placeholder"></div>
            <div className="model-icon-placeholder"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
/* просто тестовые плейсхолдеры без бека. я пукнул. */
