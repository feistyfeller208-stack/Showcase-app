
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { 
  PlusIcon, ChartBarIcon, QrCodeIcon, Cog6ToothIcon, 
  HomeIcon, SwatchIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Catalog } from './types';
import { auth, subscribeToAuth, signOut, getCatalogs, createCatalog, updateCatalog } from './services/firebase';

import Dashboard from './components/Dashboard';
import CatalogEditor from './components/CatalogEditor';
import PublicCatalog from './components/PublicCatalog';
import Analytics from './components/Analytics';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ThemeCustomizer from './components/ThemeCustomizer';
import ShareDistribution from './components/ShareDistribution';

const AppLayout: React.FC<{ children: React.ReactNode, logout: () => void }> = ({ children, logout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen md:pl-72 bg-slate-50/50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 h-full bg-white border-r fixed left-0 top-0 p-10 z-30">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-[#2563EB] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-100">S</div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">Showcase</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavLink active={isActive('/')} icon={<HomeIcon className="w-5 h-5" />} label="Dashboard" onClick={() => navigate('/')} />
          <NavLink active={isActive('/create')} icon={<PlusIcon className="w-5 h-5" />} label="New Catalog" onClick={() => navigate('/create')} />
          <NavLink active={isActive('/design')} icon={<SwatchIcon className="w-5 h-5" />} label="Design Studio" onClick={() => navigate('/design')} />
          <NavLink active={isActive('/analytics')} icon={<ChartBarIcon className="w-5 h-5" />} label="Insights" onClick={() => navigate('/analytics')} />
          <NavLink active={isActive('/share')} icon={<QrCodeIcon className="w-5 h-5" />} label="QR Center" onClick={() => navigate('/share')} />
        </nav>

        <div className="pt-8 border-t mt-auto space-y-2">
          <NavLink active={isActive('/settings')} icon={<Cog6ToothIcon className="w-5 h-5" />} label="Account" onClick={() => navigate('/settings')} />
          <button onClick={logout} className="flex items-center gap-4 w-full px-6 py-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all text-sm font-bold uppercase tracking-widest">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900 text-white rounded-3xl flex justify-around p-4 z-50 shadow-2xl shadow-blue-900/20">
        <MobileNavLink active={isActive('/')} icon={<HomeIcon className="w-6 h-6" />} onClick={() => navigate('/')} />
        <MobileNavLink active={isActive('/create')} icon={<PlusIcon className="w-6 h-6" />} onClick={() => navigate('/create')} />
        <MobileNavLink active={isActive('/design')} icon={<SwatchIcon className="w-6 h-6" />} onClick={() => navigate('/design')} />
        <MobileNavLink active={isActive('/analytics')} icon={<ChartBarIcon className="w-6 h-6" />} onClick={() => navigate('/analytics')} />
      </nav>

      <main className="flex-1 p-6 md:p-14 max-w-7xl mx-auto w-full pb-32 md:pb-14">
        {children}
      </main>
    </div>
  );
};

const NavLink: React.FC<{ active: boolean, icon: React.ReactNode, label: string, onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl transition-all text-sm font-bold uppercase tracking-widest ${active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
  >
    {icon}
    {label}
  </button>
);

const MobileNavLink: React.FC<{ active: boolean, icon: React.ReactNode, onClick: () => void }> = ({ active, icon, onClick }) => (
  <button onClick={onClick} className={`p-2 transition-all active:scale-90 ${active ? 'text-blue-400' : 'text-slate-500'}`}>
    {icon}
  </button>
);

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        fetchCatalogs(u.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchCatalogs = async (uid: string) => {
    const list = await getCatalogs(uid);
    setCatalogs(list);
  };

  const handleSave = async (catalog: Catalog): Promise<string> => {
    if (!user) throw new Error("Unauthorized");
    let targetId = catalog.id;
    if (targetId) {
      await updateCatalog(targetId, catalog);
    } else {
      targetId = await createCatalog(user.uid, catalog);
    }
    await fetchCatalogs(user.uid);
    return targetId;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        
        {/* Public Catalog Viewports */}
        <Route path="/view/:slug" element={<PublicCatalog />} />
        <Route path="/view/id/:id" element={<PublicCatalog />} />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={user ? <AppLayout logout={signOut}><Dashboard catalogs={catalogs} /></AppLayout> : <Navigate to="/login" />} />
        <Route path="/create" element={user ? <AppLayout logout={signOut}><CatalogEditor onSave={handleSave} /></AppLayout> : <Navigate to="/login" />} />
        <Route path="/edit/:id" element={user ? <AppLayout logout={signOut}><CatalogEditor catalogs={catalogs} onSave={handleSave} /></AppLayout> : <Navigate to="/login" />} />
        <Route path="/analytics" element={user ? <AppLayout logout={signOut}><Analytics catalogs={catalogs} /></AppLayout> : <Navigate to="/login" />} />
        <Route path="/design" element={user ? <AppLayout logout={signOut}><ThemeCustomizer catalog={catalogs[0]} onUpdate={handleSave} /></AppLayout> : <Navigate to="/login" />} />
        <Route path="/share" element={user ? <AppLayout logout={signOut}><ShareDistribution catalog={catalogs[0]} onUpdate={handleSave} /></AppLayout> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
