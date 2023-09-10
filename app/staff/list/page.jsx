'use client'
import React, {useState, useEffect, useCallback } from 'react';
import SideNav from '@/app/components/SideNav';
import Navbar from '@/app/components/Navbar';
import { AiFillCheckCircle } from 'react-icons/ai';
import { addUser, deleteUser, getUsers } from '@/utils/functions';
import { account } from '@/utils/appwrite';
import Loading from '@/app/loading';
import { useRouter } from 'next/navigation';


const List = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] =useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({});
  const router = useRouter();

  const authStatus = useCallback(async () => {
		try {
			const user = await account.get();
			setUser(user);
			setLoading(false);
			getUsers(setUsers);
		} catch (err) {
			// router.push("/");
		}
	}, []);


  useEffect(() => {
		authStatus();
	}, [authStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(password === confirmPassword) {
      addUser(name, email, password);
    }
    // addUser(name)
  };

  // if (loading) return <Loading />

  return (
    <>
      <Navbar />
      <div className="w-full flex items-center">
        <div className="md:w-[20%] md:block hidden">
          <SideNav />
        </div>

        <div className="md:w-[80%] w-full min-h-[90vh] py-10 px-4">
            <h2 className='text-2xl font-bold mb-6'>Add new staff</h2>
            
            <form className='w-full flex flex-col mb-[50px]' onSubmit={handleSubmit}>
              <div className="w-full flex justify-between space-x-4">

                <div className="w-1/2">
                  <label htmlFor="name">Name</label>
                  <input 
                    type="text" 
                    name='name'
                    className='w-full border-[1px] border-gray-200 px-4 py-2 rounded mb-4'
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="w-1/2">
                  <label htmlFor="name">Email</label>
                  <input 
                    type="email" 
                    name='email'
                    className='w-full border-[1px] border-gray-200 px-4 py-2 rounded mb-4'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full flex justify-between space-x-4">
                <div className="w-1/2 relative flex flex-col">
                  <label htmlFor="">Password</label>
                  <input 
                    type="password" 
                    name='password'
                    id='password'
                    className='w-full border-[1px] border-gray-200 px-4 py-2 rounded mb-4'
                    required
                    minLength={8}
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                  />
                  {password === confirmPassword && confirmPassword !== '' && (
                    <AiFillCheckCircle className='absolute right-4 top-9 text-green-500 text-xl' />
                  )}
                </div>

                <div className="w-1/2 relative flex flex-col">
                  <label htmlFor="">Confirm Password</label>
                  <input 
                    type="password" 
                    name='confirmPassword'
                    id='confirmPassword'
                    className='w-full border-[1px] border-gray-200 px-4 py-2 rounded mb-4'
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                  />
                  {password === confirmPassword && confirmPassword !== '' && (
                    <AiFillCheckCircle className='absolute right-4 top-9 text-green-500 text-xl' />
                  )}
                </div>
              </div>

              {password !== confirmPassword && (
                <p className='text-red-500 mb-2'>Password does not match</p>
              )}
              <button className='p-3 bg-[#314484] rounded text-[#F4F8FB] w-[200px] hover:bg-[#2267D3]'>
                Add User
              </button>
            </form>

            {/* Table */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      <tr key={user.$id}>
                        <td>{user?.name}</td>
                        <td>{user?.email}</td>
                        <td>
                          <button 
                            className='border-[1px] rounded py-2 px-4 hover:bg-red-500 hover:text-gray-100'
                            onClick={() => deleteUser(user.$id)}
                            >
                              Remove
                          </button>
                        </td>
                      </tr>
                    })}
                  </tbody>
                </table>
              </h2>
            </div>
        </div>
      </div>
    </>
  )
}

export default List;