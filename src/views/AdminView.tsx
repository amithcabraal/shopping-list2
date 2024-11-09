import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, StoreLocation } from '../types';
import { Plus, Edit2, Trash2, GripVertical, Link2, Image } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminView = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingLocation, setEditingLocation] = useState<StoreLocation | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [aliases, setAliases] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setAliases(editingProduct.aliases?.join(', ') || '');
    } else {
      setAliases('');
    }
  }, [editingProduct]);

  const fetchData = async () => {
    const [productsRes, locationsRes] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('store_locations').select('*').order('sequence_number')
    ]);

    if (productsRes.error) toast.error('Error fetching products');
    if (locationsRes.error) toast.error('Error fetching locations');

    setProducts(productsRes.data || []);
    setLocations(locationsRes.data || []);
    setLoading(false);
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const aliasesArray = aliases
      .split(',')
      .map(alias => alias.trim())
      .filter(alias => alias.length > 0);

    const productData = {
      name: formData.get('name') as string,
      store_location_id: formData.get('location') as string,
      shelf_height: formData.get('shelf_height') as 'top' | 'middle' | 'bottom',
      typical_price: formData.get('typical_price') ? 
        parseFloat(formData.get('typical_price') as string) : null,
      notes: formData.get('notes') as string,
      sequence_number: parseInt(formData.get('sequence_number') as string) || 0,
      product_url: formData.get('product_url') as string || null,
      image_url: formData.get('image_url') as string || null,
      barcode: formData.get('barcode') as string || null,
      default_quantity: parseInt(formData.get('default_quantity') as string) || 1,
      aliases: aliasesArray
    };

    try {
      const { error } = editingProduct ?
        await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id) :
        await supabase
          .from('products')
          .insert(productData);

      if (error) throw error;

      toast.success(`Product ${editingProduct ? 'updated' : 'added'}`);
      setEditingProduct(null);
      setAliases('');
      form.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error saving product');
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const locationData = {
      name: formData.get('name') as string,
      sequence_number: parseInt(formData.get('sequence_number') as string) || locations.length + 1
    };

    try {
      const { error } = editingLocation ?
        await supabase
          .from('store_locations')
          .update(locationData)
          .eq('id', editingLocation.id) :
        await supabase
          .from('store_locations')
          .insert(locationData);

      if (error) throw error;

      toast.success(`Location ${editingLocation ? 'updated' : 'added'}`);
      setEditingLocation(null);
      setShowLocationForm(false);
      form.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error saving location');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Products Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h2>
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                name="name"
                defaultValue={editingProduct?.name}
                required
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Aliases</label>
              <input
                type="text"
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                placeholder="Enter aliases separated by commas"
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Location</label>
              <select
                name="location"
                defaultValue={editingProduct?.store_location_id}
                required
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              >
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Shelf Height</label>
              <select
                name="shelf_height"
                defaultValue={editingProduct?.shelf_height}
                required
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              >
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Typical Price</label>
              <input
                type="number"
                name="typical_price"
                step="0.01"
                defaultValue={editingProduct?.typical_price}
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Default Quantity</label>
              <input
                type="number"
                name="default_quantity"
                min="1"
                defaultValue={editingProduct?.default_quantity || 1}
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Sequence Number</label>
              <input
                type="number"
                name="sequence_number"
                defaultValue={editingProduct?.sequence_number}
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Barcode</label>
              <input
                type="text"
                name="barcode"
                defaultValue={editingProduct?.barcode}
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Product URL</label>
              <input
                type="url"
                name="product_url"
                defaultValue={editingProduct?.product_url}
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Image URL</label>
              <input
                type="url"
                name="image_url"
                defaultValue={editingProduct?.image_url}
                className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
              name="notes"
              defaultValue={editingProduct?.notes}
              className="w-full rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            {editingProduct && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setAliases('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Products List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Products</h2>
        <div className="space-y-2">
          {products.map(product => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-4">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {product.name}
                    {product.aliases && product.aliases.length > 0 && (
                      <span className="text-sm text-gray-500 ml-2">
                        (aka: {product.aliases.join(', ')})
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{locations.find(l => l.id === product.store_location_id)?.name}</span>
                    {product.sequence_number > 0 && (
                      <span>Sequence: {product.sequence_number}</span>
                    )}
                    {product.default_quantity > 1 && (
                      <span>Default Qty: {product.default_quantity}</span>
                    )}
                    {product.barcode && (
                      <span>Barcode: {product.barcode}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {product.product_url && (
                  <a
                    href={product.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <Link2 className="w-5 h-5" />
                  </a>
                )}
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setAliases(product.aliases?.join(', ') || '');
                  }}
                  className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this product?')) {
                      const { error } = await supabase
                        .from('products')
                        .delete()
                        .eq('id', product.id);
                      
                      if (error) {
                        toast.error('Error deleting product');
                        return;
                      }
                      
                      toast.success('Product deleted');
                      fetchData();
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminView;