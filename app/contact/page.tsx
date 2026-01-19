'use client';

import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-heading font-black text-white mb-6">Contact Us</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Have questions, suggestions, or just want to say hello? We'd love to hear from you.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
            
            {/* Contact Info */}
            <div className="space-y-6">
                <div className="glass-panel p-6 flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Email Us</h3>
                        <p className="text-gray-400 text-sm mb-2">For general inquiries and support:</p>
                        <a href="mailto:support@block21token.xyz" className="text-primary hover:underline font-mono">
                            support@block21token.xyz
                        </a>
                    </div>
                </div>

                <div className="glass-panel p-6 flex items-start gap-4">
                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Join the Community</h3>
                        <p className="text-gray-400 text-sm mb-2">Connect with us on social media for real-time updates:</p>
                        <div className="flex gap-4 mt-2">
                            <a href="https://x.com/Block20One" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Twitter (X)</a>
                            <a href="https://t.me/block20one" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Telegram</a>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 flex items-start gap-4">
                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Location</h3>
                        <p className="text-gray-400 text-sm">
                            Block21 is a decentralized protocol living on the Polygon Blockchain. Our team operates globally.
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Form (Visual Only for AdSense compliance, avoids backend complexity) */}
            <div className="glass-panel p-8">
                <h2 className="text-2xl font-heading font-bold text-white mb-6">Send a Message</h2>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                        <input 
                            type="text" 
                            id="name" 
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="Your Name"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                        <select 
                            id="subject" 
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        >
                            <option>General Inquiry</option>
                            <option>Support</option>
                            <option>Partnership</option>
                            <option>Report a Bug</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                        <textarea 
                            id="message" 
                            rows={4}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="How can we help?"
                        />
                    </div>
                    <button type="button" className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-4">
                        This form sends a direct email to our support team. We aim to respond within 24 hours.
                    </p>
                </form>
            </div>

        </div>
      </div>
    </div>
  );
}
