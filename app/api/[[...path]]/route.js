import { NextResponse } from 'next/server'
import { supabase, generateId } from '../../../lib/supabase.js'

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const pathname = url.pathname
    const path = pathname.split('/api/')[1] || ''
    const pathParts = path.split('/')

    // Companies API
    if (pathParts[0] === 'companies') {
      if (pathParts[1]) {
        // Get specific company
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', pathParts[1])
          .single()
        
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data || {})
      } else {
        // Get all companies
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('createdAt', { ascending: false })
        
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data || [])
      }
    }

    // Quotes API
    if (pathParts[0] === 'quotes') {
      if (pathParts[1]) {
        // Get specific quote
        const { data, error } = await supabase
          .from('quotes')
          .select(`
            *,
            companies (
              id,
              name,
              logo,
              address,
              phone,
              email
            )
          `)
          .eq('id', pathParts[1])
          .single()
        
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data || {})
      } else {
        // Get all quotes
        const { data, error } = await supabase
          .from('quotes')
          .select(`
            *,
            companies (
              id,
              name,
              logo
            )
          `)
          .order('createdAt', { ascending: false })
        
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data || [])
      }
    }

    // Purchase Orders API  
    if (pathParts[0] === 'purchase-orders') {
      if (pathParts[1]) {
        // Get specific purchase order
        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            companies (
              id,
              name,
              logo,
              address,
              phone,
              email
            )
          `)
          .eq('id', pathParts[1])
          .single()
        
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data || {})
      } else {
        // Get all purchase orders
        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            companies (
              id,
              name,
              logo
            )
          `)
          .order('createdAt', { ascending: false })
        
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data || [])
      }
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const url = new URL(request.url)
    const pathname = url.pathname
    const path = pathname.split('/api/')[1] || ''
    const pathParts = path.split('/')
    const body = await request.json()

    // Companies API
    if (pathParts[0] === 'companies') {
      const newCompany = {
        id: generateId(),
        name: body.name,
        logo: body.logo || '',
        address: body.address || '',
        phone: body.phone || '',
        email: body.email || '',
        signature: body.signature || '',
        seal: body.seal || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('companies')
        .insert([newCompany])
        .select()
        .single()
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    // Quotes API
    if (pathParts[0] === 'quotes') {
      const newQuote = {
        id: generateId(),
        companyId: body.companyId,
        quoteNumber: body.quoteNumber || `Q-${Date.now()}`,
        poNumber: body.poNumber || '',
        billTo: body.billTo || '',
        billToAddress: body.billToAddress || '',
        billToContact: body.billToContact || '',
        items: JSON.stringify(body.items || []),
        subtotal: body.subtotal || 0,
        vatRate: body.vatRate || 5,
        vatAmount: body.vatAmount || 0,
        totalAmount: body.totalAmount || 0,
        notes: body.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('quotes')
        .insert([newQuote])
        .select()
        .single()
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    // Purchase Orders API
    if (pathParts[0] === 'purchase-orders') {
      const newPO = {
        id: generateId(),
        companyId: body.companyId,
        quoteId: body.quoteId || null,
        poNumber: body.poNumber || `PO-${Date.now()}`,
        quoteNumber: body.quoteNumber || '',
        billTo: body.billTo || '',
        billToAddress: body.billToAddress || '',
        billToContact: body.billToContact || '',
        items: JSON.stringify(body.items || []),
        subtotal: body.subtotal || 0,
        vatRate: body.vatRate || 5,
        vatAmount: body.vatAmount || 0,
        totalAmount: body.totalAmount || 0,
        notes: body.notes || '',
        status: body.status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('purchase_orders')
        .insert([newPO])
        .select()
        .single()
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404 })

  } catch (error) {
    console.error('POST API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const url = new URL(request.url)
    const pathname = url.pathname
    const path = pathname.split('/api/')[1] || ''
    const pathParts = path.split('/')
    const body = await request.json()

    const id = pathParts[1]
    if (!id) {
      return NextResponse.json({ error: 'ID required for update' }, { status: 400 })
    }

    // Companies API
    if (pathParts[0] === 'companies') {
      const { data, error } = await supabase
        .from('companies')
        .update({
          ...body,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    // Quotes API
    if (pathParts[0] === 'quotes') {
      const updateData = { ...body }
      if (updateData.items) {
        updateData.items = JSON.stringify(updateData.items)
      }
      updateData.updatedAt = new Date().toISOString()

      const { data, error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    // Purchase Orders API
    if (pathParts[0] === 'purchase-orders') {
      const updateData = { ...body }
      if (updateData.items) {
        updateData.items = JSON.stringify(updateData.items)
      }
      updateData.updatedAt = new Date().toISOString()

      const { data, error } = await supabase
        .from('purchase_orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404 })

  } catch (error) {
    console.error('PUT API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url)
    const pathname = url.pathname
    const path = pathname.split('/api/')[1] || ''
    const pathParts = path.split('/')

    const id = pathParts[1]
    if (!id) {
      return NextResponse.json({ error: 'ID required for delete' }, { status: 400 })
    }

    // Companies API
    if (pathParts[0] === 'companies') {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // Quotes API
    if (pathParts[0] === 'quotes') {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id)
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // Purchase Orders API
    if (pathParts[0] === 'purchase-orders') {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id)
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404 })

  } catch (error) {
    console.error('DELETE API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}