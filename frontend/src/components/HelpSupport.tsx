import { useState } from 'react';
import { Search, Book, MessageCircle, Mail, Phone, FileText, HelpCircle } from 'lucide-react';

export function HelpSupport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Book size={24} />,
      color: 'bg-blue-100 text-blue-600',
      articles: [
        { title: 'How to login to the admin panel', content: 'Use your company email and password to login.' },
        { title: 'Dashboard overview', content: 'The dashboard shows key metrics and statistics.' },
        { title: 'Navigating the system', content: 'Use the sidebar to access different modules.' },
      ],
    },
    {
      id: 'employee-management',
      title: 'Employee Management',
      icon: <FileText size={24} />,
      color: 'bg-green-100 text-green-600',
      articles: [
        { title: 'Adding new employees', content: 'Go to Employee > All Employees > Add Employee button.' },
        { title: 'Managing departments', content: 'Navigate to Employee > Departments to manage departments.' },
        { title: 'Updating employee information', content: 'Click the edit icon next to any employee record.' },
      ],
    },
    {
      id: 'attendance',
      title: 'Attendance',
      icon: <FileText size={24} />,
      color: 'bg-purple-100 text-purple-600',
      articles: [
        { title: 'Marking attendance', content: 'Go to Attendance > Team Attendance and mark attendance.' },
        { title: 'Viewing attendance reports', content: 'Access reports from Attendance > Attendance Report.' },
        { title: 'Managing shifts', content: 'Configure shifts in Attendance > Shifts section.' },
      ],
    },
    {
      id: 'leave-management',
      title: 'Leave Management',
      icon: <FileText size={24} />,
      color: 'bg-yellow-100 text-yellow-600',
      articles: [
        { title: 'Applying for leave', content: 'Go to Leave Management > Leave Requests > Apply Leave.' },
        { title: 'Approving leave requests', content: 'HR and Admin can approve/reject leave requests.' },
        { title: 'Managing leave types', content: 'Configure leave types in Leave Management > Leave Types.' },
      ],
    },
    {
      id: 'payroll',
      title: 'Payroll',
      icon: <FileText size={24} />,
      color: 'bg-red-100 text-red-600',
      articles: [
        { title: 'Processing payroll', content: 'Navigate to Payroll > Payroll Processing to process salaries.' },
        { title: 'Setting up salary structure', content: 'Configure allowances and deductions in Salary Structure.' },
        { title: 'Downloading payroll reports', content: 'Use the Export button to download payroll reports.' },
      ],
    },
  ];

  const contactInfo = [
    { icon: <Mail size={20} />, label: 'Email', value: 'errorinfotech404@gmail.com', color: 'text-blue-600' },
    { icon: <Phone size={20} />, label: 'Phone', value: '+91 81287 04400', color: 'text-green-600' },
    { icon: <MessageCircle size={20} />, label: 'Live Chat', value: 'Available 24/7', color: 'text-purple-600' },
  ];

  const filteredCategories = categories.filter(cat =>
    !searchQuery ||
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.articles.some(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Help & Support</h1>
          <p className="text-gray-600 mt-1">Find answers and get support</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`${category.color} p-3 rounded-lg`}>
                {category.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800">{category.title}</h3>
            </div>
            {selectedCategory === category.id && (
              <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                {category.articles.map((article, index) => (
                  <div key={index} className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-800">{article.title}</h4>
                    <p className="text-sm text-gray-600">{article.content}</p>
                  </div>
                ))}
              </div>
            )}
            {selectedCategory !== category.id && (
              <p className="text-sm text-gray-600">{category.articles.length} articles available</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-lg">
            <HelpCircle className="text-blue-600" size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Need More Help?</h2>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? Our support team is here to help you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contactInfo.map((contact, index) => (
                <div key={index} className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={contact.color}>{contact.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{contact.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{contact.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-800 mb-1">How do I reset my password?</h3>
            <p className="text-sm text-gray-600">Contact your system administrator to reset your password.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Can I access the system from mobile?</h3>
            <p className="text-sm text-gray-600">Yes, the admin panel is fully responsive and works on mobile devices.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-1">How do I export reports?</h3>
            <p className="text-sm text-gray-600">Navigate to the Reports section and click the Download button to export reports.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Who can access the payroll section?</h3>
            <p className="text-sm text-gray-600">Only Admin and HR roles have access to the payroll section.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
