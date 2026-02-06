import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility untuk merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date untuk display
export function formatDate(date: string | Date | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format date untuk input
export function formatDateForInput(date: string | Date | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

// Calculate age from birthdate
export function calculateAge(birthdate: string | Date | null): number | null {
  if (!birthdate) return null
  const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Format phone number
export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '-'
  // Simple format: +62 812-3456-7890
  if (phone.startsWith('0')) {
    phone = '+62' + phone.substring(1)
  }
  return phone
}

// Mask NIK for privacy (show only last 4 digits)
export function maskNIK(nik: string): string {
  if (nik.length < 4) return nik
  return '****-****-****-' + nik.slice(-4)
}

// Mask No KK for privacy
export function maskNoKK(noKK: string): string {
  if (noKK.length < 4) return noKK
  return '****-****-****-' + noKK.slice(-4)
}

// Generate initials from name
export function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Format status huni
export function formatStatusHuni(status: 'berpenghuni' | 'tidak_berpenghuni'): string {
  return status === 'berpenghuni' ? 'Berpenghuni' : 'Tidak Berpenghuni'
}

// Format status kepemilikan
export function formatStatusKepemilikan(status: 'milik_sendiri' | 'sewa'): string {
  return status === 'milik_sendiri' ? 'Milik Sendiri' : 'Sewa'
}

// Export to CSV
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Debounce function for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Get role display name
export function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    warga: 'Warga',
    koordinator_rw: 'Koordinator RW',
    ketua_rt: 'Ketua RT',
    ketua_rw: 'Ketua RW',
  }
  return roleMap[role] || role
}

// Check if user has permission
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

// Get role hierarchy level (higher = more power)
export function getRoleLevel(role: string): number {
  const levels: Record<string, number> = {
    warga: 1,
    ketua_rt: 2,
    koordinator_rw: 3,
    ketua_rw: 4,
  }
  return levels[role] || 0
}
