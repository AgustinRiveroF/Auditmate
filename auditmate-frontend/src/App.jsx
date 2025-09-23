import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/Home'
import About from './pages/About'
import ContractAnalyzer from './components/ContractAnalyzer'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="analyze" element={<ContractAnalyzer />} />
      </Route>
    </Routes>
  )
}

export default App

