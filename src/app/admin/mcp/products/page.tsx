'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import styles from './page.module.css'

interface Product {
  id: string
  handle: string
  title: string
  stripeProductId: string | null
  lastSynced: string | null
  status: 'synced' | 'pending' | 'error'
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'synced' | 'pending' | 'error'>('all')
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/mcp/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncProduct = async (productId: string) => {
    try {
      setSyncing(productId)
      const response = await fetch(`/api/admin/mcp/products/${productId}/sync`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchProducts() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to sync product:', error)
    } finally {
      setSyncing(null)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.handle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'pending':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'synced':
        return 'Synced'
      case 'pending':
        return 'Pending'
      case 'error':
        return 'Error'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingContent}>
          <ArrowPathIcon className={styles.loadingIcon} />
          <p className={styles.loadingText}>Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.productsPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Product Management</h1>
          <p className={styles.subtitle}>
            Manage product synchronization between PostgreSQL and Stripe
          </p>
        </div>

        {/* Filters */}
        <div className={styles.filtersCard}>
          <div className={styles.filtersGrid}>
            {/* Search */}
            <div className={styles.searchContainer}>
              <MagnifyingGlassIcon className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'synced' | 'pending' | 'error')}
              className={styles.select}
            >
              <option value="all">All Status</option>
              <option value="synced">Synced</option>
              <option value="pending">Pending</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>
                    Product
                  </th>
                  <th className={styles.tableHeader}>
                    Stripe ID
                  </th>
                  <th className={styles.tableHeader}>
                    Status
                  </th>
                  <th className={styles.tableHeader}>
                    Last Synced
                  </th>
                  <th className={styles.tableHeader}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div>
                        <div className={styles.productTitle}>
                          {product.title}
                        </div>
                        <div className={styles.productHandle}>
                          {product.handle}
                        </div>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      {product.stripeProductId ? (
                        <code className={styles.stripeId}>
                          {product.stripeProductId}
                        </code>
                      ) : (
                        <span className={styles.notSynced}>Not synced</span>
                      )}
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.tableCellFlex}>
                        {getStatusIcon(product.status)}
                        <span className={styles.statusText}>
                          {getStatusText(product.status)}
                        </span>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      {product.lastSynced ? (
                        new Date(product.lastSynced).toLocaleString()
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actions}>
                        <button
                          onClick={() => handleSyncProduct(product.id)}
                          disabled={syncing === product.id}
                          className={styles.actionButton}
                        >
                          {syncing === product.id ? (
                            <ArrowPathIcon className={styles.syncIcon} />
                          ) : (
                            'Sync'
                          )}
                        </button>
                        <button className={styles.actionButton}>
                          <EyeIcon className={styles.actionIcon} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No products found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>Summary</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{products.length}</div>
              <div className={styles.summaryLabel}>Total Products</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={`${styles.summaryValue} ${styles.summaryValueSuccess}`}>
                {products.filter(p => p.status === 'synced').length}
              </div>
              <div className={styles.summaryLabel}>Synced</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={`${styles.summaryValue} ${styles.summaryValueWarning}`}>
                {products.filter(p => p.status === 'pending').length}
              </div>
              <div className={styles.summaryLabel}>Pending</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={`${styles.summaryValue} ${styles.summaryValueError}`}>
                {products.filter(p => p.status === 'error').length}
              </div>
              <div className={styles.summaryLabel}>Errors</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className={styles.navigation}>
          <Link
            href="/admin/mcp"
            className={styles.navLink}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
