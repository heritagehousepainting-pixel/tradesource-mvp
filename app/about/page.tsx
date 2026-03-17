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
            <a href="#problem" className="hover:text-primary">Problem</a>
            <a href="#how-it-works" className="hover:text-primary">How It Works</a>
            <a href="#verification" className="hover:text-primary">Verification</a>
            <a href="#why-painting" className="hover:text-primary">Why Us</a>
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
            Trusted, verified painters connect for overflow jobs at fixed rates. 
            Homeowners get free postings + instant AI pricing estimates.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section id="problem" className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">The Problem</h2>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8">
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-red-500 text-xl">•</span>
                <span className="text-gray-700">Delays from overloaded contractors turning away good work</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 text-xl">•</span>
                <span className="text-gray-700">Unreliable subcontractors with no accountability</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 text-xl">•</span>
                <span className="text-gray-700">Lack of transparency and verification</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 text-xl">•</span>
                <span className="text-gray-700">Homeowners guessing at prices with no reliable benchmark</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contractors */}
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Contractors</h3>
              </div>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
                  <span className="text-gray-700">Get verified → post overflow painting jobs at your fixed rate</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
                  <span className="text-gray-700">Interested verified subs apply → view their profiles, docs, reviews</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                  <span className="text-gray-700">Accept → complete job → leave internal review & stars</span>
                </li>
              </ol>
            </div>

            {/* Homeowners */}
            <div className="bg-green-50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Homeowners</h3>
              </div>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="bg-secondary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
                  <span className="text-gray-700">Post job details for free (no price needed)</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-secondary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
                  <span className="text-gray-700">See interested verified painters who reviewed your job</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-secondary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                  <span className="text-gray-700">Get instant AI pricing range based on Montgomery County data</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Verification */}
      <section id="verification" className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Strict Verification</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Required for All Contractors</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span> W-9 (tax ID)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span> Proof of Insurance (min $1M liability)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span> Workers' Compensation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span> Business License
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span> External link (Google, Yelp, etc.)
                </li>
              </ul>
            </div>
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Review Process</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span> Manual review (initially)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span> Internal 1-5 star reviews after each job
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span> External score verification
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span> Re-verification annually
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Painting & Montgomery County */}
      <section id="why-painting" className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Painting & Montgomery County First?</h2>
          <div className="space-y-6 text-gray-700">
            <p>
              We started focused on painting to build <strong>real trust fast</strong>. 
              By narrowing our scope, we can actually verify every contractor thoroughly 
              and ensure quality matches for both sides.
            </p>
            <p>
              Once we prove the model works in Montgomery County, we'll expand to 
              other trades (drywall, flooring, HVAC) and nearby counties.
            </p>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Currently Serving Montgomery County, PA</h3>
              <div className="flex flex-wrap gap-2">
                {['Ambler', 'Blue Bell', 'Bryn Mawr', 'Conshohocken', 'Fort Washington', 'Gladwyne', 'Horsham', 'King of Prussia', 'Lansdale', 'Lower Gwynedd', 'Maple Glen', 'North Wales', 'Plymouth Meeting', 'Spring House', 'Willow Grove'].map(town => (
                  <span key={town} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{town}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built by Local Expert */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Built by a Local Painting Company Owner</h2>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
            <p className="text-gray-700 mb-4">
              TradeSource wasn't built by software engineers who guessed at painting prices. 
              It was built by someone who's actually done the work.
            </p>
            <p className="text-gray-700 mb-4">
              I know what it takes to paint a room right—from prep to final coat. 
              I know typical pricing in Montgomery County (a standard interior room 
              runs <strong>$500–$1,200</strong> depending on detail), realistic timelines, 
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
            Whether you're a contractor looking for overflow work or a homeowner needing a trusted painter.
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
            <a href="/#join" className="hover:text-white">Join</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
