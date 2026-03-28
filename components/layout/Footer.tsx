import { LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-[#fafafa] py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-6">
          <div className="flex items-center gap-2 font-bold text-gray-950 text-lg">
            <div className="size-6 rounded-md bg-primary text-white flex items-center justify-center">
              <LayoutDashboard className="size-3" />
            </div>
            SchoolOS
          </div>
          <p>&copy; {new Date().getFullYear()} SchoolOS. All rights reserved.</p>
          <div className="flex gap-6 font-medium">
            <Link href="#" className="hover:text-gray-950 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gray-950 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-gray-950 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
  )
}

export default Footer