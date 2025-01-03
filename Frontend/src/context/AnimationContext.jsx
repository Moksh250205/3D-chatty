import React, { createContext, useState, useEffect } from 'react'

export const AnimationContext = createContext();

const AnimationProvider = ({ children }) => {
  const [animation, setAnimation] = useState({ name: 'Walking', timeOut: 100000 });

  useEffect(() => {
    console.log("Current Animation:", animation);

    if (animation.name !== "Idle") {
      const timer = setTimeout(() => {
        setAnimation({ name: "Idle", timeOut: 10 }); 
      }, animation.timeOut * 1000);

      return () => clearTimeout(timer); 
    }
  }, [animation]);
  


  return (
    <AnimationContext.Provider value={[animation, setAnimation]}>{children}</AnimationContext.Provider >
  )
}

export default AnimationProvider