import { useEffect, useState } from 'react';
import { Layers, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Toast, PageHeader, LoadingSkeleton } from '../components/ui/index.js';

const Sites = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg) => setToast(msg);
  const hideToast = () => setToast('');

  // ── שליפת כל ה-Sections מכל ה-Sites ───────────────────────────────
  const fetchAllSections = async () => {
    try {
      const { data: sites } = await api.get('/api/v1/sites/');
      
      const allSections = [];
      for (const site of sites) {
        try {
          const { data: siteSections } = await api.get(`/api/v1/sites/${site.id}/sections`);
          const sectionsWithSite = siteSections.map(s => ({
            ...s,
            site_name: site.name,
            site_id: site.id
          }));
          allSections.push(...sectionsWithSite);
        } catch (e) {
          console.error(`Failed to fetch sections for site ${site.id}`);
        }
      }
      
      setSections(allSections);
    } catch (e) {
      console.error(e);
      showToast('❌ שגיאה בטעינת ה-sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllSections(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sections" subtitle="טוען..." canAdd={false} />
        <LoadingSkeleton type="page" count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast msg={toast} onClose={hideToast} />

      <PageHeader
        title="Sections"
        subtitle={`${sections.length} תאים זמינים`}
        onRefresh={fetchAllSections}
        canAdd={false}
      />

      {/* רשת ריבועים */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sections.map((section) => (
          <div
            key={section.id}
            onClick={() => navigate(`/section/${section.id}`)}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                <Layers size={24} className="text-indigo-600" />
              </div>
              <ArrowRight 
                size={20} 
                className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" 
              />
            </div>
            
            <h3 className="font-bold text-gray-900 mb-1">{section.name}</h3>
            <p className="text-sm text-gray-500 mb-3">{section.site_name}</p>
            
            <div className="flex items-center justify-between text-xs">
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {section.classification}
              </span>
              <span className="text-gray-400">
                {new Date(section.created_at).toLocaleDateString('he-IL')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Layers size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 mb-2">אין Sections עדיין</p>
          <p className="text-sm text-gray-400">
            צור Site חדש ואז הוסף Section
          </p>
        </div>
      )}
    </div>
  );
};

export default Sites;