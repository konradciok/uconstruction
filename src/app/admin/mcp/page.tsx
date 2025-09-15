'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import styles from './page.module.css'

interface MCPStatus {
  postgres: {
    totalProducts: number
    syncedProducts: number
    lastSync: string | null
  }
  stripe: {
    totalProducts: number
    lastSync: string | null
  }
  syncStatus: {
    percentage: number
    lastFullSync: string | null
  }
}

interface StatusCardProps {
  title: string
  value: string | number
  status: 'success' | 'warning' | 'error' | 'info'
  icon: React.ComponentType<{ className?: string }>
  subtitle?: string
}

function StatusCard({ title, value, status, icon: Icon, subtitle }: StatusCardProps) {

  const cardClass = `${styles.statusCard} ${
    status === 'success' ? styles.statusCardSuccess :
    status === 'warning' ? styles.statusCardWarning :
    status === 'error' ? styles.statusCardError :
    styles.statusCardInfo
  }`

  const iconClass = `${styles.statusCardIcon} ${
    status === 'success' ? styles.statusCardIconSuccess :
    status === 'warning' ? styles.statusCardIconWarning :
    status === 'error' ? styles.statusCardIconError :
    styles.statusCardIconInfo
  }`

  return (
    <div className={cardClass}>
      <div className={styles.statusCardContent}>
        <div className="flex-shrink-0">
          <Icon className={iconClass} />
        </div>
        <div className={styles.statusCardText}>
          <h3 className={styles.statusCardTitle}>{title}</h3>
          <p className={styles.statusCardValue}>{value}</p>
          {subtitle && <p className={styles.statusCardSubtitle}>{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

function QuickActionButton({ 
  onClick, 
  disabled, 
  children, 
  variant = 'primary' 
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
}) {
  const buttonClass = `${styles.button} ${
    variant === 'primary' ? styles.buttonPrimary :
    variant === 'secondary' ? styles.buttonSecondary :
    styles.buttonDanger
  }`

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
    >
      {children}
    </button>
  )
}

export default function MCPDashboard() {
  const [status, setStatus] = useState<MCPStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/mcp/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncDatabaseToStripe = async () => {
    try {
      setSyncing(true)
      setLogs(['Starting database to Stripe synchronization...'])
      
      const response = await fetch('/api/admin/mcp/sync/database-to-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false })
      })
      
      if (response.ok) {
        setLogs(prev => [...prev, 'Synchronization completed successfully!'])
        await fetchStatus() // Refresh status
      } else {
        setLogs(prev => [...prev, 'Synchronization failed!'])
      }
    } catch (error) {
      setLogs(prev => [...prev, `Error: ${error}`])
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncStripeToDatabase = async () => {
    try {
      setSyncing(true)
      setLogs(['Starting Stripe to database synchronization...'])
      
      const response = await fetch('/api/admin/mcp/sync/stripe-to-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateExisting: true })
      })
      
      if (response.ok) {
        setLogs(prev => [...prev, 'Synchronization completed successfully!'])
        await fetchStatus() // Refresh status
      } else {
        setLogs(prev => [...prev, 'Synchronization failed!'])
      }
    } catch (error) {
      setLogs(prev => [...prev, `Error: ${error}`])
    } finally {
      setSyncing(false)
    }
  }

  const handleCheckStatus = () => {
    fetchStatus()
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingContent}>
          <ArrowPathIcon className={styles.loadingIcon} />
          <p className={styles.loadingText}>Loading MCP Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>MCP Admin Dashboard</h1>
          <p className={styles.subtitle}>
            Manage product synchronization between PostgreSQL and Stripe
          </p>
        </div>

        {/* Status Overview */}
        {status && (
          <div className={styles.statusGrid}>
            <StatusCard
              title="PostgreSQL"
              value={`${status.postgres.syncedProducts}/${status.postgres.totalProducts}`}
              status={status.postgres.syncedProducts === status.postgres.totalProducts ? 'success' : 'warning'}
              icon={CheckCircleIcon}
              subtitle={status.postgres.lastSync ? `Last sync: ${new Date(status.postgres.lastSync).toLocaleString()}` : 'Never synced'}
            />
            <StatusCard
              title="Stripe"
              value={status.stripe.totalProducts}
              status="info"
              icon={ChartBarIcon}
              subtitle={status.stripe.lastSync ? `Last sync: ${new Date(status.stripe.lastSync).toLocaleString()}` : 'Never synced'}
            />
            <StatusCard
              title="Sync Status"
              value={`${status.syncStatus.percentage}%`}
              status={status.syncStatus.percentage === 100 ? 'success' : 'warning'}
              icon={status.syncStatus.percentage === 100 ? CheckCircleIcon : ExclamationTriangleIcon}
              subtitle={status.syncStatus.lastFullSync ? `Last full sync: ${new Date(status.syncStatus.lastFullSync).toLocaleString()}` : 'Never synced'}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className={styles.actionsCard}>
          <h2 className={styles.actionsTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <QuickActionButton
              onClick={handleSyncDatabaseToStripe}
              disabled={syncing}
              variant="primary"
            >
              {syncing ? 'Syncing...' : 'Sync Database → Stripe'}
            </QuickActionButton>
            <QuickActionButton
              onClick={handleSyncStripeToDatabase}
              disabled={syncing}
              variant="secondary"
            >
              {syncing ? 'Syncing...' : 'Sync Stripe → Database'}
            </QuickActionButton>
            <QuickActionButton
              onClick={handleCheckStatus}
              disabled={syncing}
              variant="secondary"
            >
              Check Status
            </QuickActionButton>
          </div>
        </div>

        {/* Recent Logs */}
        {logs.length > 0 && (
          <div className={styles.logsCard}>
            <h2 className={styles.logsTitle}>Recent Activity</h2>
            <div className={styles.logsContainer}>
              {logs.map((log, index) => (
                <div key={index} className={styles.logEntry}>
                  <span className={styles.logTimestamp}>[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={styles.navigation}>
          <Link
            href="/admin/mcp/products"
            className={styles.navLink}
          >
            <CogIcon className={styles.navIcon} />
            Manage Products
          </Link>
          <Link
            href="/admin/mcp/logs"
            className={styles.navLink}
          >
            <InformationCircleIcon className={styles.navIcon} />
            View Logs
          </Link>
        </div>
      </div>
    </div>
  )
}
