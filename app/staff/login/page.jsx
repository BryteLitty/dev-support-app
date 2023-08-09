'use client'
import React, {useState} from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';


const page = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const hanleLogin = (e) => {
        e.preventDefault();
        
    }

  return (
    <div>
        <main className='w-full h-[100vh] flex flex-col items-center justify-center py-6 px-4'>
            <h2 className="text-3xl font-bold mb-6">Admin Sign in</h2>
            <form onSubmit={hanleLogin} className="flex flex-col md:w-[60%] w-full">
                <label htmlFor="email">Email</label>
                <input 
                    type="text" 
                    id='email'
                    name='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='py-2 px-4 border-[1px] rounded border-gray-200 mb-4'
                />

                <label htmlFor="password">Password</label>
                <input
                    type='password'
                    id='password'
                    name='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='py-2 px-4 border-[1px] rounded border-gray-200 mb-4'
                />

                <button className='p-3 bg-[#314484] rounded text-[#F4F8FB] w-[200px] hover:bg-[#2267D3]'>
                    Sign in
                </button>
            </form>
            <p className='mt-10 text-sm text-gray-400 text-center'>
                &copy; Copyright {new Date().getFullYear()} DevSupport
            </p>
        </main>
    </div>
  )
}

export default page;