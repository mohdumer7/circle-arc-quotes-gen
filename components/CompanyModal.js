'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Building2, Upload } from 'lucide-react'

export default function CompanyModal({ open, onClose, data, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    signature: '',
    seal: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (data) {
      setFormData(data)
    } else {
      setFormData({
        name: '',
        logo: '',
        address: '',
        phone: '',
        email: '',
        signature: '',
        seal: ''
      })
    }
  }, [data])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = data ? `/api/companies/${data.id}` : '/api/companies'
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
      console.error('Error saving company:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (field) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFormData({ ...formData, [field]: e.target.result })
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>{data ? 'Edit Company' : 'Add New Company'}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo">Company Logo</Label>
              <div className="flex items-center space-x-4">
                {formData.logo && (
                  <img 
                    src={formData.logo} 
                    alt="Company logo preview" 
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFileUpload('logo')}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>{formData.logo ? 'Change Logo' : 'Upload Logo'}</span>
                </Button>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter company address"
                rows={3}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Signature Upload */}
            <div className="space-y-2">
              <Label htmlFor="signature">Digital Signature</Label>
              <div className="flex items-center space-x-4">
                {formData.signature && (
                  <img 
                    src={formData.signature} 
                    alt="Signature preview" 
                    className="w-24 h-12 object-contain rounded-lg border bg-white"
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFileUpload('signature')}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>{formData.signature ? 'Change Signature' : 'Upload Signature'}</span>
                </Button>
              </div>
            </div>

            {/* Seal Upload */}
            <div className="space-y-2">
              <Label htmlFor="seal">Company Seal</Label>
              <div className="flex items-center space-x-4">
                {formData.seal && (
                  <img 
                    src={formData.seal} 
                    alt="Seal preview" 
                    className="w-16 h-16 object-contain rounded-lg border bg-white"
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFileUpload('seal')}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>{formData.seal ? 'Change Seal' : 'Upload Seal'}</span>
                </Button>
              </div>
            </div>
          </div>

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
              disabled={loading || !formData.name.trim()}
              className="min-w-[100px]"
            >
              {loading ? 'Saving...' : data ? 'Update Company' : 'Add Company'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}