import { useState, useMemo } from 'react'
import './App.css'
import data from '../example.json'
import { flattenData, calculateTotals } from './utils/data-utils'

// Pre-loaded data mapping
const preloadedModules = import.meta.glob('./data/preloaded/*.json', { eager: true });
const preloadedFiles = Object.keys(preloadedModules).reduce((acc, path) => {
  const name = path.split('/').pop().replace('.json', '');
  acc[name] = preloadedModules[path].default;
  return acc;
}, {});


// Components
import FilterSidebar from './components/FilterSidebar'
import KpiCard from './components/KpiCard'
import FormatComparison from './components/FormatComparison'
import MetricChart from './components/MetricChart'

function App() {
  const [rawData, setRawData] = useState(data)
  const [currentFileName, setCurrentFileName] = useState('example')
  const [filters, setFilters] = useState({
    model: '',
    dataset: '',
    format: ''
  })


  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result)
        setRawData(json)
        setCurrentFileName(file.name.replace('.json', ''))
      } catch (err) {
        alert("Error parsing JSON file. Please check the format.")
      }
    }
    reader.readAsText(file)
  }

  const handlePreloadedSelect = (name) => {
    if (name === 'example') {
      setRawData(data);
    } else if (preloadedFiles[name]) {
      setRawData(preloadedFiles[name]);
    }
    setCurrentFileName(name);
  }


  const allRows = useMemo(() => flattenData(rawData), [rawData])
  
  const filteredRows = useMemo(() => {
    return allRows.filter(row => {
      const matchModel = !filters.model || row.model === filters.model
      const matchDataset = !filters.dataset || row.dataset === filters.dataset
      return matchModel && matchDataset
    })
  }, [allRows, filters])

  const totals = useMemo(() => calculateTotals(filteredRows), [filteredRows])

  const models = useMemo(() => [...new Set(allRows.map(r => r.model))], [allRows])
  const datasets = useMemo(() => [...new Set(allRows.map(r => r.dataset))], [allRows])

  return (
    <div className="dashboard-container">
      <FilterSidebar 
        filters={filters} 
        setFilters={setFilters} 
        models={models} 
        datasets={datasets} 
        onFileUpload={handleFileUpload}
        onPreloadedSelect={handlePreloadedSelect}
        currentFile={currentFileName}
        availableFiles={Object.keys(preloadedFiles)}
      />


      <main className="main-content">
        <header className="main-header animate-in">
          <div className="header-title">
            <h1>Analytics Overview</h1>
            <p className="header-subtitle">Token efficiency and performance breakdown</p>
          </div>
          <div className="header-stats">
            <span className="stat-pill">Total evals: {filteredRows.length}</span>
          </div>
        </header>

        <div className="content-grid">
          <section className="comparison-section">
            <div className="section-header">
              <h2>Object Notation Efficiency</h2>
              <p>Comparing TRON, TOON, and JTON performance metrics</p>
            </div>
            <div className="format-grid">
               {(!filters.format || filters.format === 'tron') && (
                 <FormatComparison 
                   format={totals.tron} 
                   name="tron" 
                   totalEvals={filteredRows.length} 
                 />
               )}
               {(!filters.format || filters.format === 'toon') && (
                 <FormatComparison 
                   format={totals.toon} 
                   name="toon" 
                   totalEvals={filteredRows.length} 
                 />
               )}
               {(!filters.format || filters.format === 'jton') && (
                 <FormatComparison 
                   format={totals.jton} 
                   name="jton" 
                   totalEvals={filteredRows.length} 
                 />
               )}
            </div>
          </section>

          <MetricChart data={totals} title="Token Usage by Format" focusFormat={filters.format} />
        </div>

        <section className="summary-banner animate-in">
          <div className="total-tokens-summary">
            <span className="label">Total Tokens Consumed:</span>
            <span className="value">{totals.all.tokens.toLocaleString()}</span>
          </div>
          <div className="quick-metrics">
             <span>Avg Latency: {Math.round(totals.all.avgLatency)}ms</span>
             <span>Accuracy: {totals.all.accuracy.toFixed(1)}%</span>
          </div>
        </section>

        <section className="data-section">
           <div className="section-header">
             <h2>Detailed Evaluation Log</h2>
             <p>Individual prompt analysis and correctness mapping</p>
           </div>
           <div className="glass table-container">
             {filteredRows.length > 0 ? (
               <>
                 <table>
                   <thead>
                     <tr>
                       <th>Evaluation ID</th>
                       <th>Model / Dataset</th>
                       {(!filters.format || filters.format === 'tron') && <th>TRON Tokens</th>}
                       {(!filters.format || filters.format === 'toon') && <th>TOON Tokens</th>}
                       {(!filters.format || filters.format === 'jton') && <th>JTON Tokens</th>}
                     </tr>
                   </thead>
                   <tbody>
                     {filteredRows.slice(0, 50).map(row => (
                       <tr key={row.questionId} className="table-row">
                         <td>
                            <div className="id-cell">
                              <span className="q-id">{row.questionId}</span>
                            </div>
                         </td>
                         <td>
                           <div className="meta-cell">
                             <span className="m-name">{row.model}</span>
                             <span className="d-name">{row.dataset}</span>
                           </div>
                         </td>
                         {(!filters.format || filters.format === 'tron') && (
                           <td>
                              <div className={`token-cell ${row.formats.tron?.isCorrect ? 'c-correct' : 'c-error'}`}>
                                {row.formats.tron?.tokens.total.toLocaleString()}
                              </div>
                           </td>
                         )}
                         {(!filters.format || filters.format === 'toon') && (
                           <td>
                              <div className={`token-cell ${row.formats.toon?.isCorrect ? 'c-correct' : 'c-error'}`}>
                                {row.formats.toon?.tokens.total.toLocaleString()}
                              </div>
                           </td>
                         )}
                         {(!filters.format || filters.format === 'jton') && (
                           <td>
                              <div className={`token-cell ${row.formats.jton?.isCorrect ? 'c-correct' : 'c-error'}`}>
                                {row.formats.jton?.tokens.total.toLocaleString()}
                              </div>
                           </td>
                         )}
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {filteredRows.length > 50 && (
                   <div className="table-footer">
                     Showing 50 of {filteredRows.length} total evaluations
                   </div>
                 )}
               </>
             ) : (
               <div className="no-results">
                 <p>No evaluations match your current filters.</p>
               </div>
             )}
           </div>
        </section>
      </main>
    </div>
  )
}

export default App
