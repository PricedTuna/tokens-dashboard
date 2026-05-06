import { Filter, BarChart2, X } from 'lucide-react';

const FilterSidebar = ({ filters, setFilters, models, datasets, onFileUpload, onPreloadedSelect, currentFile, availableFiles, isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <BarChart2 className="logo-icon" size={24} />
          <div className="logo">Tron-TDV</div>
          <button className="mobile-close-button" onClick={onClose}>
            <X size={20} />
          </button>
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
            value={currentFile} 
            onChange={e => {
              onPreloadedSelect(e.target.value);
              if (window.innerWidth < 1024) onClose();
            }}
          >
            {availableFiles.map(file => (
              <option key={file} value={file}>{file}</option>
            ))}
            {currentFile && !availableFiles.includes(currentFile) && (
              <option value={currentFile}>Custom: {currentFile}</option>
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
            onChange={e => {
              setFilters(prev => ({ ...prev, model: e.target.value }));
              if (window.innerWidth < 1024) onClose();
            }}
          >
            <option value="">All Models</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="filter-section">
          <label>Dataset</label>
          <select 
            value={filters.dataset} 
            onChange={e => {
              setFilters(prev => ({ ...prev, dataset: e.target.value }));
              if (window.innerWidth < 1024) onClose();
            }}
          >
            <option value="">All Datasets</option>
            {datasets.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="filter-section">
          <label>Focus Format</label>
          <select 
            value={filters.format} 
            onChange={e => {
              setFilters(prev => ({ ...prev, format: e.target.value }));
              if (window.innerWidth < 1024) onClose();
            }}
          >
            <option value="">All Formats</option>
            <option value="tron">TRON</option>
            <option value="toon">TOON</option>
            <option value="jton">JTON</option>
          </select>
        </div>
      </div>

      
    </aside>
  );
};

export default FilterSidebar;
