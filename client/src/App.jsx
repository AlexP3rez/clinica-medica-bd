import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CrearCita from './pages/citas/CrearCita';
import CancelarCita from './pages/citas/CancelarCita';
import HorariosLibres from './pages/citas/HorariosLibres';
import RegistrarPago from './pages/pagos/RegistrarPago';
import SaldoPaciente from './pages/pagos/SaldoPaciente';
import CrearHistorial from './pages/historiales/CrearHistorial';
import HistorialPaciente from './pages/historiales/HistorialPaciente';
import RankingMedicos from './pages/reportes/RankingMedicos';
import FacturacionMensual from './pages/reportes/FacturacionMensual';
import TopDiagnosticos from './pages/reportes/TopDiagnosticos';
import MedicamentosEspecialidad from './pages/reportes/MedicamentosEspecialidad';
import AnalisisAvanzado from './pages/reportes/AnalisisAvanzado';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/citas/nueva" element={<CrearCita />} />
        <Route path="/citas/cancelar" element={<CancelarCita />} />
        <Route path="/citas/horarios" element={<HorariosLibres />} />
        <Route path="/pagos/registrar" element={<RegistrarPago />} />
        <Route path="/pagos/saldo" element={<SaldoPaciente />} />
        <Route path="/historiales/nuevo" element={<CrearHistorial />} />
        <Route path="/historiales/paciente/:id" element={<HistorialPaciente />} />
        <Route path="/reportes/ranking" element={<RankingMedicos />} />
        <Route path="/reportes/facturacion" element={<FacturacionMensual />} />
        <Route path="/reportes/diagnosticos" element={<TopDiagnosticos />} />
        <Route path="/reportes/medicamentos" element={<MedicamentosEspecialidad />} />
        <Route path="/reportes/analisis" element={<AnalisisAvanzado />} />
      </Routes>
    </Layout>
  );
}
