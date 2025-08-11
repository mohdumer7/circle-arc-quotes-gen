#!/usr/bin/env python3
"""
Backend API Testing for Quote Generator Application
Tests Companies, Quotes, and Purchase Orders APIs with Supabase integration
"""

import requests
import json
import os
import sys
from datetime import datetime
import base64

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://a017fc05-72ae-46e0-8737-e0fa7a88504b.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Test data
SAMPLE_LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

def log_test_result(test_name, success, details=""):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"[{timestamp}] {status} - {test_name}")
    if details:
        print(f"    Details: {details}")
    print()

def test_companies_api():
    """Test all Companies API endpoints"""
    print("=" * 60)
    print("TESTING COMPANIES API")
    print("=" * 60)
    
    created_company_id = None
    
    try:
        # Test 1: GET all companies (should work even if empty)
        print("1. Testing GET /api/companies")
        response = requests.get(f"{API_BASE}/companies", timeout=10)
        if response.status_code == 200:
            companies = response.json()
            log_test_result("GET /api/companies", True, f"Retrieved {len(companies)} companies")
        else:
            log_test_result("GET /api/companies", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Test 2: POST create new company
        print("2. Testing POST /api/companies")
        company_data = {
            "name": "Acme Corporation Ltd",
            "logo": SAMPLE_LOGO_BASE64,
            "address": "123 Business Street, Corporate City, CC 12345",
            "phone": "+1-555-123-4567",
            "email": "contact@acmecorp.com",
            "signature": "John Smith, CEO",
            "seal": "Official Company Seal"
        }
        
        response = requests.post(f"{API_BASE}/companies", json=company_data, timeout=10)
        if response.status_code == 200:
            created_company = response.json()
            created_company_id = created_company.get('id')
            log_test_result("POST /api/companies", True, f"Created company with ID: {created_company_id}")
        else:
            log_test_result("POST /api/companies", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Test 3: GET specific company
        print("3. Testing GET /api/companies/{id}")
        if created_company_id:
            response = requests.get(f"{API_BASE}/companies/{created_company_id}", timeout=10)
            if response.status_code == 200:
                company = response.json()
                log_test_result("GET /api/companies/{id}", True, f"Retrieved company: {company.get('name')}")
            else:
                log_test_result("GET /api/companies/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        
        # Test 4: PUT update company
        print("4. Testing PUT /api/companies/{id}")
        if created_company_id:
            update_data = {
                "name": "Acme Corporation Ltd - Updated",
                "phone": "+1-555-987-6543",
                "email": "updated@acmecorp.com"
            }
            response = requests.put(f"{API_BASE}/companies/{created_company_id}", json=update_data, timeout=10)
            if response.status_code == 200:
                updated_company = response.json()
                log_test_result("PUT /api/companies/{id}", True, f"Updated company name: {updated_company.get('name')}")
            else:
                log_test_result("PUT /api/companies/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        
        # Test 5: DELETE company (we'll do this last)
        print("5. Testing DELETE /api/companies/{id}")
        if created_company_id:
            response = requests.delete(f"{API_BASE}/companies/{created_company_id}", timeout=10)
            if response.status_code == 200:
                result = response.json()
                log_test_result("DELETE /api/companies/{id}", True, f"Deleted company successfully: {result}")
            else:
                log_test_result("DELETE /api/companies/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        
        return True
        
    except requests.exceptions.RequestException as e:
        log_test_result("Companies API", False, f"Network error: {str(e)}")
        return False
    except Exception as e:
        log_test_result("Companies API", False, f"Unexpected error: {str(e)}")
        return False

def test_quotes_api():
    """Test all Quotes API endpoints"""
    print("=" * 60)
    print("TESTING QUOTES API")
    print("=" * 60)
    
    created_company_id = None
    created_quote_id = None
    
    try:
        # First create a company for the quote
        print("0. Creating test company for quotes")
        company_data = {
            "name": "Test Company for Quotes",
            "address": "456 Quote Street, Business City, BC 67890",
            "phone": "+1-555-234-5678",
            "email": "quotes@testcompany.com"
        }
        
        response = requests.post(f"{API_BASE}/companies", json=company_data, timeout=10)
        if response.status_code == 200:
            created_company = response.json()
            created_company_id = created_company.get('id')
            log_test_result("Create test company", True, f"Company ID: {created_company_id}")
        else:
            log_test_result("Create test company", False, f"Status: {response.status_code}")
            return False
        
        # Test 1: GET all quotes
        print("1. Testing GET /api/quotes")
        response = requests.get(f"{API_BASE}/quotes", timeout=10)
        if response.status_code == 200:
            quotes = response.json()
            log_test_result("GET /api/quotes", True, f"Retrieved {len(quotes)} quotes")
        else:
            log_test_result("GET /api/quotes", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Test 2: POST create new quote
        print("2. Testing POST /api/quotes")
        quote_data = {
            "companyId": created_company_id,
            "quoteNumber": f"Q-{datetime.now().strftime('%Y%m%d')}-001",
            "poNumber": "PO-REF-12345",
            "billTo": "ABC Manufacturing Ltd",
            "billToAddress": "789 Industrial Ave, Manufacturing City, MC 11111",
            "billToContact": "Jane Doe, Procurement Manager",
            "items": [
                {
                    "description": "Premium Widget Model A",
                    "quantity": 10,
                    "unitPrice": 150.00,
                    "total": 1500.00
                },
                {
                    "description": "Standard Widget Model B", 
                    "quantity": 25,
                    "unitPrice": 75.50,
                    "total": 1887.50
                }
            ],
            "subtotal": 3387.50,
            "vatRate": 5,
            "vatAmount": 169.38,
            "totalAmount": 3556.88,
            "notes": "Payment terms: Net 30 days. Delivery within 2 weeks."
        }
        
        response = requests.post(f"{API_BASE}/quotes", json=quote_data, timeout=10)
        if response.status_code == 200:
            created_quote = response.json()
            created_quote_id = created_quote.get('id')
            log_test_result("POST /api/quotes", True, f"Created quote with ID: {created_quote_id}")
        else:
            log_test_result("POST /api/quotes", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Test 3: GET specific quote
        print("3. Testing GET /api/quotes/{id}")
        if created_quote_id:
            response = requests.get(f"{API_BASE}/quotes/{created_quote_id}", timeout=10)
            if response.status_code == 200:
                quote = response.json()
                log_test_result("GET /api/quotes/{id}", True, f"Retrieved quote: {quote.get('quoteNumber')}")
                # Verify company relation
                if 'companies' in quote and quote['companies']:
                    log_test_result("Quote-Company relation", True, f"Company: {quote['companies']['name']}")
                else:
                    log_test_result("Quote-Company relation", False, "Company relation not found")
            else:
                log_test_result("GET /api/quotes/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        
        # Test 4: PUT update quote
        print("4. Testing PUT /api/quotes/{id}")
        if created_quote_id:
            update_data = {
                "billTo": "ABC Manufacturing Ltd - Updated",
                "totalAmount": 3750.00,
                "notes": "Updated payment terms: Net 15 days."
            }
            response = requests.put(f"{API_BASE}/quotes/{created_quote_id}", json=update_data, timeout=10)
            if response.status_code == 200:
                updated_quote = response.json()
                log_test_result("PUT /api/quotes/{id}", True, f"Updated quote total: ${updated_quote.get('totalAmount')}")
            else:
                log_test_result("PUT /api/quotes/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        
        # Test 5: DELETE quote
        print("5. Testing DELETE /api/quotes/{id}")
        if created_quote_id:
            response = requests.delete(f"{API_BASE}/quotes/{created_quote_id}", timeout=10)
            if response.status_code == 200:
                result = response.json()
                log_test_result("DELETE /api/quotes/{id}", True, f"Deleted quote successfully: {result}")
            else:
                log_test_result("DELETE /api/quotes/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        
        # Cleanup: Delete test company
        if created_company_id:
            requests.delete(f"{API_BASE}/companies/{created_company_id}", timeout=10)
        
        return True
        
    except requests.exceptions.RequestException as e:
        log_test_result("Quotes API", False, f"Network error: {str(e)}")
        return False
    except Exception as e:
        log_test_result("Quotes API", False, f"Unexpected error: {str(e)}")
        return False

def test_purchase_orders_api():
    """Test all Purchase Orders API endpoints"""
    print("=" * 60)
    print("TESTING PURCHASE ORDERS API")
    print("=" * 60)
    
    created_company_id = None
    created_po_id = None
    
    try:
        # First create a company for the purchase order
        print("0. Creating test company for purchase orders")
        company_data = {
            "name": "Test Company for POs",
            "address": "321 Purchase Order Blvd, PO City, PC 54321",
            "phone": "+1-555-345-6789",
            "email": "po@testcompany.com"
        }
        
        response = requests.post(f"{API_BASE}/companies", json=company_data, timeout=10)
        if response.status_code == 200:
            created_company = response.json()
            created_company_id = created_company.get('id')
            log_test_result("Create test company", True, f"Company ID: {created_company_id}")
        else:
            log_test_result("Create test company", False, f"Status: {response.status_code}")
            return False
        
        # Test 1: GET all purchase orders
        print("1. Testing GET /api/purchase-orders")
        response = requests.get(f"{API_BASE}/purchase-orders", timeout=10)
        if response.status_code == 200:
            pos = response.json()
            log_test_result("GET /api/purchase-orders", True, f"Retrieved {len(pos)} purchase orders")
        else:
            log_test_result("GET /api/purchase-orders", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Test 2: POST create new purchase order
        print("2. Testing POST /api/purchase-orders")
        po_data = {
            "companyId": created_company_id,
            "poNumber": f"PO-{datetime.now().strftime('%Y%m%d')}-001",
            "quoteNumber": "Q-REF-67890",
            "billTo": "XYZ Services Inc",
            "billToAddress": "987 Service Lane, Service City, SC 22222",
            "billToContact": "Bob Johnson, Operations Manager",
            "items": [
                {
                    "description": "Professional Service Package A",
                    "quantity": 5,
                    "unitPrice": 500.00,
                    "total": 2500.00
                },
                {
                    "description": "Maintenance Contract - Annual",
                    "quantity": 1,
                    "unitPrice": 1200.00,
                    "total": 1200.00
                }
            ],
            "subtotal": 3700.00,
            "vatRate": 5,
            "vatAmount": 185.00,
            "totalAmount": 3885.00,
            "status": "pending",
            "notes": "Service to commence within 30 days of PO approval."
        }
        
        response = requests.post(f"{API_BASE}/purchase-orders", json=po_data, timeout=10)
        if response.status_code == 200:
            created_po = response.json()
            created_po_id = created_po.get('id')
            log_test_result("POST /api/purchase-orders", True, f"Created PO with ID: {created_po_id}")
        else:
            log_test_result("POST /api/purchase-orders", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Test 3: GET specific purchase order
        print("3. Testing GET /api/purchase-orders/{id}")
        if created_po_id:
            response = requests.get(f"{API_BASE}/purchase-orders/{created_po_id}", timeout=10)
            if response.status_code == 200:
                po = response.json()
                log_test_result("GET /api/purchase-orders/{id}", True, f"Retrieved PO: {po.get('poNumber')}")
                # Verify company relation
                if 'companies' in po and po['companies']:
                    log_test_result("PO-Company relation", True, f"Company: {po['companies']['name']}")
                else:
                    log_test_result("PO-Company relation", False, "Company relation not found")
            else:
                log_test_result("GET /api/purchase-orders/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        
        # Test 4: PUT update purchase order
        print("4. Testing PUT /api/purchase-orders/{id}")
        if created_po_id:
            update_data = {
                "status": "approved",
                "totalAmount": 4000.00,
                "notes": "PO approved. Service start date confirmed."
            }
            response = requests.put(f"{API_BASE}/purchase-orders/{created_po_id}", json=update_data, timeout=10)
            if response.status_code == 200:
                updated_po = response.json()
                log_test_result("PUT /api/purchase-orders/{id}", True, f"Updated PO status: {updated_po.get('status')}")
            else:
                log_test_result("PUT /api/purchase-orders/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        
        # Test 5: DELETE purchase order
        print("5. Testing DELETE /api/purchase-orders/{id}")
        if created_po_id:
            response = requests.delete(f"{API_BASE}/purchase-orders/{created_po_id}", timeout=10)
            if response.status_code == 200:
                result = response.json()
                log_test_result("DELETE /api/purchase-orders/{id}", True, f"Deleted PO successfully: {result}")
            else:
                log_test_result("DELETE /api/purchase-orders/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        
        # Cleanup: Delete test company
        if created_company_id:
            requests.delete(f"{API_BASE}/companies/{created_company_id}", timeout=10)
        
        return True
        
    except requests.exceptions.RequestException as e:
        log_test_result("Purchase Orders API", False, f"Network error: {str(e)}")
        return False
    except Exception as e:
        log_test_result("Purchase Orders API", False, f"Unexpected error: {str(e)}")
        return False

def test_json_parsing():
    """Test JSON parsing of items arrays"""
    print("=" * 60)
    print("TESTING JSON PARSING & CURRENCY CALCULATIONS")
    print("=" * 60)
    
    try:
        # Create a company first
        company_data = {
            "name": "JSON Test Company",
            "email": "json@test.com"
        }
        
        response = requests.post(f"{API_BASE}/companies", json=company_data, timeout=10)
        if response.status_code != 200:
            log_test_result("JSON Test Setup", False, "Failed to create test company")
            return False
        
        company_id = response.json().get('id')
        
        # Test complex items array with currency calculations
        complex_items = [
            {
                "description": "High-end Product with Special Characters: àáâãäåæçèéêë",
                "quantity": 3,
                "unitPrice": 1234.56,
                "total": 3703.68,
                "category": "premium",
                "sku": "SKU-001-SPECIAL"
            },
            {
                "description": "Bulk Item with Discount",
                "quantity": 100,
                "unitPrice": 9.99,
                "total": 999.00,
                "discount": 0.01,
                "category": "bulk"
            }
        ]
        
        quote_data = {
            "companyId": company_id,
            "quoteNumber": "JSON-TEST-001",
            "items": complex_items,
            "subtotal": 4702.68,
            "vatRate": 7.5,
            "vatAmount": 352.70,
            "totalAmount": 5055.38
        }
        
        response = requests.post(f"{API_BASE}/quotes", json=quote_data, timeout=10)
        if response.status_code == 200:
            created_quote = response.json()
            quote_id = created_quote.get('id')
            log_test_result("JSON Items Storage", True, f"Stored complex items array")
            
            # Retrieve and verify JSON parsing
            response = requests.get(f"{API_BASE}/quotes/{quote_id}", timeout=10)
            if response.status_code == 200:
                retrieved_quote = response.json()
                stored_items = json.loads(retrieved_quote.get('items', '[]'))
                
                if len(stored_items) == 2 and stored_items[0]['description'].startswith('High-end'):
                    log_test_result("JSON Items Retrieval", True, "Complex items correctly parsed")
                else:
                    log_test_result("JSON Items Retrieval", False, f"Items parsing issue: {stored_items}")
            
            # Cleanup
            requests.delete(f"{API_BASE}/quotes/{quote_id}", timeout=10)
        else:
            log_test_result("JSON Items Storage", False, f"Status: {response.status_code}")
        
        # Cleanup company
        requests.delete(f"{API_BASE}/companies/{company_id}", timeout=10)
        
        return True
        
    except Exception as e:
        log_test_result("JSON Parsing Test", False, f"Error: {str(e)}")
        return False

def test_foreign_key_relationships():
    """Test foreign key relationships between companies and quotes/POs"""
    print("=" * 60)
    print("TESTING FOREIGN KEY RELATIONSHIPS")
    print("=" * 60)
    
    try:
        # Create a company
        company_data = {
            "name": "Relationship Test Company",
            "email": "relationships@test.com"
        }
        
        response = requests.post(f"{API_BASE}/companies", json=company_data, timeout=10)
        if response.status_code != 200:
            log_test_result("FK Test Setup", False, "Failed to create test company")
            return False
        
        company_id = response.json().get('id')
        
        # Create quote with company relationship
        quote_data = {
            "companyId": company_id,
            "quoteNumber": "FK-TEST-Q001",
            "items": [{"description": "Test Item", "quantity": 1, "unitPrice": 100, "total": 100}],
            "subtotal": 100,
            "totalAmount": 100
        }
        
        response = requests.post(f"{API_BASE}/quotes", json=quote_data, timeout=10)
        if response.status_code == 200:
            quote_id = response.json().get('id')
            
            # Verify relationship in quote retrieval
            response = requests.get(f"{API_BASE}/quotes/{quote_id}", timeout=10)
            if response.status_code == 200:
                quote = response.json()
                if 'companies' in quote and quote['companies']['name'] == 'Relationship Test Company':
                    log_test_result("Quote-Company FK", True, "Foreign key relationship working")
                else:
                    log_test_result("Quote-Company FK", False, f"FK issue: {quote}")
            
            # Create PO with same company
            po_data = {
                "companyId": company_id,
                "poNumber": "FK-TEST-PO001",
                "items": [{"description": "Test PO Item", "quantity": 2, "unitPrice": 50, "total": 100}],
                "subtotal": 100,
                "totalAmount": 100,
                "status": "pending"
            }
            
            response = requests.post(f"{API_BASE}/purchase-orders", json=po_data, timeout=10)
            if response.status_code == 200:
                po_id = response.json().get('id')
                
                # Verify relationship in PO retrieval
                response = requests.get(f"{API_BASE}/purchase-orders/{po_id}", timeout=10)
                if response.status_code == 200:
                    po = response.json()
                    if 'companies' in po and po['companies']['name'] == 'Relationship Test Company':
                        log_test_result("PO-Company FK", True, "Foreign key relationship working")
                    else:
                        log_test_result("PO-Company FK", False, f"FK issue: {po}")
                
                # Cleanup
                requests.delete(f"{API_BASE}/purchase-orders/{po_id}", timeout=10)
            
            # Cleanup
            requests.delete(f"{API_BASE}/quotes/{quote_id}", timeout=10)
        
        # Cleanup company
        requests.delete(f"{API_BASE}/companies/{company_id}", timeout=10)
        
        return True
        
    except Exception as e:
        log_test_result("Foreign Key Test", False, f"Error: {str(e)}")
        return False

def main():
    """Run all backend API tests"""
    print("🚀 Starting Backend API Tests for Quote Generator")
    print(f"🌐 Testing against: {API_BASE}")
    print("=" * 80)
    
    test_results = []
    
    # Run all tests
    test_results.append(("Companies API", test_companies_api()))
    test_results.append(("Quotes API", test_quotes_api()))
    test_results.append(("Purchase Orders API", test_purchase_orders_api()))
    test_results.append(("JSON Parsing", test_json_parsing()))
    test_results.append(("Foreign Key Relationships", test_foreign_key_relationships()))
    
    # Summary
    print("=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\n📈 Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All backend API tests passed successfully!")
        return True
    else:
        print("⚠️  Some tests failed. Check the details above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)