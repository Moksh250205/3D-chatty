import React, { createContext, useEffect, useState } from 'react'

export const userDataContext = createContext()

const userContext = ({children}) =>  {

  const storedUser = localStorage.getItem('user');
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);


  return (
    <div>
        <userDataContext.Provider value={{user, setUser}}>
            {children}
        </userDataContext.Provider>
    </div>
  )
}

export default userContext