import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiUpload, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const defaultVariant = { size: 'M', color: 'Black', colorHex: '#000000', stock: 10, sku: '' };

const InputGroup = ({ label, children, required }) => (
  <div className="form-group">
    <label className="form-label">{label}{required && ' *'}</label>
    {children}
  </div>
);

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '',
    price: '', discountPrice: '',
    category: '', brand: 'LUXE', gender: 'unisex',
    material: '', careInstructions: '',
    isFeatured: false, isNewArrival: false, isBestSeller: false, isActive: true,
    tags: [],
    variants: [{ ...defaultVariant }],
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { isLoading: isFetching } = useQuery({
    queryKey: ['product-edit', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data),
    enabled: isEditing,
    onSuccess: (data) => {
      const p = data.product;
      setForm({
        name: p.name, description: p.description, shortDescription: p.shortDescription || '',
        price: p.price, discountPrice: p.discountPrice || '',
        category: p.category?._id || '', brand: p.brand, gender: p.gender,
        material: p.material || '', careInstructions: p.careInstructions || '',
        isFeatured: p.isFeatured, isNewArrival: p.isNewArrival, isBestSeller: p.isBestSeller, isActive: p.isActive,
        tags: p.tags || [],
        variants: p.variants?.length > 0 ? p.variants : [{ ...defaultVariant }],
      });
      setExistingImages(p.images || []);
    },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (publicId) => {
    try {
      await api.delete(`/products/${id}/images/${publicId}`);
      setExistingImages((prev) => prev.filter((img) => img.public_id !== publicId));
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    }
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, { ...defaultVariant }] }));
  const removeVariant = (i) => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));
  const updateVariant = (i, field, value) => {
    setForm((f) => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], [field]: value };
      return { ...f, variants };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'tags' || key === 'variants') {
        formData.append(key, JSON.stringify(val));
      } else {
        formData.append(key, val);
      }
    });
    images.forEach((img) => formData.append('images', img));

    try {
      if (isEditing) {
        await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
        <button className="btn btn-ghost" onClick={() => navigate('/admin/products')}>← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'flex-start' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Basic Info */}
            <section style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '20px' }}>Basic Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <InputGroup label="Product Name" required>
                  <input className="form-input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Premium Slim Fit Shirt" />
                </InputGroup>
                <InputGroup label="Short Description">
                  <input className="form-input" value={form.shortDescription} onChange={(e) => setForm(f => ({ ...f, shortDescription: e.target.value }))} placeholder="Brief one-liner" />
                </InputGroup>
                <InputGroup label="Full Description" required>
                  <textarea className="form-input" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} required rows={5} placeholder="Detailed product description..." style={{ resize: 'vertical' }} />
                </InputGroup>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <InputGroup label="Material">
                    <input className="form-input" value={form.material} onChange={(e) => setForm(f => ({ ...f, material: e.target.value }))} placeholder="e.g. 100% Cotton" />
                  </InputGroup>
                  <InputGroup label="Care Instructions">
                    <input className="form-input" value={form.careInstructions} onChange={(e) => setForm(f => ({ ...f, careInstructions: e.target.value }))} placeholder="e.g. Machine wash cold" />
                  </InputGroup>
                </div>
              </div>
            </section>

            {/* Images */}
            <section style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '20px' }}>Product Images</h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--color-gray-200)',
                  borderRadius: '12px',
                  padding: '40px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  marginBottom: '16px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-dark)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-gray-200)'}
              >
                <FiUpload size={24} style={{ margin: '0 auto 8px', display: 'block', color: 'var(--color-gray-400)' }} />
                <p style={{ fontWeight: 500, marginBottom: '4px' }}>Click to upload images</p>
                <p style={{ color: 'var(--color-gray-400)', fontSize: '0.8125rem' }}>JPG, PNG, WebP · Max 10MB each · Up to 8 images</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
              </div>

              {/* Image Previews */}
              {(existingImages.length > 0 || imagePreviews.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '8px' }}>
                  {existingImages.map((img) => (
                    <div key={img.public_id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingImage(img.public_id)}
                          style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(181,48,58,0.9)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}
                        >
                          <FiX size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {imagePreviews.map((src, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(181,48,58,0.9)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Variants */}
            <section style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400 }}>Variants</h2>
                <button type="button" className="btn btn-outline btn-sm" onClick={addVariant} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiPlus size={14} /> Add Variant
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {form.variants.map((v, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end', padding: '16px', background: 'var(--color-off-white)', borderRadius: '10px' }}>
                    {[
                      { label: 'Size', name: 'size', type: 'text', placeholder: 'S, M, L, XL...' },
                      { label: 'Color', name: 'color', type: 'text', placeholder: 'Black, White...' },
                      { label: 'Stock', name: 'stock', type: 'number', placeholder: '0' },
                      { label: 'SKU', name: 'sku', type: 'text', placeholder: 'Optional' },
                    ].map(({ label, name, type, placeholder }) => (
                      <div key={name} className="form-group">
                        <label className="form-label">{label}</label>
                        <input
                          type={type}
                          className="form-input"
                          value={v[name]}
                          onChange={(e) => updateVariant(i, name, e.target.value)}
                          placeholder={placeholder}
                          style={{ padding: '10px 12px' }}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      disabled={form.variants.length === 1}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(181,48,58,0.2)', background: 'none', color: 'var(--color-error)', cursor: 'pointer', marginBottom: '2px' }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Tags */}
            <section style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '20px' }}>Tags</h2>
              <div className="form-group">
                <label className="form-label">Add Tags (press Enter)</label>
                <input
                  className="form-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="summer, casual, formal..."
                />
              </div>
              {form.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'var(--color-light-gray)', borderRadius: '20px', fontSize: '0.8125rem' }}
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, color: 'var(--color-gray-500)' }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '90px' }}>
            {/* Pricing */}
            <section style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '20px' }}>Pricing</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <InputGroup label="Regular Price (₹)" required>
                  <input type="number" className="form-input" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} required min="0" placeholder="0.00" />
                </InputGroup>
                <InputGroup label="Sale Price (₹)">
                  <input type="number" className="form-input" value={form.discountPrice} onChange={(e) => setForm(f => ({ ...f, discountPrice: e.target.value }))} min="0" placeholder="Leave blank for no discount" />
                </InputGroup>
                {form.price && form.discountPrice && form.discountPrice < form.price && (
                  <div style={{ padding: '10px 14px', background: 'rgba(45,106,79,0.08)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--color-success)' }}>
                    Discount: {Math.round(((form.price - form.discountPrice) / form.price) * 100)}% off
                  </div>
                )}
              </div>
            </section>

            {/* Organization */}
            <section style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '20px' }}>Organization</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <InputGroup label="Category" required>
                  <select className="form-input form-select" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} required>
                    <option value="">Select category</option>
                    {categoriesData?.categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </InputGroup>
                <InputGroup label="Gender">
                  <select className="form-input form-select" value={form.gender} onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}>
                    {['women', 'men', 'unisex', 'kids'].map((g) => (
                      <option key={g} value={g} style={{ textTransform: 'capitalize' }}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                    ))}
                  </select>
                </InputGroup>
                <InputGroup label="Brand">
                  <input className="form-input" value={form.brand} onChange={(e) => setForm(f => ({ ...f, brand: e.target.value }))} />
                </InputGroup>
              </div>
            </section>

            {/* Options */}
            <section style={{ background: 'var(--color-white)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, marginBottom: '20px' }}>Product Options</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'isActive', label: 'Active (visible on store)' },
                  { key: 'isFeatured', label: 'Featured product' },
                  { key: 'isNewArrival', label: 'New Arrival' },
                  { key: 'isBestSeller', label: 'Best Seller' },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setForm(f => ({ ...f, [key]: e.target.checked }))}
                      style={{ width: 18, height: 18, accentColor: 'var(--color-dark)', cursor: 'pointer' }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </section>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '0.9375rem' }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </span>
              ) : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
};

export default AdminProductForm;
