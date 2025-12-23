
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  PhoneIcon, ChatBubbleLeftRightIcon, MapPinIcon, MagnifyingGlassIcon,
  XMarkIcon, ShareIcon, ShoppingBagIcon, InformationCircleIcon,
  HeartIcon as HeartOutline, ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Catalog, CatalogTheme, CatalogItem } from '../types';
import { getCatalogBySlug, getCatalogById, trackEngagement } from '../services/firebase';

const PublicCatalog: React.FC = () => {
  const { slug, id } = useParams();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = id ? await getCatalogById(id) : (slug ? await getCatalogBySlug(slug) : null);
        if (data) {
          setCatalog(data);
          trackEngagement(data.id, 'views');
          const saved = JSON.parse(localStorage.getItem('showcase_favorites') || '[]');
          setIsSaved(saved.includes(data.id));
        } else {
          setError('NOT_FOUND');
        }
      } catch (err) {
        setError('NETWORK_ERROR');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, id]);

  const categories = useMemo(() => 
    Array.from(new Set(catalog?.items.map(i => i.category))).filter(Boolean)
  , [catalog]);

  const filteredItems = useMemo(() => 
    catalog?.items.filter(item => 
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!activeCategory || item.category === activeCategory)
    ) || []
  , [catalog, searchQuery, activeCategory]);

  const toggleSave = () => {
    if (!catalog) return;
    const saved = JSON.parse(localStorage.getItem('showcase_favorites') || '[]');
    const newSaved = isSaved ? saved.filter((s: string) => s !== catalog.id) : [...saved, catalog.id];
    localStorage.setItem('showcase_favorites', JSON.stringify(newSaved));
    setIsSaved(!isSaved);
  };

  const handleCTA = (type: string, href: string) => {
    if (catalog) trackEngagement(catalog.id, type);
    window.location.href = href;
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center animate-pulse">Loading Catalog...</div>;
  if (error || !catalog) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
    <h1 className="text-3xl font-black mb-4">Catalog Not Available</h1>
    <p className="text-slate-500 max-w-xs">The link might be broken or the merchant has taken this catalog offline.</p>
  </div>;

  const { theme, template } = catalog;
  const accent = theme.primaryColor || '#2563EB';

  return (
    <div className={`min-h-screen ${theme.font} flex flex-col`} style={{ backgroundColor: theme.backgroundColor || '#ffffff', color: theme.textColor || '#0F172A' }}>
      <header className="px-6 py-12 flex flex-col items-center text-center">
        {catalog.logoUrl && <img src={catalog.logoUrl} className={`w-24 h-24 mb-6 object-cover shadow-2xl ${theme.logoStyle === 'circle' ? 'rounded-full' : 'rounded-3xl'}`} alt="Logo" />}
        <h1 className={`font-black tracking-tight ${theme.fontSizeHeading || 'text-4xl'}`}>{catalog.businessName}</h1>
        <p className={`mt-2 opacity-60 font-medium max-w-sm mx-auto ${theme.fontSizeBody || 'text-base'}`}>{catalog.description}</p>

        <div className="flex gap-4 mt-10 w-full max-w-sm">
          {catalog.phoneNumber && <ContactButton icon={<PhoneIcon className="w-6 h-6" />} onClick={() => handleCTA('callClicks', `tel:${catalog.phoneNumber}`)} />}
          {catalog.whatsappNumber && <ContactButton icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />} onClick={() => handleCTA('whatsappClicks', `https://wa.me/${catalog.whatsappNumber}`)} />}
          {catalog.address && <ContactButton icon={<MapPinIcon className="w-6 h-6" />} onClick={() => handleCTA('directionClicks', `https://maps.google.com/?q=${encodeURIComponent(catalog.address!)}`)} />}
        </div>
      </header>

      <div className="sticky top-0 z-40 bg-inherit/95 backdrop-blur-md px-6 py-4 space-y-4 border-b border-black/5">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-4 bg-black/5 rounded-2xl text-sm font-bold border-none" />
        </div>
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button onClick={() => setActiveCategory(null)} className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest ${!activeCategory ? 'bg-slate-900 text-white' : 'bg-black/5'}`}>All</button>
            {categories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest ${activeCategory === cat ? 'bg-slate-900 text-white' : 'bg-black/5'}`}>{cat}</button>)}
          </div>
        )}
      </div>

      <main className="flex-1 px-6 py-10">
        <div className={template === CatalogTheme.GALLERY ? "grid grid-cols-2 gap-4" : "flex flex-col gap-6"}>
          {filteredItems.map(item => <ItemTile key={item.id} item={item} template={template} color={accent} onClick={() => setSelectedItem(item)} />)}
        </div>
      </main>

      <div className="sticky bottom-6 left-6 right-6 z-50 flex gap-3">
        <button onClick={toggleSave} className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center bg-white ${isSaved ? 'text-rose-500' : 'text-slate-300'}`}>
          {isSaved ? <HeartSolid className="w-6 h-6" /> : <HeartOutline className="w-6 h-6" />}
        </button>
        <button onClick={() => handleCTA('callClicks', `tel:${catalog.phoneNumber}`)} className="flex-1 h-14 rounded-2xl shadow-2xl text-white font-black uppercase tracking-widest text-xs" style={{ backgroundColor: accent }}>Call to Order</button>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden animate-up">
            <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full"><XMarkIcon className="w-6 h-6" /></button>
            {selectedItem.imageUrl && <img src={selectedItem.imageUrl} className="w-full aspect-square object-cover" />}
            <div className="p-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-3xl font-black">{selectedItem.name}</h3>
                <p className="text-2xl font-black" style={{ color: accent }}>${selectedItem.price}</p>
              </div>
              <p className="text-slate-500 leading-relaxed">{selectedItem.description}</p>
              <button onClick={() => setSelectedItem(null)} className="w-full py-5 rounded-[2rem] text-white font-black uppercase tracking-widest mt-10" style={{ backgroundColor: accent }}>Order via WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ContactButton = ({ icon, onClick }: any) => (
  <button onClick={onClick} className="flex-1 flex flex-col items-center gap-2 p-5 bg-black/5 rounded-2xl active:scale-95 transition-all">{icon}</button>
);

const ItemTile = ({ item, template, color, onClick }: any) => {
  if (template === CatalogTheme.MINIMALIST) return (
    <div onClick={onClick} className="py-6 border-b border-black/5 flex justify-between items-center group cursor-pointer active:opacity-50 transition-opacity">
      <div className="flex-1 pr-8">
        <h4 className="font-bold text-lg tracking-tight">{item.name}</h4>
        <p className="text-xs opacity-40 font-medium line-clamp-1 mt-1">{item.description}</p>
      </div>
      <div className="text-right flex items-center gap-3">
        <span className="font-black text-lg" style={{ color }}>${item.price}</span>
        <ChevronRightIcon className="w-4 h-4 opacity-10" />
      </div>
    </div>
  );
  return (
    <div onClick={onClick} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-5 active:scale-[0.98] transition-all cursor-pointer">
      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-50 shadow-inner">
        {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ShoppingBagIcon className="w-8 h-8" /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-black text-slate-900 leading-tight truncate pr-2">{item.name}</h4>
          <span className="font-black text-sm shrink-0" style={{ color }}>${item.price}</span>
        </div>
        <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-1 leading-snug">{item.description}</p>
      </div>
    </div>
  );
};

export default PublicCatalog;
