import { BookMarkedIcon, Mail, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200/50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-gray-950 text-lg">
              <div className="size-6 rounded-lg bg-primary text-white flex items-center justify-center">
                <BookMarkedIcon className="size-3" />
              </div>
              MaLibrary
            </div>
            <p className="text-xs text-gray-500">Modern library management system</p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-950">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-gray-600 hover:text-primary transition-colors">About</Link>
              <Link href="/contact-us" className="text-sm text-gray-600 hover:text-primary transition-colors">Contact</Link>
              <Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">Home</Link>
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-950">Connect</h3>
            <div className="flex gap-3">
              <Link href="#" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-all">
                <MessageCircle size={16} />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-all">
                <MessageCircle size={16} />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-all">
                <Mail size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} MaLibrary. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-gray-950 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gray-950 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-gray-950 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer