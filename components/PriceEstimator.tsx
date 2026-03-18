'use client'

import { useState } from 'react'

export default function PriceEstimator() {
  const [formData, setFormData] = useState({
    jobType: 'interior',
    propertyType: 'residential',
    rooms: '1',
    sqft: '',
    floors: '1'
  })
  const [estimate, setEstimate] = useState<{min: number; max: number} | null>(null)

  const calculateEstimate = () => {
    const rooms = parseInt(formData.rooms) || 1
    const sqft = parseInt(formData.sqft) || (rooms * 250)
    const floors = parseInt(formData.floors) || 1
    
    let baseRateMin = 25 // per sqft
    let baseRateMax = 45 // per sqft
    
    // Adjust for job type
    if (formData.jobType === 'exterior') {
      baseRateMin = 35
      baseRateMax = 65
    } else if (formData.jobType === 'both') {
      baseRateMin = 45
      baseRateMax = 85
    }
    
    // Adjust for property type
    if (formData.propertyType === 'commercial') {
      baseRateMin *= 1.3
      baseRateMax *= 1.3
    } else if (formData.propertyType === 'multi-family') {
      baseRateMin *= 1.1
      baseRateMax *= 1.1
    }
    
    // Multi-floor discount/premium
    if (floors > 1) {
      baseRateMin *= 0.95
      baseRateMax *= 0.95
    }
    
    const min = Math.round(sqft * baseRateMin)
    const max = Math.round(sqft * baseRateMax)
    
    setEstimate({ min, max })
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
      <h3 className="font-bold text-lg text-gray-900 mb-4">💰 Instant Price Estimate</h3>
      
      {!estimate ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select
              value={formData.jobType}
              onChange={e => setFormData({...formData, jobType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="interior">Interior</option>
              <option value="exterior">Exterior</option>
              <option value="both">Interior + Exterior</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              value={formData.propertyType}
              onChange={e => setFormData({...formData, propertyType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="multi-family">Multi-Family</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
              <input
                type="number"
                min="1"
                value={formData.rooms}
                onChange={e => setFormData({...formData, rooms: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
              <input
                type="number"
                min="1"
                value={formData.floors}
                onChange={e => setFormData({...formData, floors: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sq Ft (optional)</label>
            <input
              type="number"
              value={formData.sqft}
              onChange={e => setFormData({...formData, sqft: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Leave blank to estimate from rooms"
            />
          </div>
          
          <button
            onClick={calculateEstimate}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
          >
            Get Estimate
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Estimated Range</p>
          <p className="text-3xl font-bold text-green-700">
            ${estimate.min.toLocaleString()} - ${estimate.max.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Based on {formData.sqft || (parseInt(formData.rooms) * 250)} sq ft • {formData.jobType} • {formData.propertyType}
          </p>
          <button
            onClick={() => setEstimate(null)}
            className="mt-4 text-sm text-green-600 hover:underline"
          >
            Recalculate
          </button>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        This is an estimate only. Final price may vary based on condition, prep work, and materials.
      </p>
    </div>
  )
}
