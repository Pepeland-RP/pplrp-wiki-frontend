'use client';

import ModelCard from '@/components/Models/ModelCard';

export default function ModelsPage() {
  return (
    <div className="models-page">
      <div className="models-container">
        <div className="models-header">
          <h1 className="models-title">Модели</h1>
        </div>

        <div className="models-grid">
          <ModelCard name="test" category="Новое" />
          {/*<ModelCard name="test" category="Новое" />
          <ModelCard name="test" category="Новое" />
          <ModelCard name="test" category="Новое" />
          <ModelCard name="test" category="Новое" />
          <ModelCard name="test" category="Новое" />

          просто плейсхолдеры временные.

          */}
        </div>
      </div>
    </div>
  );
}
