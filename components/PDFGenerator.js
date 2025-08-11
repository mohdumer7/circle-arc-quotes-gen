'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Download, Printer } from 'lucide-react'

export default function PDFGenerator({ open, onClose, data, type }) {
  const contentRef = useRef(null)

  useEffect(() => {
    if (open && data) {
      // Dynamically import PDF libraries only when needed
      const loadPDFLibraries = async () => {
        try {
          const [jsPDF, html2canvas] = await Promise.all([
            import('jspdf').then(mod => mod.default),
            import('html2canvas').then(mod => mod.default)
          ])
          
          // Store in window for later use
          window.jsPDF = jsPDF
          window.html2canvas = html2canvas
        } catch (error) {
          console.error('Failed to load PDF libraries:', error)
        }
      }
      
      loadPDFLibraries()
    }
  }, [open, data])

  const generatePDF = async () => {
    if (!window.jsPDF || !window.html2canvas || !contentRef.current) {
      console.error('PDF libraries not loaded')
      return
    }

    try {
      const canvas = await window.html2canvas(contentRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: contentRef.current.scrollWidth,
        height: contentRef.current.scrollHeight
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new window.jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Try to fit on single page first
      if (imgHeight <= 295) { // A4 height - margins
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      } else {
        // If content is too long, scale it down to fit on one page
        const scaledHeight = 290 // Leave some margin
        pdf.addImage(imgData, 'PNG', 0, 5, imgWidth, scaledHeight)
      }

      const filename = type === 'quote' 
        ? `Quote_${data.quoteNumber}_${new Date().toISOString().split('T')[0]}.pdf`
        : `PurchaseOrder_${data.poNumber}_${new Date().toISOString().split('T')[0]}.pdf`

      pdf.save(filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!data) return null

  const items = typeof data.items === 'string' ? JSON.parse(data.items || '[]') : data.items || []
  const company = data.companies || {}

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {type === 'quote' ? 'Quote Preview' : 'Purchase Order Preview'}
            </span>
            <div className="flex space-x-2">
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={generatePDF} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={contentRef} className="bg-white p-8 text-black">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-start space-x-4">
              {company.logo && (
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`}
                  className="w-20 h-20 object-contain"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name || 'Company Name'}</h1>
                {company.address && (
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{company.address}</p>
                )}
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  {company.phone && <p>Phone: {company.phone}</p>}
                  {company.email && <p>Email: {company.email}</p>}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {type === 'quote' ? 'QUOTE' : 'PURCHASE ORDER'}
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">{type === 'quote' ? 'Quote #:' : 'PO #:'}</span> {type === 'quote' ? data.quoteNumber : data.poNumber}</p>
                {data.quoteNumber && type === 'purchase-order' && (
                  <p><span className="font-medium">Quote #:</span> {data.quoteNumber}</p>
                )}
                {data.poNumber && type === 'quote' && (
                  <p><span className="font-medium">PO #:</span> {data.poNumber}</p>
                )}
                <p><span className="font-medium">Date:</span> {formatDate(data.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-medium text-gray-900">{data.billTo || 'Customer Name'}</p>
              {data.billToAddress && (
                <p className="text-gray-600 mt-1 whitespace-pre-line">{data.billToAddress}</p>
              )}
              {data.billToContact && (
                <p className="text-gray-600 mt-2">Contact: {data.billToContact}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-20">Qty</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900 w-24">Price</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900 w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-3 text-gray-900">
                      {item.description}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right text-gray-900">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="bg-gray-50 p-4 rounded">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(data.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">VAT ({data.vatRate}%):</span>
                    <span className="font-medium text-gray-900">{formatCurrency(data.vatAmount)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(data.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes & Remarks:</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-700 whitespace-pre-line">{data.notes}</p>
              </div>
            </div>
          )}

          {/* Footer with Signature and Seal */}
          <div className="flex justify-between items-end mt-12">
            <div className="text-center">
              {company.signature && (
                <div className="mb-2">
                  <img 
                    src={company.signature} 
                    alt="Signature" 
                    className="w-32 h-16 object-contain mx-auto"
                  />
                </div>
              )}
              <div className="border-t border-gray-400 pt-2 w-48">
                <p className="text-sm text-gray-600">Authorized Signature</p>
              </div>
            </div>
            
            {company.seal && (
              <div className="text-center">
                <img 
                  src={company.seal} 
                  alt="Company Seal" 
                  className="w-20 h-20 object-contain mx-auto mb-2"
                />
                <p className="text-sm text-gray-600">Company Seal</p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="text-center mt-8 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-500">
              This {type === 'quote' ? 'quote' : 'purchase order'} is valid for 30 days from the date of issue.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Generated on {formatDate(new Date().toISOString())}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}