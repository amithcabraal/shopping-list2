import React, { useState } from 'react';
import { WeeklyShopItem } from '../types';
import { Check, X, AlertCircle, Trash2, Plus, Minus, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import ImageModal from './modals/ImageModal';
import IframeModal from './modals/IframeModal';

interface ProductListProps {
  items: WeeklyShopItem[];
  viewMode: 'list' | 'shop';
  onItemRemoved?: (itemId: string) => void;
  onQuantityChanged?: (itemId: string, newQuantity: number) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ items, viewMode, onItemRemoved, onQuantityChanged }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const updateItemStatus = async (itemId: string, status: WeeklyShopItem['status']) => {
    const { error } = await supabase
      .from('weekly_shop_items')
      .update({ status })
      .eq('id', itemId);

    if (error) {
      toast.error('Failed to update item status');
      return;
    }
  };

  const updateQuantity = async (item: WeeklyShopItem, delta: number) => {
    const newQuantity = Math.max(1, item.quantity + delta);
    
    const { error } = await supabase
      .from('weekly_shop_items')
      .update({ quantity: newQuantity })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update quantity');
      return;
    }

    onQuantityChanged?.(item.id, newQuantity);
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase
      .from('weekly_shop_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast.error('Failed to remove item');
      return;
    }

    onItemRemoved?.(itemId);
    toast.success('Item removed from list');
  };

  const statusIcons = {
    required: null,
    bought: <Check className="w-5 h-5 text-green-500" />,
    unavailable: <X className="w-5 h-5 text-red-500" />
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-center justify-between"
        >
          <div className="flex-1 flex items-center gap-4">
            {viewMode === 'shop' && item.product?.image_url && (
              <button
                onClick={() => setSelectedImage(item.product.image_url)}
                className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
              >
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/48';
                  }}
                />
              </button>
            )}
            {viewMode === 'shop' && !item.product?.image_url && (
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-medium">{item.product?.name}</h3>
              {viewMode === 'shop' && item.product?.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {item.product.notes}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item, -1)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item, 1)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {viewMode === 'shop' && item.product?.product_url && (
              <button
                onClick={() => setSelectedUrl(item.product.product_url)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            )}
            {item.max_price && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">${item.max_price}</span>
              </div>
            )}
            {viewMode === 'shop' && (
              <div className="flex gap-1">
                {Object.entries(statusIcons).map(([status, icon]) => (
                  <button
                    key={status}
                    onClick={() => updateItemStatus(item.id, status as WeeklyShopItem['status'])}
                    className={`p-2 rounded-full ${
                      item.status === status
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}
            {viewMode === 'list' && (
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Remove item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ))}

      {selectedImage && (
        <ImageModal url={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      {selectedUrl && (
        <IframeModal url={selectedUrl} onClose={() => setSelectedUrl(null)} />
      )}
    </div>
  );
};