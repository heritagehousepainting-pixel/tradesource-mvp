import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TradeSource - Montgomery County Painters Network',
  description: 'Private, vetted network of painters in Montgomery County, PA who share work based on capacity.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var key = 'tradesource_seeded';
                if (!localStorage.getItem(key)) {
                  localStorage.setItem(key, 'true');
                  var jobs = JSON.parse(localStorage.getItem('tradesource_jobs') || '[]');
                  if (jobs.length === 0) {
                    var seedJobs = [
                      {
                        id: 'job-1',
                        posterId: 'user-1',
                        posterName: 'Mike Thompson',
                        posterBusiness: 'Thompson Painting LLC',
                        title: 'Interior Painting - 3 Bedroom Ranch',
                        description: 'Looking for an experienced painter to paint the interior of our 3 bedroom ranch home in King of Prussia.',
                        price: 1800,
                        location: 'King of Prussia, PA',
                        timing: 'This week - Flexible',
                        status: 'open',
                        interested: ['user-5', 'user-8', 'user-12'],
                        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'job-2',
                        posterId: 'user-2',
                        posterName: 'Sarah Williams',
                        posterBusiness: 'Williams Home Services',
                        title: 'Exterior Trim Paint - Colonial Home',
                        description: 'Need to repaint the exterior trim on my 2-story colonial in Ardmore.',
                        price: 1200,
                        location: 'Ardmore, PA',
                        timing: 'Next 2 weeks',
                        status: 'open',
                        interested: ['user-1', 'user-6'],
                        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'job-3',
                        posterId: 'user-3',
                        posterName: 'Robert Chen',
                        posterBusiness: 'Chen Renovations',
                        title: 'Kitchen Cabinet Refinishing',
                        description: 'Seeking painter to refinish 15 kitchen cabinets in Bryn Mawr.',
                        price: 2200,
                        location: 'Bryn Mawr, PA',
                        timing: 'Flexible - Next month',
                        status: 'open',
                        interested: ['user-4', 'user-7'],
                        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'job-4',
                        posterId: 'user-1',
                        posterName: 'Mike Thompson',
                        posterBusiness: 'Thompson Painting LLC',
                        title: 'Master Bedroom Accent Wall',
                        description: 'Need an accent wall painted - deep navy blue.',
                        price: 350,
                        location: 'King of Prussia, PA',
                        timing: 'This weekend',
                        status: 'open',
                        interested: ['user-2'],
                        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'job-5',
                        posterId: 'user-4',
                        posterName: 'David Martinez',
                        posterBusiness: 'Martinez Painting Co',
                        title: 'Full Exterior Repaint - Split Level',
                        description: 'Need full exterior repaint on 2500 sq ft split level home.',
                        price: 4500,
                        location: 'Norristown, PA',
                        timing: 'Next 3 weeks',
                        status: 'open',
                        interested: ['user-1', 'user-3', 'user-5', 'user-9'],
                        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'job-6',
                        posterId: 'user-5',
                        posterName: 'Jennifer Walsh',
                        posterBusiness: 'Walsh Interiors',
                        title: 'Living Room & Hallway - New Construction',
                        description: 'New construction home needs painting - 1800 sq ft.',
                        price: 2400,
                        location: 'Pottstown, PA',
                        timing: 'This week',
                        status: 'open',
                        interested: ['user-2', 'user-6', 'user-10'],
                        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'job-7',
                        posterId: 'user-6',
                        posterName: 'Thomas Brown',
                        posterBusiness: 'Brown Brothers Painting',
                        title: 'Deck Staining - Large Backyard Deck',
                        description: '20x30 ft pressure treated deck needs staining.',
                        price: 1100,
                        location: 'Conshohocken, PA',
                        timing: 'Next 2 weeks',
                        status: 'open',
                        interested: ['user-1'],
                        createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'job-8',
                        posterId: 'user-7',
                        posterName: 'Lisa Garcia',
                        posterBusiness: 'Garcia Home Improvements',
                        title: 'Bathroom Vanity & Trim',
                        description: 'Master bathroom needs vanity and trim painted.',
                        price: 650,
                        location: 'Haverford, PA',
                        timing: 'Flexible',
                        status: 'open',
                        interested: ['user-3', 'user-8'],
                        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'job-9',
                        posterId: 'user-8',
                        posterName: 'James Wilson',
                        posterBusiness: 'Wilson Pro Painting',
                        title: 'Commercial - Office Suite',
                        description: '2500 sq ft office suite needs professional painting.',
                        price: 3200,
                        location: 'Blue Bell, PA',
                        timing: 'Next month',
                        status: 'open',
                        interested: ['user-4', 'user-5', 'user-11'],
                        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'job-10',
                        posterId: 'user-9',
                        posterName: 'Maria Rodriguez',
                        posterBusiness: 'Rodriguez Paint & Design',
                        title: 'Basement Recreation Room',
                        description: 'Finished basement needs full paint - 1000 sq ft.',
                        price: 1600,
                        location: 'Lansdale, PA',
                        timing: 'This month',
                        status: 'open',
                        interested: ['user-6', 'user-7', 'user-12'],
                        createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'job-11',
                        posterId: 'user-10',
                        posterName: 'Kevin O\'Brien',
                        posterBusiness: 'OBrien Contracting',
                        title: 'Garage Interior - Epoxy Floor',
                        description: '2-car garage needs epoxy floor coating.',
                        price: 950,
                        location: 'Willow Grove, PA',
                        timing: 'Next 2 weeks',
                        status: 'open',
                        interested: ['user-2'],
                        createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'job-12',
                        posterId: 'user-2',
                        posterName: 'Sarah Williams',
                        posterBusiness: 'Williams Home Services',
                        title: 'Fence Painting - Privacy Fence',
                        description: '150 linear feet of wooden privacy fence needs staining.',
                        price: 800,
                        location: 'Ardmore, PA',
                        timing: 'This weekend',
                        status: 'open',
                        interested: ['user-1', 'user-3', 'user-8'],
                        createdAt: new Date(Date.now() - 34 * 60 * 60 * 1000).toISOString()
                      }
                    ];
                    localStorage.setItem('tradesource_jobs', JSON.stringify(seedJobs));
                    
                    var seedUsers = [
                      { id: 'user-1', fullName: 'Mike Thompson', businessName: 'Thompson Painting LLC', email: 'mike@thompsonpainting.com', phone: '(610) 555-0101', licenseNumber: 'PA123456', yearsExperience: 12, reviewLink: 'https://google.com/reviews/1', w9Data: null, insuranceData: null, status: 'approved', createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() },
                      { id: 'user-2', fullName: 'Sarah Williams', businessName: 'Williams Home Services', email: 'sarah@williamshome.com', phone: '(610) 555-0102', licenseNumber: 'PA234567', yearsExperience: 8, reviewLink: 'https://google.com/reviews/2', w9Data: null, insuranceData: null, status: 'approved', createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
                      { id: 'user-3', fullName: 'Robert Chen', businessName: 'Chen Renovations', email: 'robert@chenrenovations.com', phone: '(610) 555-0103', licenseNumber: 'PA345678', yearsExperience: 15, reviewLink: 'https://google.com/reviews/3', w9Data: null, insuranceData: null, status: 'approved', createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() },
                      { id: 'user-4', fullName: 'David Martinez', businessName: 'Martinez Painting Co', email: 'david@martinezpainting.com', phone: '(610) 555-0104', licenseNumber: 'PA456789', yearsExperience: 10, reviewLink: 'https://google.com/reviews/4', w9Data: null, insuranceData: null, status: 'approved', createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
                      { id: 'user-5', fullName: 'Jennifer Walsh', businessName: 'Walsh Interiors', email: 'jennifer@walshinteriors.com', phone: '(610) 555-0105', licenseNumber: 'PA567890', yearsExperience: 6, reviewLink: 'https://google.com/reviews/5', w9Data: null, insuranceData: null, status: 'approved', createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
                      { id: 'user-6', fullName: 'Thomas Brown', businessName: 'Brown Brothers Painting', email: 'thomas@brownbrothers.com', phone: '(610) 555-0106', licenseNumber: 'PA678901', yearsExperience: 20, reviewLink: 'https://google.com/reviews/6', w9Data: null, insuranceData: null, status: 'approved', createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString() },
                      { id: 'user-7', fullName: 'Lisa Garcia', businessName: 'Garcia Home Improvements', email: 'lisa@garciahome.com', phone: '(610) 555-0107', licenseNumber: 'PA789012', yearsExperience: 9, reviewLink: 'https://google.com/reviews/7', w9Data: null, insuranceData: null, status: 'approved', createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString() },
                      { id: 'user-8', fullName: 'James Wilson', businessName: 'Wilson Pro Painting', email: 'james@wilsonpro.com', phone: '(610) 555-0108', licenseNumber: 'PA890123', yearsExperience: 14, reviewLink: 'https://google.com/reviews/8', w9Data: null, insuranceData: null, status: 'approved', createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString() },
                      { id: 'user-9', fullName: 'Maria Rodriguez', businessName: 'Rodriguez Paint & Design', email: 'maria@rodriguezpaint.com', phone: '(610) 555-0109', licenseNumber: 'PA901234', yearsExperience: 7, reviewLink: 'https://google.com/reviews/9', w9Data: null, insuranceData: null, status: 'approved', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
                      { id: 'user-10', fullName: 'Kevin O\'Brien', businessName: 'OBrien Contracting', email: 'kevin@obriencontracting.com', phone: '(610) 555-0110', licenseNumber: 'PA012345', yearsExperience: 11, reviewLink: 'https://google.com/reviews/10', w9Data: null, insuranceData: null, status: 'approved', createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() },
                      { id: 'user-11', fullName: 'Amanda Foster', businessName: 'Foster Finishes', email: 'amanda@fosterfinishes.com', phone: '(610) 555-0111', licenseNumber: 'PA112233', yearsExperience: 5, reviewLink: 'https://google.com/reviews/11', w9Data: null, insuranceData: null, status: 'approved', createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
                      { id: 'user-12', fullName: 'Christopher Lee', businessName: 'Lee Custom Painting', email: 'chris@leecustom.com', phone: '(610) 555-0112', licenseNumber: 'PA223344', yearsExperience: 16, reviewLink: 'https://google.com/reviews/12', w9Data: null, insuranceData: null, status: 'approved', createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString() }
                    ];
                    localStorage.setItem('tradesource_users', JSON.stringify(seedUsers));
                  }
                }
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  )
}
