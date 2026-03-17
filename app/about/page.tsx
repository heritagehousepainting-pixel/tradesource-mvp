import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'About - TradeSource',
  description: 'Learn about TradeSource - The Verified Painting Network for Montgomery County, PA',
}

export default function AboutPage() {
  return (
    <main>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TradeSource</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm text-gray-600">
            <a href="/" className="hover:text-primary">Home</a>
            <a href="#contractors" className="hover:text-primary">For Contractors</a>
            <a href="#homeowners" className="hover:text-primary">For Homeowners</a>
            <a href="#verification" className="hover:text-primary">Verification</a>
          </div>
          <a href="/#join" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Join Network
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            TradeSource: The Verified Painting Network for Montgomery County, PA
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A <strong>win-win</strong> for painters and homeowners. Verified contractors fill overflow jobs at fixed rates; 
            homeowners get free postings + instant AI pricing. No middleman, no lead fees.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">The Problem We Solve</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">For Contractors</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Turn away good work when overloaded</li>
                <li>• Spend hours cold outreach for new leads</li>
                <li>• Unpredictable income between jobs</li>
              </ul>
            </div>
            <div className="bg-red-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">For Homeowners</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Can't tell who's trustworthy</li>
                <li>• No idea if pricing is fair</li>
                <li>• Risk hiring unreliability</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contractors Section - Major */}
      <section id="contractors" className="py-16 px-4 bg-blue-600">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">For Subcontractors & Painters</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Turn Overload into Revenue</h3>
                    <p className="text-sm text-gray-600">Access overflow painting jobs at your fixed rate — fill downtime without cold outreach.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Pick Jobs That Fit Your Schedule</h3>
                    <p className="text-sm text-gray-600">Choose jobs that match your availability and skills — no forced assignments.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Fixed-Rate Certainty</h3>
                    <p className="text-sm text-gray-600">Know your earnings upfront — no haggling, no scope creep, predictable margins.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-2xl">🔗</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Verified Network Only</h3>
                    <p className="text-sm text-gray-600">Connect with verified painters — see W-9, insurance, license, external reviews before accepting.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Build Your Reputation</h3>
                    <p className="text-sm text-gray-600">Earn internal 1-5 star reviews — showcase Google/Yelp links on your profile.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Free to Join (MVP)</h3>
                    <p className="text-sm text-gray-600">No lead fees or subscriptions — we're a connector, not a middleman taking a cut.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                <span className="text-2xl">🏘️</span>
                <div>
                  <h3 className="font-bold text-gray-900">Local Montgomery County Focus</h3>
                  <p className="text-sm text-gray-600">Nearby jobs mean faster response times, lower travel costs, and stronger community reputation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Homeowners Section */}
      <section id="homeowners" className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">For Homeowners</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-bold text-gray-900 mb-2">Post for Free</h3>
              <p className="text-sm text-gray-600">Post your painting job at no cost. No price needed — just describe what you need.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-bold text-gray-900 mb-2">Instant AI Pricing</h3>
              <p className="text-sm text-gray-600">Get an AI-generated price range based on Montgomery County data — know what's fair.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-3">✓</div>
              <h3 className="font-bold text-gray-900 mb-2">Verified Pros</h3>
              <p className="text-sm text-gray-600">See only verified, insured contractors with proven track records in your area.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Both Sides Win */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Both Sides Win</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Contractors Get</h3>
              <ul className="text-left space-y-3 text-gray-700">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Steady work between projects</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> No cold calling or lead fees</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Predictable fixed-rate jobs</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Local jobs = less travel</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Reputation building</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-green-900 mb-4">Homeowners Get</h3>
              <ul className="text-left space-y-3 text-gray-700">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Free to post, no obligation</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> AI pricing transparency</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Verified, insured pros only</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Quick responses from locals</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Peace of mind</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Verification */}
      <section id="verification" className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Strict Verification</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Required for All Contractors</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2"><span className="text-purple-600">✓</span> W-9 (tax ID)</li>
                <li className="flex items-center gap-2"><span className="text-purple-600">✓</span> Proof of Insurance ($1M+ liability)</li>
                <li className="flex items-center gap-2"><span className="text-purple-600">✓</span> Workers' Compensation</li>
                <li className="flex items-center gap-2"><span className="text-purple-600">✓</span> Business License</li>
                <li className="flex items-center gap-2"><span className="text-purple-600">✓</span> Google/Yelp external link</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Ongoing Quality</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2"><span className="text-purple-600">✓</span> Manual review (initially)</li>
                <li className="flex items-center gap-2"><span className="text-purple-600">✓</span> Internal 1-5 star reviews</li>
                <li className="flex items-center gap-2"><span className="text-purple-600">✓</span> External score verification</li>
                <li className="flex items-center gap-2"><span className="text-purple-600">✓</span> Annual re-verification</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Built by Local Expert */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Built by a Local Painting Company Owner</h2>
            <p className="text-gray-700 mb-4">
              TradeSource wasn't built by software engineers who guessed at painting prices. 
              It was built by someone who's actually done the work in Montgomery County.
            </p>
            <p className="text-gray-700 mb-4">
              I know what it takes to paint a room right—from prep to final coat. 
              I know typical pricing in Montgomery County, realistic timelines, 
              and what separates a pro from a weekend warrior.
            </p>
            <p className="text-gray-700">
              That's why I'm committed to <strong>legitimacy and fair fixed rates</strong>. 
              No guesswork. No fly-by-night contractors. Just verified professionals 
              and happy homeowners.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join the Verified Network?</h2>
          <p className="text-gray-400 mb-8">
            Whether you're a painter looking for overflow work or a homeowner needing a trusted pro.
          </p>
          <a 
            href="/#join" 
            className="inline-block bg-primary text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700"
          >
            Get Started Today
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-xl text-white">TradeSource</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2026 TradeSource. Montgomery County, PA.
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="/" className="hover:text-white">Home</a>
            <a href="/about" className="hover:text-white">About</a>
            <a href="/#join" className="hover:text-white">Join</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
