import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiFilter, FiX, FiGrid, FiList, FiChevronDown } from 'react-icons/fi';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const COLORS = ['Black', 'White', 'Navy', 'Red', 'Green', 'Beige', 'Brown', 'Gray'];
const SORTS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Top Rated' },
  { value: '-soldCount', label: 'Best Selling' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const page = Number(searchParams.get('page') || 1);
  const category = searchParams.get('category') || '';
  const gender = searchParams.get('gender') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const selectedSizes = searchParams.get('sizes') || '';
  const selectedColors = searchParams.get('colors') || '';
  const isFeatured = searchParams.get('isFeatured') || '';
  const isNewArrival = searchParams.get('filter') === 'new' ? 'true' : '';
  const isBestSeller = searchParams.get('filter') === 'best' ? 'true' : '';

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, category, gender, sort, search, minPrice, maxPrice, selectedSizes, selectedColors, isFeatured, isNewArrival, isBestSeller],
    queryFn: () => {
      const params = new URLSearchParams({
        page, limit: 12, sort,
        ...(category && { category }),
        ...(gender && { gender }),
        ...(search && { search }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(selectedSizes && { sizes: selectedSizes }),
        ...(selectedColors && { colors: selectedColors }),
        ...(isFeatured && { isFeatured }),
        ...(isNewArrival && { isNewArrival }),
        ...(isBestSeller && { isBestSeller }),
      });
      return api.get(`/products?${params}`).then((r) => r.data);
    },
    keepPreviousData: true,
  });

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const toggleArray = (current, value) => {
    const arr = current ? current.split(',') : [];
    const idx = arr.indexOf(value);
    if (idx > -1) arr.splice(idx, 1);
    else arr.push(value);
    return arr.join(',');
  };

  const clearFilters = () => setSearchParams({});

  const getActiveFilterCount = () => {
    let count = 0;
    if (category) count++;
    if (gender) count++;
    if (minPrice || maxPrice) count++;
    if (selectedSizes) count++;
    if (selectedColors) count++;
    return count;
  };

  const Sidebar = () => (
    <aside className="filter-sidebar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Filters
        </h3>
        {getActiveFilterCount() > 0 && (
          <button onClick={clearFilters} style={{ fontSize: '0.8rem', color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear All ({getActiveFilterCount()})
          </button>
        )}
      </div>

      {/* Gender */}
      <div className="filter-group">
        <p className="filter-group-title">Gender</p>
        {['women', 'men', 'unisex', 'kids'].map((g) => (
          <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', cursor: 'pointer' }}>
            <input
              type="radio"
              name="gender"
              value={g}
              checked={gender === g}
              onChange={() => updateParam('gender', gender === g ? '' : g)}
              style={{ accentColor: 'var(--color-dark)' }}
            />
            <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{g}</span>
          </label>
        ))}
      </div>

      {/* Price */}
      <div className="filter-group">
        <p className="filter-group-title">Price Range</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="form-input"
            style={{ padding: '10px 12px', fontSize: '0.875rem' }}
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="form-input"
            style={{ padding: '10px 12px', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="filter-group">
        <p className="filter-group-title">Size</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SIZES.map((size) => {
            const isSelected = selectedSizes.split(',').includes(size);
            return (
              <button
                key={size}
                onClick={() => updateParam('sizes', toggleArray(selectedSizes, size))}
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${isSelected ? 'var(--color-dark)' : 'var(--color-gray-200)'}`,
                  borderRadius: '4px',
                  background: isSelected ? 'var(--color-dark)' : 'transparent',
                  color: isSelected ? 'var(--color-white)' : 'var(--color-dark)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="filter-group">
        <p className="filter-group-title">Color</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {COLORS.map((color) => {
            const isSelected = selectedColors.split(',').includes(color);
            return (
              <label key={color} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => updateParam('colors', toggleArray(selectedColors, color))}
                  style={{ accentColor: 'var(--color-dark)' }}
                />
                <span style={{ fontSize: '0.875rem' }}>{color}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Special */}
      <div className="filter-group">
        <p className="filter-group-title">Special</p>
        {[
          { label: 'New Arrivals', param: 'filter', value: 'new' },
          { label: 'Best Sellers', param: 'filter', value: 'best' },
          { label: 'Featured', param: 'isFeatured', value: 'true' },
        ].map(({ label, param, value }) => (
          <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={searchParams.get(param) === value}
              onChange={() => updateParam(param, searchParams.get(param) === value ? '' : value)}
              style={{ accentColor: 'var(--color-dark)' }}
            />
            <span style={{ fontSize: '0.875rem' }}>{label}</span>
          </label>
        ))}
      </div>
    </aside>
  );

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, marginBottom: '8px' }}>
          {gender ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s Collection` : search ? `Results for "${search}"` : 'All Products'}
        </h1>
        {data && (
          <p style={{ color: 'var(--color-gray-400)', fontSize: '0.9rem' }}>
            {data.pagination.total} products found
          </p>
        )}
      </div>

      {/* Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--color-gray-100)',
        }}
      >
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiFilter /> Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`btn-icon ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'} btn`}
              onClick={() => setViewMode('grid')}
              style={{ padding: '8px' }}
            >
              <FiGrid />
            </button>
            <button
              className={`btn-icon ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'} btn`}
              onClick={() => setViewMode('list')}
              style={{ padding: '8px' }}
            >
              <FiList />
            </button>
          </div>

          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="form-input form-select"
            style={{ padding: '10px 40px 10px 14px', fontSize: '0.875rem', width: 'auto' }}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        {sidebarOpen && <Sidebar />}

        {/* Products */}
        <div style={{ flex: 1 }}>
          {isLoading ? (
            <div className="products-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: '16px', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '20px', width: '40%' }} />
                </div>
              ))}
            </div>
          ) : data?.products?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, marginBottom: '8px' }}>
                No products found
              </h3>
              <p style={{ color: 'var(--color-gray-400)' }}>Try adjusting your filters</p>
              <button className="btn btn-outline" onClick={clearFilters} style={{ marginTop: '20px' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'products-grid' : ''} style={viewMode === 'list' ? { display: 'flex', flexDirection: 'column', gap: '16px' } : {}}>
              {data?.products?.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px' }}>
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => updateParam('page', String(pg))}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: `1px solid ${page === pg ? 'var(--color-dark)' : 'var(--color-gray-200)'}`,
                    borderRadius: '6px',
                    background: page === pg ? 'var(--color-dark)' : 'transparent',
                    color: page === pg ? 'var(--color-white)' : 'var(--color-dark)',
                    cursor: 'pointer',
                    fontWeight: page === pg ? 600 : 400,
                    transition: 'all 0.2s',
                  }}
                >
                  {pg}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
