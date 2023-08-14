import React, { useState } from 'react';
import { errorMessage } from '@/utils/functions';

const AuthChatModal = () => {
    const [accessCode, setAccesCode] = useState("");

    const authenticateCode = () => {
        if (accessCode === chatCode) {
            setAuthModatl(false);
        } else {
            errorMessage("Access denied")
        }
    }

  return (
    <div className='w-full h-[100vh] dim absolute top-0 left-0 flex items-center justify-center p-4 z-40'>
        <form
            className='md:w-[500px] w-full bg-white h-[300px] flex items-center justify-center flex-col rounded-md shadow-blue-200 shadow-md space-y-4 relative px-6'
            onSubmit={authenticateCode}
        >
            <h2 className="text-xl font-bold text-center">
                Enter your access code
            </h2>

            <input 
                type="text" 
                className="px-4 py-2 w-full border-[1px] rounded"
                required
                value={accessCode}
                onChange={(e) => setAccesCode(e.target.value)}
            />

            <button className='px-4 py-2 rounded-md shadow-md bg-green-500 hover:bg-blue-500 text-white'>
                Grant Access
            </button>
        </form>
    </div>
  )
}

export default AuthChatModal