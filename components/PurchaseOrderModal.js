'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ShoppingCart, Plus, Trash2, Calculator } from 'lucide-react'

export default function PurchaseOrderModal({ open, onClose, data, companies, onSuccess }) {
  const [formData, setFormData] = useState({
    companyId: '',
    quoteId: null,
    poNumber: '',
    quoteNumber: '',
    billTo: '',
    billToAddress: '',
    billToContact: '',
    items: [],
    subtotal: 0,
    vatRate: 5,
    vatAmount: 0,
    totalAmount: 0,
    notes: '',
    status: 'pending'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (data) {
      const items = typeof data.items === 'string' ? JSON.parse(data.items || '[]') : data.items || []
      setFormData({
        ...data,
        items
      })
    } else {
      setFormData({
        companyId: '',
        quoteId: null,
        poNumber: `PO-${Date.now()}`,
        quoteNumber: '',
        billTo: '',
        billToAddress: '',
        billToContact: '',
        items: [{ description: '', quantity: 1, price: 0, total: 0 }],
        subtotal: 0,
        vatRate: 5,
        vatAmount: 0,
        totalAmount: 0,
        notes: '',
        status: 'pending'
      })
    }
  }, [data, open])

  const calculateTotals = (items, vatRate) => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0)
    const vatAmount = (subtotal * vatRate) / 100
    const totalAmount = subtotal + vatAmount
    return { subtotal, vatAmount, totalAmount }
  }

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    
    // Calculate item total
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].price || 0)
    }
    
    const totals = calculateTotals(newItems, formData.vatRate)
    setFormData({
      ...formData,
      items: newItems,
      ...totals
    })
  }

  const addItem = () => {
    const newItems = [...formData.items, { description: '', quantity: 1, price: 0, total: 0 }]
    setFormData({ ...formData, items: newItems })
  }

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    const totals = calculateTotals(newItems, formData.vatRate)
    setFormData({
      ...formData,
      items: newItems,
      ...totals
    })
  }

  const handleVatRateChange = (vatRate) => {
    const totals = calculateTotals(formData.items, vatRate)
    setFormData({
      ...formData,
      vatRate,
      ...totals
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = data ? `/api/purchase-orders/${data.id}` : '/api/purchase-orders'
      const method = data ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error saving purchase order:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>{data ? 'Edit Purchase Order' : 'Create New Purchase Order'}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Select 
                    value={formData.companyId} 
                    onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="poNumber">PO Number *</Label>
                  <Input
                    id="poNumber"
                    value={formData.poNumber}
                    onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                    placeholder="PO-12345"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quoteNumber">Quote Reference</Label>
                  <Input
                    id="quoteNumber"
                    value={formData.quoteNumber}
                    onChange={(e) => setFormData({ ...formData, quoteNumber: e.target.value })}
                    placeholder="Q-12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill To Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bill To</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billTo">Customer Name</Label>
                <Input
                  id="billTo"
                  value={formData.billTo}
                  onChange={(e) => setFormData({ ...formData, billTo: e.target.value })}
                  placeholder="Customer or company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billToAddress">Address</Label>
                <Textarea
                  id="billToAddress"
                  value={formData.billToAddress}
                  onChange={(e) => setFormData({ ...formData, billToAddress: e.target.value })}
                  placeholder="Customer address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billToContact">Contact Number</Label>
                <Input
                  id="billToContact"
                  value={formData.billToContact}
                  onChange={(e) => setFormData({ ...formData, billToContact: e.target.value })}
                  placeholder="Phone number or email"
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Items</CardTitle>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-5 space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="1"
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <Label>Total</Label>
                    <Input
                      value={formatCurrency(item.total || 0)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Totals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Subtotal</Label>
                  <Input
                    value={formatCurrency(formData.subtotal)}
                    readOnly
                    className="bg-muted text-right font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatRate">VAT Rate (%)</Label>
                  <Input
                    id="vatRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.vatRate}
                    onChange={(e) => handleVatRateChange(parseFloat(e.target.value) || 0)}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label>VAT Amount</Label>
                  <Input
                    value={formatCurrency(formData.vatAmount)}
                    readOnly
                    className="bg-muted text-right font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">Total Amount</Label>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(formData.totalAmount)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes & Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes or remarks..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.companyId || !formData.poNumber.trim()}
              className="min-w-[140px]"
            >
              {loading ? 'Saving...' : data ? 'Update Purchase Order' : 'Create Purchase Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}