import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className='w-full h-[10vh] md:px-8 px-4 py-5 border-b-[1px] border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10'>
        <Link href='/'>
            <h2 className="font-bold text-xl">DevSupports</h2>
        </Link>

        <div className="flex items-center space-5">
            <Link href='/staff/login' className='md:text-md bg-[#314484] text-gray-50 md:p-3 p-2 text-sm rounded'>
                    Staff Sign in
            </Link>
        </div>
    </nav>

  )
}

export default Navbar;