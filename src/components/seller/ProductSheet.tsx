import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Box, Tag, Truck, IndianRupee, Image as ImageIcon } from 'lucide-react';

interface ProductSheetProps {
  isOpen: boolean;
  onClose: () => void;
  productForm: any;
  setProductForm: (form: any) => void;
  productImages: File[];
  setProductImages: React.Dispatch<React.SetStateAction<File[]>>;
  existingImages: string[];
  setExistingImages: React.Dispatch<React.SetStateAction<string[]>>;
  isUploading: boolean;
  submitProduct: (isPublished: boolean) => void;
  categories: {id: string, label: string}[];
  units: string[];
  isEditing: boolean;
}

export function ProductSheet({ 
  isOpen, onClose, productForm, setProductForm, 
  productImages, setProductImages, existingImages, setExistingImages,
  isUploading, submitProduct, categories, units, isEditing
}: ProductSheetProps) {

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setProductImages(prev => [...prev, ...files]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col bg-[#fcf9f6]">
        <div className="p-6 border-b border-[#e5e2df] bg-white sticky top-0 z-10 flex justify-between items-center">
          <div>
            <SheetTitle className="font-headline text-2xl">{isEditing ? 'Edit Product' : 'Add New Product'}</SheetTitle>
            <p className="text-sm text-[#74777d]">Fill in the details to list your product.</p>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-10">
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#735c00] flex items-center gap-2 border-b border-[#e5e2df] pb-2">
              <Box className="w-4 h-4" /> Basic Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#1c1c1a]">Product Name *</label>
                <Input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="E.g. Marine Grade Plywood" className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1c1c1a]">Brand *</label>
                <Input value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} placeholder="E.g. CenturyPly" className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1c1c1a]">Category *</label>
                <Select value={productForm.category} onValueChange={v => setProductForm({...productForm, category: v})}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1c1c1a]">Sub Category</label>
                <Input value={productForm.sub_category} onChange={e => setProductForm({...productForm, sub_category: e.target.value})} placeholder="Optional" className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1c1c1a]">Selling Unit *</label>
                <Select value={productForm.unit} onValueChange={v => setProductForm({...productForm, unit: v})}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#735c00] flex items-center gap-2 border-b border-[#e5e2df] pb-2">
              <IndianRupee className="w-4 h-4" /> Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1c1c1a]">Selling Price (₹) *</label>
                <Input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="0" className="bg-white font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1c1c1a]">MRP (₹)</label>
                <Input type="number" value={productForm.original_price} onChange={e => setProductForm({...productForm, original_price: e.target.value})} placeholder="0" className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1c1c1a]">Discount (%)</label>
                <Input readOnly value={productForm.discount} className="bg-gray-50 text-green-700 font-bold" />
              </div>
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-semibold text-[#1c1c1a]">Bulk Price (₹)</label>
                <Input type="number" value={productForm.bulk_price} onChange={e => setProductForm({...productForm, bulk_price: e.target.value})} placeholder="0" className="bg-white" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#1c1c1a]">Bulk Min Qty</label>
                <Input type="number" value={productForm.bulk_min_qty} onChange={e => setProductForm({...productForm, bulk_min_qty: e.target.value})} placeholder="e.g. 50" className="bg-white" />
              </div>
            </div>
          </section>

          {/* Inventory & Delivery */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#735c00] flex items-center gap-2 border-b border-[#e5e2df] pb-2">
              <Truck className="w-4 h-4" /> Inventory & Delivery
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1c1c1a]">Stock Quantity *</label>
                <Input type="number" value={productForm.stock_qty} onChange={e => setProductForm({...productForm, stock_qty: e.target.value})} placeholder="0" className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1c1c1a]">Min Order Qty</label>
                <Input type="number" value={productForm.min_order_qty} onChange={e => setProductForm({...productForm, min_order_qty: e.target.value})} placeholder="1" className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1c1c1a]">Delivery Days</label>
                <Input type="number" value={productForm.delivery_days} onChange={e => setProductForm({...productForm, delivery_days: e.target.value})} placeholder="5" className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1c1c1a]">Delivery Info</label>
                <Input value={productForm.delivery_info} onChange={e => setProductForm({...productForm, delivery_info: e.target.value})} placeholder="e.g. Free Delivery" className="bg-white" />
              </div>
            </div>
          </section>

          {/* Description & Tags */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#735c00] flex items-center gap-2 border-b border-[#e5e2df] pb-2">
              <Tag className="w-4 h-4" /> Description & Tags
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1c1c1a]">Description</label>
                <Textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} placeholder="Product details..." className="bg-white resize-none" rows={4} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1c1c1a]">Tags (Comma Separated)</label>
                <Input value={productForm.tags} onChange={e => setProductForm({...productForm, tags: e.target.value})} placeholder="wood, waterproof, premium" className="bg-white" />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#735c00] flex items-center gap-2 border-b border-[#e5e2df] pb-2">
              <ImageIcon className="w-4 h-4" /> Images
            </h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#e5e2df] rounded-lg p-8 text-center bg-white hover:border-[#735c00] hover:bg-[#fffdfa] transition-colors relative cursor-pointer group">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <Upload className="w-8 h-8 mx-auto text-[#74777d] group-hover:text-[#735c00] mb-2" />
                <p className="text-sm font-medium text-[#1c1c1a]">Click or drag images to upload</p>
                <p className="text-xs text-[#74777d]">Max 5MB per image</p>
              </div>

              {(existingImages.length > 0 || productImages.length > 0) && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">
                  {existingImages.map((img, idx) => (
                    <div key={`exist-${idx}`} className="relative aspect-square rounded-md overflow-hidden border border-[#e5e2df] group">
                      <img src={img} alt="Product" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  ))}
                  {productImages.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-square rounded-md overflow-hidden border-2 border-dashed border-[#735c00] group">
                      <img src={URL.createObjectURL(file)} alt="New upload" className="w-full h-full object-cover opacity-70" />
                      <span className="absolute bottom-0 inset-x-0 bg-[#735c00] text-white text-[10px] text-center font-bold py-0.5">NEW</span>
                      <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <X className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-[#e5e2df] bg-white sticky bottom-0 z-10 flex flex-col sm:flex-row gap-3 justify-end">
          <Button variant="outline" onClick={() => submitProduct(false)} disabled={isUploading} className="w-full sm:w-auto">
            Save as Draft
          </Button>
          <Button onClick={() => submitProduct(true)} disabled={isUploading || !productForm.name || !productForm.price} className="w-full sm:w-auto bg-[#1c1c1a] hover:bg-[#735c00] text-white">
            {isUploading ? 'Saving...' : isEditing ? 'Update & Publish' : 'Publish Now'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
