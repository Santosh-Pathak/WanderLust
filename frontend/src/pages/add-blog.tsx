import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import ModalComponent from '@/components/modal';
import CategoryPill from '@/components/category-pill';
import { categories } from '@/utils/category-colors';
import { useAuth } from '@/contexts/auth-context';

type FormData = {
  title: string;
  authorName: string;
  imageLink: string;
  categories: string[];
  tags: string;
  description: string;
  isFeaturedPost: boolean;
  status: 'draft' | 'published';
};

function AddBlog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [modal, setModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    authorName: user?.name || '',
    imageLink: '',
    categories: [],
    tags: '',
    description: '',
    isFeaturedPost: false,
    status: 'published',
  });

  useEffect(() => {
    if (user?.name && !formData.authorName) {
      setFormData((prev) => ({ ...prev, authorName: user.name }));
    }
  }, [user]);

  const isValidCategory = (category: string): boolean => {
    return formData.categories.length >= 3 && !formData.categories.includes(category);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryClick = (category: string) => {
    if (isValidCategory(category)) return;
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter((cat) => cat !== category),
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category],
      });
    }
  };

  const handleSelector = () => {
    setFormData({ ...formData, imageLink: selectedImage });
    setModal(false);
  };

  const validateFormData = () => {
    if (!formData.title || !formData.authorName || !formData.imageLink || !formData.description || formData.categories.length === 0) {
      toast.error('All fields must be filled out.');
      return false;
    }
    const imageLinkRegex = /\.(jpg|jpeg|png|webp)$/i;
    if (!imageLinkRegex.test(formData.imageLink)) {
      toast.error('Image URL must end with .jpg, .jpeg, .webp or .png');
      return false;
    }
    if (formData.categories.length > 3) {
      toast.error('Select up to three categories.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateFormData()) return;

    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    };

    try {
      const response = await api.post('/api/posts/', payload);
      if (response.status === 200 || response.status === 201) {
        toast.success('Blog post successfully created!');
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    }
  };

  return (
    <div className="flex-grow cursor-default bg-slate-50 px-6 py-8 dark:bg-dark">
      <div className="mb-6 flex items-center justify-center">
        <div className="flex w-full max-w-2xl items-center gap-4">
          <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-slate-200 dark:hover:bg-dark-card">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold">Create Blog</h2>
        </div>
      </div>

      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-5">
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-dark-card">
            <input
              type="checkbox"
              name="isFeaturedPost"
              className="h-5 w-5 rounded accent-purple-500"
              checked={formData.isFeaturedPost}
              onChange={() => setFormData({ ...formData, isFeaturedPost: !formData.isFeaturedPost })}
            />
            <span className="text-sm font-medium">Mark as featured post</span>
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium">Blog title *</label>
            <input
              type="text"
              name="title"
              placeholder="Travel Bucket List for this Year"
              autoComplete="off"
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-dark-card"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Blog content *</label>
            <textarea
              name="description"
              placeholder="Start writing here..."
              rows={8}
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-dark-card"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Author name *</label>
              <input
                type="text"
                name="authorName"
                placeholder="Your name"
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-dark-card"
                value={formData.authorName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                placeholder="adventure, tips, guides"
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-dark-card"
                value={formData.tags}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Blog cover image *</label>
            <div className="flex gap-2">
              <input
                type="url"
                name="imageLink"
                placeholder="https://example.com/image.jpg"
                autoComplete="off"
                className="flex-1 rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-dark-card"
                value={formData.imageLink}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setModal(true)}
                className="flex items-center gap-2 rounded-lg bg-slate-200 px-4 text-sm font-medium hover:bg-slate-300 dark:bg-dark-card dark:hover:bg-slate-700"
              >
                <ImageIcon className="h-4 w-4" /> Pick
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Categories (max 3) *</label>
            <div className="flex flex-wrap gap-2 rounded-lg bg-white p-3 dark:bg-dark-card">
              {categories.map((category) => (
                <span key={category} onClick={() => handleCategoryClick(category)}>
                  <CategoryPill
                    category={category}
                    selected={formData.categories.includes(category)}
                    disabled={isValidCategory(category)}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              name="status"
              value="published"
              onClick={() => setFormData((prev) => ({ ...prev, status: 'published' }))}
              className="flex-1 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
            >
              Publish
            </button>
            <button
              type="submit"
              name="status"
              value="draft"
              onClick={() => setFormData((prev) => ({ ...prev, status: 'draft' }))}
              className="flex-1 rounded-lg border border-slate-300 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Save as Draft
            </button>
          </div>
        </form>
        <ModalComponent
          selectedImage={selectedImage}
          handleImageSelect={setSelectedImage}
          handleSelector={handleSelector}
          setModal={setModal}
          modal={modal}
        />
      </div>
    </div>
  );
}

export default AddBlog;
