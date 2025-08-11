'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  FileText, 
  ShoppingCart, 
  Plus, 
  Eye,
  Edit,
  Trash2,
  Download,
  ArrowRight,
  DollarSign,
  Calendar,
  Phone,
  Mail
} from 'lucide-react'
import CompanyModal from '@/components/CompanyModal'
import QuoteModal from '@/components/QuoteModal'
import PurchaseOrderModal from '@/components/PurchaseOrderModal'
import PDFGenerator from '@/components/PDFGenerator'

export default function App() {
  const [companies, setCompanies] = useState([])
  const [quotes, setQuotes] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modals state
  const [companyModal, setCompanyModal] = useState({ open: false, data: null })
  const [quoteModal, setQuoteModal] = useState({ open: false, data: null })
  const [poModal, setPOModal] = useState({ open: false, data: null })
  const [pdfModal, setPdfModal] = useState({ open: false, data: null, type: null })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [companiesRes, quotesRes, poRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/quotes'),
        fetch('/api/purchase-orders')
      ])

      const [companiesData, quotesData, poData] = await Promise.all([
        companiesRes.json(),
        quotesRes.json(),
        poRes.json()
      ])

      setCompanies(companiesData)
      setQuotes(quotesData)
      setPurchaseOrders(poData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      await fetch(`/api/${type}/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const convertToPurchaseOrder = async (quote) => {
    try {
      const poData = {
        companyId: quote.companyId,
        quoteId: quote.id,
        poNumber: `PO-${Date.now()}`,
        quoteNumber: quote.quoteNumber,
        billTo: quote.billTo,
        billToAddress: quote.billToAddress,
        billToContact: quote.billToContact,
        items: JSON.parse(quote.items || '[]'),
        subtotal: quote.subtotal,
        vatRate: quote.vatRate,
        vatAmount: quote.vatAmount,
        totalAmount: quote.totalAmount,
        notes: quote.notes
      }

      await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poData)
      })
      
      fetchData()
    } catch (error) {
      console.error('Error converting to PO:', error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your business data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Quote Generator</h1>
                <p className="text-sm text-muted-foreground">Manage quotes, companies, and purchase orders</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {companies.length} Companies
              </Badge>
              <Badge variant="outline" className="text-xs">
                {quotes.length} Quotes
              </Badge>
              <Badge variant="outline" className="text-xs">
                {purchaseOrders.length} Purchase Orders
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="quotes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quotes" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Quotes</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Companies</span>
            </TabsTrigger>
            <TabsTrigger value="purchase-orders" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Purchase Orders</span>
            </TabsTrigger>
          </TabsList>

          {/* Quotes Tab */}
          <TabsContent value="quotes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Quotes Management</CardTitle>
                <Button 
                  onClick={() => setQuoteModal({ open: true, data: null })}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Quote</span>
                </Button>
              </CardHeader>
              <CardContent>
                {quotes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No quotes yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first quote to get started</p>
                    <Button onClick={() => setQuoteModal({ open: true, data: null })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Quote
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {quotes.map((quote) => (
                      <Card key={quote.id} className="border border-border hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center space-x-4">
                                <Badge variant="outline" className="font-mono">
                                  {quote.quoteNumber}
                                </Badge>
                                {quote.poNumber && (
                                  <Badge variant="secondary" className="font-mono">
                                    PO: {quote.poNumber}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-foreground">{quote.companies?.name || 'No Company'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-foreground">{formatDate(quote.createdAt)}</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">Bill To:</span>
                                <span className="text-sm font-medium text-foreground">{quote.billTo || 'Not specified'}</span>
                              </div>
                            </div>

                            <div className="text-right space-y-3">
                              <div className="space-y-1">
                                <p className="text-2xl font-bold text-primary">
                                  {formatCurrency(quote.totalAmount)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Subtotal: {formatCurrency(quote.subtotal)} + VAT ({quote.vatRate}%)
                                </p>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPdfModal({ open: true, data: quote, type: 'quote' })}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  PDF
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setQuoteModal({ open: true, data: quote })}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => convertToPurchaseOrder(quote)}
                                >
                                  <ArrowRight className="h-4 w-4 mr-1" />
                                  To PO
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete('quotes', quote.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Companies Management</CardTitle>
                <Button 
                  onClick={() => setCompanyModal({ open: true, data: null })}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Company</span>
                </Button>
              </CardHeader>
              <CardContent>
                {companies.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No companies yet</h3>
                    <p className="text-muted-foreground mb-6">Add your first company to start creating quotes</p>
                    <Button onClick={() => setCompanyModal({ open: true, data: null })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Company
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {companies.map((company) => (
                      <Card key={company.id} className="border border-border hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              {company.logo ? (
                                <img 
                                  src={company.logo} 
                                  alt={`${company.name} logo`}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Building2 className="h-6 w-6 text-primary" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground">{company.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                  Created {formatDate(company.createdAt)}
                                </p>
                              </div>
                            </div>

                            {company.address && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {company.address}
                              </p>
                            )}

                            <div className="space-y-1">
                              {company.phone && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-foreground">{company.phone}</span>
                                </div>
                              )}
                              {company.email && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-foreground">{company.email}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <Badge variant="secondary" className="text-xs">
                                {quotes.filter(q => q.companyId === company.id).length} Quotes
                              </Badge>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCompanyModal({ open: true, data: company })}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete('companies', company.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchase Orders Tab */}
          <TabsContent value="purchase-orders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Purchase Orders</CardTitle>
                <Button 
                  onClick={() => setPOModal({ open: true, data: null })}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Purchase Order</span>
                </Button>
              </CardHeader>
              <CardContent>
                {purchaseOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No purchase orders yet</h3>
                    <p className="text-muted-foreground mb-6">Convert quotes or create purchase orders directly</p>
                    <Button onClick={() => setPOModal({ open: true, data: null })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Purchase Order
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {purchaseOrders.map((po) => (
                      <Card key={po.id} className="border border-border hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center space-x-4">
                                <Badge variant="outline" className="font-mono">
                                  {po.poNumber}
                                </Badge>
                                {po.quoteNumber && (
                                  <Badge variant="secondary" className="font-mono">
                                    From Quote: {po.quoteNumber}
                                  </Badge>
                                )}
                                <Badge 
                                  variant={po.status === 'completed' ? 'default' : 'outline'}
                                  className="capitalize"
                                >
                                  {po.status}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-foreground">{po.companies?.name || 'No Company'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-foreground">{formatDate(po.createdAt)}</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">Bill To:</span>
                                <span className="text-sm font-medium text-foreground">{po.billTo || 'Not specified'}</span>
                              </div>
                            </div>

                            <div className="text-right space-y-3">
                              <div className="space-y-1">
                                <p className="text-2xl font-bold text-primary">
                                  {formatCurrency(po.totalAmount)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Subtotal: {formatCurrency(po.subtotal)} + VAT ({po.vatRate}%)
                                </p>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPdfModal({ open: true, data: po, type: 'purchase-order' })}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  PDF
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPOModal({ open: true, data: po })}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete('purchase-orders', po.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <CompanyModal
        open={companyModal.open}
        onClose={() => setCompanyModal({ open: false, data: null })}
        data={companyModal.data}
        onSuccess={fetchData}
      />

      <QuoteModal
        open={quoteModal.open}
        onClose={() => setQuoteModal({ open: false, data: null })}
        data={quoteModal.data}
        companies={companies}
        onSuccess={fetchData}
      />

      <PurchaseOrderModal
        open={poModal.open}
        onClose={() => setPOModal({ open: false, data: null })}
        data={poModal.data}
        companies={companies}
        onSuccess={fetchData}
      />

      <PDFGenerator
        open={pdfModal.open}
        onClose={() => setPdfModal({ open: false, data: null, type: null })}
        data={pdfModal.data}
        type={pdfModal.type}
      />
    </div>
  )
}