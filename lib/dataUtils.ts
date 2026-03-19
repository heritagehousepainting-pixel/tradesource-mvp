// Data export/import utilities for TradeSource
// Handles localStorage data backup and restore

export interface ExportData {
  version: string
  exportedAt: string
  data: {
    contractor_applications?: any[]
    contractor_docs?: Record<string, any>
    approved_contractors?: any[]
    homeowners?: any[]
    homeowner_jobs?: any[]
    contractor_jobs?: any[]
    job_interests?: any[]
    pending_password_set?: Record<string, any>
    [key: string]: any
  }
}

export function getAllLocalStorageData(): ExportData {
  const keys = [
    'contractor_applications',
    'contractor_docs', 
    'approved_contractors',
    'homeowners',
    'homeowner_jobs',
    'contractor_jobs',
    'job_interests',
    'pending_password_set'
  ]

  const data: ExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {}
  }

  keys.forEach(key => {
    const value = localStorage.getItem(key)
    if (value) {
      try {
        data.data[key] = JSON.parse(value)
      } catch {
        // Skip invalid JSON
      }
    }
  })

  return data
}

export function exportToJSON(): string {
  const data = getAllLocalStorageData()
  return JSON.stringify(data, null, 2)
}

export function downloadExport(filename?: string): void {
  const json = exportToJSON()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `tradesync-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importFromJSON(jsonString: string): { success: boolean; message: string; imported: number } {
  let parsed: ExportData
  
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return { success: false, message: 'Invalid JSON format', imported: 0 }
  }

  if (!parsed.version || !parsed.data) {
    return { success: false, message: 'Invalid backup file format', imported: 0 }
  }

  let imported = 0
  
  // Import each data type
  const dataTypes = [
    'contractor_applications',
    'contractor_docs',
    'approved_contractors',
    'homeowners',
    'homeowner_jobs',
    'contractor_jobs',
    'job_interests',
    'pending_password_set'
  ]

  dataTypes.forEach(key => {
    if (parsed.data[key] !== undefined) {
      localStorage.setItem(key, JSON.stringify(parsed.data[key]))
      imported++
    }
  })

  return { 
    success: true, 
    message: `Successfully imported ${imported} data types`,
    imported
  }
}

export function clearAllData(): void {
  const keys = [
    'contractor_applications',
    'contractor_docs',
    'approved_contractors',
    'homeowners',
    'homeowner_jobs',
    'contractor_jobs',
    'job_interests',
    'pending_password_set'
  ]

  keys.forEach(key => {
    localStorage.removeItem(key)
  })
}
