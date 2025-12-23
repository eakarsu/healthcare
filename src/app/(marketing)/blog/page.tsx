import Link from 'next/link'
import { ArrowRight, Calendar, Clock, User } from 'lucide-react'

const posts = [
  {
    slug: 'maximizing-mips-score-2025',
    title: 'Maximizing Your MIPS Score in 2025: A Complete Guide',
    excerpt: 'Learn the latest strategies to optimize your Merit-based Incentive Payment System performance and avoid penalties while maximizing bonuses.',
    category: 'Quality',
    author: 'Dr. Erol Akarsu',
    date: 'December 20, 2024',
    readTime: '8 min read',
    featured: true,
  },
  {
    slug: 'ai-transforming-clinical-documentation',
    title: 'How AI is Transforming Clinical Documentation',
    excerpt: 'Discover how artificial intelligence is revolutionizing the way healthcare providers create and manage clinical notes, saving hours of administrative time.',
    category: 'Technology',
    author: 'Dr. Erol Akarsu',
    date: 'December 15, 2024',
    readTime: '6 min read',
    featured: true,
  },
  {
    slug: 'reducing-claim-denials',
    title: 'Reducing Claim Denials: A Practical Guide for Medical Practices',
    excerpt: 'Claim denials cost practices thousands annually. Learn proven strategies to reduce denials and improve your revenue cycle management.',
    category: 'Billing',
    author: 'Dr. Erol Akarsu',
    date: 'December 10, 2024',
    readTime: '7 min read',
    featured: true,
  },
  {
    slug: 'hipaa-compliance-checklist-2025',
    title: 'HIPAA Compliance Checklist for 2025',
    excerpt: 'Stay compliant with the latest HIPAA regulations. Our comprehensive checklist covers everything from risk assessments to employee training.',
    category: 'Compliance',
    author: 'Dr. Erol Akarsu',
    date: 'December 5, 2024',
    readTime: '10 min read',
    featured: false,
  },
  {
    slug: 'patient-engagement-strategies',
    title: '5 Patient Engagement Strategies That Actually Work',
    excerpt: 'Improve patient outcomes and satisfaction with these proven engagement strategies that modern practices are using successfully.',
    category: 'Patient Care',
    author: 'Dr. Erol Akarsu',
    date: 'November 28, 2024',
    readTime: '5 min read',
    featured: false,
  },
  {
    slug: 'telehealth-best-practices',
    title: 'Telehealth Best Practices: Lessons Learned in 2024',
    excerpt: 'Telehealth is here to stay. Learn how to optimize your virtual care delivery for better patient experiences and clinical outcomes.',
    category: 'Technology',
    author: 'Dr. Erol Akarsu',
    date: 'November 20, 2024',
    readTime: '6 min read',
    featured: false,
  },
  {
    slug: 'ehr-implementation-guide',
    title: 'EHR Implementation: Avoiding Common Pitfalls',
    excerpt: 'Switching EHR systems? Learn from others\' mistakes and ensure a smooth transition with our comprehensive implementation guide.',
    category: 'Technology',
    author: 'Dr. Erol Akarsu',
    date: 'November 15, 2024',
    readTime: '9 min read',
    featured: false,
  },
  {
    slug: 'preventing-physician-burnout',
    title: 'Preventing Physician Burnout: Technology Solutions That Help',
    excerpt: 'Burnout affects over 60% of physicians. Discover how the right technology can reduce administrative burden and restore joy in practice.',
    category: 'Wellness',
    author: 'Dr. Erol Akarsu',
    date: 'November 10, 2024',
    readTime: '7 min read',
    featured: false,
  },
]

const categories = ['All', 'Technology', 'Billing', 'Quality', 'Compliance', 'Patient Care', 'Wellness']

export default function BlogPage() {
  const featuredPosts = posts.filter(post => post.featured)
  const recentPosts = posts.filter(post => !post.featured)

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              PracticeFlux Blog
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Insights, guides, and best practices for modern healthcare practice management
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === 'All'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-teal-100 hover:text-teal-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Articles</h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-teal-400 to-cyan-500" />
                <div className="p-6">
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                    {post.category}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-gray-600 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Articles</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex gap-6 bg-white rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                    {post.category}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-teal-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Stay Updated
            </h2>
            <p className="mt-4 text-lg text-teal-100">
              Get the latest healthcare practice management insights delivered to your inbox.
            </p>
            <form className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 rounded-lg text-gray-900 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
              >
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
