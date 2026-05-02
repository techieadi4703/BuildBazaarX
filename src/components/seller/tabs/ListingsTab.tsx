import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, Plus, Pencil, Trash, Eye, EyeOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface ListingsTabProps {
  products: any[];
  isLoading: boolean;
  setIsAddProductOpen: (open: boolean) => void;
  handleEditProduct: (product: any) => void;
  deleteProduct: (id: string) => void;
  togglePublish: (id: string, currentStatus: boolean) => void;
  categories: {id: string, label: string}[];
}

export function ListingsTab({ products, isLoading, setIsAddProductOpen, handleEditProduct, deleteProduct, togglePublish, categories }: ListingsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProducts = products.filter(p => {
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (statusFilter === 'live' && (!p.is_published || p.stock_qty <= 0)) return false;
    if (statusFilter === 'draft' && p.is_published) return false;
    if (statusFilter === 'out_of_stock' && (p.stock_qty > 0 || !p.is_published)) return false;
    return true;
  });

  const getStatusBadge = (product: any) => {
    if (product.is_published && product.stock_qty <= 0) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Out of Stock</Badge>;
    }
    if (product.is_published) {
      return <Badge className="bg-[#735c00] text-white hover:bg-[#735c00] border-none">Live</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-none">Draft</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#74777d]" />
            <Input
              placeholder="Search products..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button 
          onClick={() => setIsAddProductOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1c1c1a] text-white text-sm font-medium rounded-md hover:bg-[#735c00] transition-colors w-full md:w-auto whitespace-nowrap shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      <div className="bg-white border border-[#e5e2df] rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#fcf9f6]">
              <TableRow>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-[#74777d]">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-8 h-8 mb-2 opacity-20" />
                      <p>No products found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.images && p.images.length > 0 ? (
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-md object-cover border border-[#e5e2df]" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-[#fcf9f6] flex items-center justify-center border border-[#e5e2df]">
                          <Package className="w-5 h-5 text-[#74777d] opacity-50" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-[#1c1c1a]">
                      <div className="line-clamp-1">{p.name}</div>
                      <div className="text-xs text-[#74777d] font-normal">{p.brand}</div>
                    </TableCell>
                    <TableCell className="capitalize">{categories.find(c => c.id === p.category)?.label || p.category}</TableCell>
                    <TableCell className="font-semibold">₹{p.price?.toLocaleString()}</TableCell>
                    <TableCell>{p.stock_qty} {p.unit}</TableCell>
                    <TableCell>{getStatusBadge(p)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => togglePublish(p.id, p.is_published)}
                                className="p-2 text-[#74777d] hover:text-[#1c1c1a] hover:bg-[#fcf9f6] rounded-md transition-colors"
                              >
                                {p.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{p.is_published ? 'Unpublish' : 'Publish'}</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleEditProduct(p)}
                                className="p-2 text-[#74777d] hover:text-[#735c00] hover:bg-[#fcf9f6] rounded-md transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Product</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => deleteProduct(p.id)}
                                className="p-2 text-[#74777d] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
