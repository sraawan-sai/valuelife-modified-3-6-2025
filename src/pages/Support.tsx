import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, FileText, Search, ChevronDown, ChevronUp, Send } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const Support: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // FAQ data
  const faqs: FaqItem[] = [
    {
      id: 1,
      question: 'How do I earn commissions?',
      answer: 'You earn commissions through direct sales of our products and when your referred members purchase products. We offer multiple levels of commissions, including retail profit, direct referral bonus, team matching bonus, and royalty income.'
    },
    {
      id: 2,
      question: 'How and when do I get paid?',
      answer: 'Commissions are calculated daily and are available for withdrawal once they reach the minimum threshold of $50. Payments are processed within 24-48 hours after withdrawal request and deposited directly to your registered payment method.'
    },
    {
      id: 3,
      question: 'How do I refer new members?',
      answer: 'You can refer new members by sharing your unique referral link or code. Go to the Referral Tools section to find your link and marketing materials you can share with potential members.'
    },
    {
      id: 4,
      question: 'What products can I promote?',
      answer: 'You can promote our range of health and wellness products including PH Alkaline Water Filters and Bio Magnetic Mattress Beds. Visit the Products section to see all available products and their commission rates.'
    },
    {
      id: 5,
      question: 'How do I complete KYC verification?',
      answer: 'To complete KYC verification, go to the KYC Verification section, upload the required documents (government ID, proof of address, and bank details), and submit for review. Verification typically takes 1-2 business days.'
    },
    {
      id: 6,
      question: 'What are the requirements for rewards and incentives?',
      answer: 'Our rewards program includes various incentives based on your performance, from insurance benefits to international trips and luxury items. Each reward has specific requirements based on sales volume and team structure. Check the detailed compensation plan for specific requirements.'
    },
  ];
  
  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };
  
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Help & Support</h1>
        <p className="text-neutral-600">Find answers to common questions or contact our support team</p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center p-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full text-primary-600">
              <Mail className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Email Support</h3>
          <p className="text-neutral-600 mb-4">Get help via email within 24 hours</p>
          <a href="mailto:support@valuelife.in" className="text-primary-600 font-medium">
            support@valuelife.in
          </a>
        </Card>
        
        <Card className="text-center p-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full text-primary-600">
              <Phone className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
          <p className="text-neutral-600 mb-4">Available Mon-Fri, 9AM-6PM</p>
          <a href="tel:+911234567890" className="text-primary-600 font-medium">
            +91 1234 567 890
          </a>
        </Card>
        
        <Card className="text-center p-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full text-primary-600">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
          <p className="text-neutral-600 mb-4">Chat with our support team</p>
          <Button variant="outline">
            Start Chat
          </Button>
        </Card>
      </div>

      {/* FAQs */}
      <Card className="mb-8">
        <div className="flex items-center mb-6">
          <FileText className="h-5 w-5 text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
            <Input 
              placeholder="Search FAQs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(faq => (
              <div 
                key={faq.id} 
                className="border border-neutral-200 rounded-lg overflow-hidden"
              >
                <button 
                  className="w-full flex justify-between items-center p-4 text-left bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span className="font-medium text-neutral-900">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronUp className="h-5 w-5 text-neutral-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-neutral-500" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="p-4 bg-white">
                    <p className="text-neutral-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500">No FAQs found matching your search. Try different keywords.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Contact Form */}
      <Card>
        <div className="flex items-center mb-6">
          <Mail className="h-5 w-5 text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold">Contact Us</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input 
            label="Full Name" 
            placeholder="Enter your full name"
            required
          />
          
          <Input 
            label="Email" 
            type="email"
            placeholder="Enter your email address"
            required
          />
        </div>
        
        <div className="mb-4">
          <Input 
            label="Subject" 
            placeholder="What is your inquiry about?"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Message
          </label>
          <textarea 
            rows={5}
            className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Describe your issue or question in detail"
            required
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="primary" 
            leftIcon={<Send className="h-4 w-4" />}
          >
            Send Message
          </Button>
        </div>
      </Card>
    </MainLayout>
  );
};

export default Support; 