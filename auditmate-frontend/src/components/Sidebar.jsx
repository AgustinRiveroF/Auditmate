import { Link } from 'react-router-dom'

const Sidebar = () => (
  <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
    <h2 className="text-2xl font-bold mb-4">Menú</h2>
    <nav className="flex flex-col space-y-2">
      <Link to="/" className="hover:bg-gray-700 p-2 rounded">Inicio</Link>
      <Link to="/about" className="hover:bg-gray-700 p-2 rounded">Acerca de</Link>
      <Link to="/analyze" className="hover:bg-gray-700 p-2 rounded">Analizar Contratos</Link>
    </nav>
  </aside>
)

export default Sidebar
