'use client'

import { useState, useEffect } from 'react'

interface PriceDisplayProps {
  budgetMin: number
  budgetMax: number
  contractorEmail?: string
  showFullPrice?: boolean // Force show full price (for homeowners, admins)
}

export default function PriceDisplay({ budgetMin, budgetMax, contractorEmail, showFullPrice = false }: PriceDisplayProps) {
  const [isVetted, setIsVetted] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkVerification() {
      // If explicitly told to show full price, skip check
      if (showFullPrice) {
        setIsVetted(true)
        setLoading(false)
        return
      }

      // For homeowner views, show full price
      if (typeof window !== 'undefined') {
        const path = window.location.pathname
        // Homeowner pages should see full prices
        if (path.includes('/homeowner') || path === '/') {
          setIsVetted(true)
          setLoading(false)
          return
        }
        
        // Admin should see full prices
        if (path.includes('/admin')) {
          setIsVetted(true)
          setLoading(false)
          return
        }
      }

      // Check localStorage for mock approval (MVP fallback)
      if (typeof window !== 'undefined') {
        // Check session for logged in contractor
        const userStr = sessionStorage.getItem('tradesource_user')
        const approved = JSON.parse(localStorage.getItem('approved_contractors') || '[]')
        
        if (userStr) {
          const user = JSON.parse(userStr)
          // Check if user is in approved contractors list with approved status
          const found = approved.find((c: any) => 
            c.email === user.email && c.status === 'approved'
          )
          if (found) {
            setIsVetted(true)
          } else {
            setIsVetted(false)
          }
          setLoading(false)
          return
        }
        
        // Also check approved_contractors for any user session
        if (approved.length > 0) {
          // If there are approved contractors and user has a session, check
          // Otherwise show blurred for unknown visitors
          setIsVetted(false)
          setLoading(false)
          return
        }
      }

      // Default: show blurred price for non-logged-in users
      setIsVetted(false)
      setLoading(false)
    }

    checkVerification()
  }, [contractorEmail, showFullPrice])

  if (loading) {
    return <span className="text-gray-400">Loading...</span>
  }

  // Show blurred price for non-vetted contractors
  if (!isVetted) {
    return (
      <span className="relative inline-block">
        <span className="blur-sm select-none text-gray-500">
          ${(budgetMin / 1000).toFixed(1)}k - ${(budgetMax / 1000).toFixed(1)}k
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
            🔒 Verified contractors only
          </span>
        </span>
      </span>
    )
  }

  // Show full price for vetted contractors
  return (
    <span className="text-gray-700">
      ${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()}
    </span>
  )
}