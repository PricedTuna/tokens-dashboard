import React from 'react';
import { Filter, Search, BarChart2 } from 'lucide-react';

const FilterSidebar = ({ filters, setFilters, models, datasets, onFileUpload, onPreloadedSelect, currentFile, availableFiles }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <BarChart2 className="logo-icon" size={24} />
          <div className="logo">TokenDash</div>
        </div>
        <p className="subtitle">Evaluation Analytics</p>
      </div>
      
      <div className="filter-group">
        <div className="group-title">
          <BarChart2 size={14} />
          <span>Data Management</span>
        </div>
        <div className="filter-section">
          <label className="upload-label">
            <input 
              type="file" 
              accept=".json" 
              onChange={onFileUpload} 
              style={{ display: 'none' }}
            />
            <div className="upload-button">Load New JSON</div>
          </label>
        </div>

        <div className="filter-section">
          <label>Quick Select</label>
          <select 
            value={availableFiles.includes(currentFile) || currentFile === 'example' ? currentFile : 'custom'} 
            onChange={e => onPreloadedSelect(e.target.value)}
          >
            <option value="example">Default (Example)</option>
            {availableFiles.map(file => (
              <option key={file} value={file}>{file}</option>
            ))}
            {!availableFiles.includes(currentFile) && currentFile !== 'example' && (
              <option value="custom">Custom: {currentFile}</option>
            )}
          </select>
        </div>
      </div>

      <div className="filter-group">
        <div className="group-title">
          <Filter size={14} />
          <span>Filters</span>
        </div>
        
        <div className="filter-section">
          <label>Model</label>
          <select 
            value={filters.model} 
            onChange={e => setFilters(prev => ({ ...prev, model: e.target.value }))}
          >
            <option value="">All Models</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="filter-section">
          <label>Dataset</label>
          <select 
            value={filters.dataset} 
            onChange={e => setFilters(prev => ({ ...prev, dataset: e.target.value }))}
          >
            <option value="">All Datasets</option>
            {datasets.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="version-pill">v2.0.0-aesthetic</div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
