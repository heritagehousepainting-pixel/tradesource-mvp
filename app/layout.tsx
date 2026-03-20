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
                        id: 'demo-job-1',
                        posterId: 'demo-user-1',
                        posterName: 'Mike Thompson',
                        posterBusiness: 'Thompson Painting LLC',
                        title: 'Interior Painting - 3 Bedroom Ranch',
                        description: 'Looking for an experienced painter to paint the interior of our 3 bedroom ranch home in King of Prussia. Walls are in good condition, just needs fresh paint. Owner will move furniture. Prefer white or off-white finish.',
                        price: 1800,
                        location: 'King of Prussia, PA',
                        timing: 'This week - Flexible',
                        status: 'open',
                        interested: ['demo-user-2', 'demo-user-3'],
                        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'demo-job-2',
                        posterId: 'demo-user-2',
                        posterName: 'Sarah Williams',
                        posterBusiness: 'Williams Home Services',
                        title: 'Exterior Trim Paint - Colonial Home',
                        description: 'Need to repaint the exterior trim on my 2-story colonial in Ardmore. Approximately 200 linear feet of trim, plus fascia boards. Wood is in good shape, just peeling paint. Would like it done in white.',
                        price: 1200,
                        location: 'Ardmore, PA',
                        timing: 'Next 2 weeks',
                        status: 'open',
                        interested: ['demo-user-1'],
                        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'demo-job-3',
                        posterId: 'demo-user-3',
                        posterName: 'Robert Chen',
                        posterBusiness: 'Chen Renovations',
                        title: 'Kitchen Cabinet Refinishing',
                        description: 'Seeking painter to refinish 15 upper and lower kitchen cabinets in a Bryn Mawr home. Current finish is dark stain, want to go to a light gray. Will need to sand, prime, and paint. Quality work required.',
                        price: 2200,
                        location: 'Bryn Mawr, PA',
                        timing: 'Flexible - Next month',
                        status: 'open',
                        interested: [],
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                      },
                      {
                        id: 'demo-job-4',
                        posterId: 'demo-user-1',
                        posterName: 'Mike Thompson',
                        posterBusiness: 'Thompson Painting LLC',
                        title: 'Master Bedroom Accent Wall',
                        description: 'Need an accent wall painted in master bedroom. Approximately 14ft wide by 9ft tall. Want a deep navy blue color. Wall has one window and a door. Quick job, half day work.',
                        price: 350,
                        location: 'King of Prussia, PA',
                        timing: 'This weekend',
                        status: 'open',
                        interested: ['demo-user-2'],
                        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
                      }
                    ];
                    localStorage.setItem('tradesource_jobs', JSON.stringify(seedJobs));
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
