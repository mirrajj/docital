import React,{ useEffect,useState,useRef } from 'react';

const useSelectElements = () => {
    const ref = useRef(null)
    const [allElements,setAllElements] = useState([]);

    useEffect(() => {
        if(ref.current){
            const elements = Array.from(ref.current.querySelectorAll('*')).filter(el => el.id);
            // console.log(elements);
            setAllElements(elements);
        }
    },[])

  return { ref,allElements }
}

export default useSelectElements;
