
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getClassDetails, addMaterial, deleteMaterial } from '../../services/api';
import { ClassDetails, Material } from '../../types';
import Header from '../../components/common/Header';
import { Spinner } from '../../components/common/Spinner';
import { ArrowLeft, FileText, Youtube, Trash2, Upload, Link as LinkIcon, PlusCircle } from 'lucide-react';

const ManageClassContentPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuth();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [fileTitle, setFileTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!classId) return;
      const token = localStorage.getItem('authToken') || '';
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const details = await getClassDetails(classId, token);
        setClassDetails(details);
      } catch (err) {
        setError('Failed to load class details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [classId]);
  
  const handleAddYoutube = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!youtubeTitle.trim() || !youtubeUrl.trim() || !classId) return;
      const token = localStorage.getItem('authToken') || '';
      if (!token) return;
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('title', youtubeTitle);
        formData.append('type', 'youtube');
        formData.append('youtubeUrl', youtubeUrl);
        const newMaterial = await addMaterial(classId, formData, token);
        setClassDetails(prev => prev ? { ...prev, materials: [newMaterial, ...prev.materials] } : null);
        setYoutubeTitle('');
        setYoutubeUrl('');
      } catch (err) {
        alert('Failed to add YouTube link.');
      } finally {
        setIsSubmitting(false);
      }
  };
  
  const handleAddFile = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!fileTitle.trim() || !file || !classId) return;
      const token = localStorage.getItem('authToken') || '';
      if (!token) return;
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('title', fileTitle);
        formData.append('file', file);
        const newMaterial = await addMaterial(classId, formData, token);
        setClassDetails(prev => prev ? { ...prev, materials: [newMaterial, ...prev.materials] } : null);
        setFileTitle('');
        setFile(null);
      } catch (err) {
        alert('Failed to add file.');
      } finally {
        setIsSubmitting(false);
      }
  };

  const handleDeleteMaterial = async (materialId: string) => {
      const token = localStorage.getItem('authToken') || '';
      if (!classId || !token || !window.confirm('Are you sure you want to delete this material?')) return;
      try {
        await deleteMaterial(materialId, token);
        setClassDetails(prev => prev ? { ...prev, materials: prev.materials.filter(m => m.id !== materialId) } : null);
      } catch (err) {
        alert('Failed to delete material.');
      }
  };

  const MaterialItem: React.FC<{ material: Material }> = ({ material }) => {
    const Icon = material.type === 'youtube' ? Youtube : FileText;
    const iconColor = material.type === 'youtube' ? 'text-red-600' : material.type === 'pdf' ? 'text-red-500' : 'text-blue-500';

    return (
        <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3">
                <Icon size={20} className={iconColor} />
                <span className="font-medium text-slate-800">{material.title}</span>
            </div>
            <button onClick={() => handleDeleteMaterial(material.id)} className="text-slate-400 hover:text-red-500 p-1 rounded-full">
                <Trash2 size={18} />
            </button>
        </div>
    );
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-100">
      <Header title={`Manage: ${classDetails?.name}`} />
      <main className="container mx-auto p-8">
        <Link to="/teacher-dashboard" className="flex items-center gap-2 text-teal-600 font-semibold mb-6 hover:underline">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Add Content Forms */}
            <div className="md:col-span-1 space-y-6">
                {/* YouTube Form */}
                <form onSubmit={handleAddYoutube} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><LinkIcon size={20} /> Add YouTube Video</h3>
                    <div className="space-y-4">
                        <input type="text" placeholder="Video Title" value={youtubeTitle} onChange={e => setYoutubeTitle(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        <input type="url" placeholder="YouTube URL" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full mt-4 flex justify-center items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-teal-400">
                        {isSubmitting ? <Spinner size="sm" /> : <><PlusCircle size={18} /> Add Video</>}
                    </button>
                </form>

                {/* File Upload Form */}
                <form onSubmit={handleAddFile} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Upload size={20} /> Upload Document</h3>
                    <div className="space-y-4">
                        <input type="text" placeholder="Document Title (e.g., 'Chapter 1 Notes')" value={fileTitle} onChange={e => setFileTitle(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} required accept=".pdf,.docx" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full mt-4 flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400">
                         {isSubmitting ? <Spinner size="sm" /> : <><PlusCircle size={18} /> Add Document</>}
                    </button>
                </form>
            </div>

            {/* Current Materials List */}
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Current Materials ({classDetails?.materials.length || 0})</h2>
                {classDetails && classDetails.materials.length > 0 ? (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {classDetails.materials.map(mat => <MaterialItem key={mat.id} material={mat} />)}
                    </div>
                ) : (
                    <div className="text-center text-slate-500 py-10">
                        <p>No materials have been added yet.</p>
                        <p>Use the forms on the left to add content.</p>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default ManageClassContentPage;
