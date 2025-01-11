import { createContext,useEffect } from 'react';

export const DataContext = createContext(null);

export const DataProvider = ({children}) => {

    let formModal = null;

    useEffect(() => {
        formModal = document.querySelector(".backdrop");
    },[]);


    const showModal = () => {
        formModal.classList.remove("hidden");
        // console.log("formModal"
        // document.body.classList.add("no-clicks")
      };
      
      const hideModal = () => {
        formModal.classList.add("hidden");
        // console.log("hideModal");
        // document.body.classList.remove("no-clicks");
      };

  return (
    <DataContext.Provider value = {{ showModal,hideModal}} >
      {children}
    </DataContext.Provider>
  );
}



