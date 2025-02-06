//reuseable button component for task page

const TaskButton = ({onClick,handleCancel,showModal,name,handleSubmit,loading}) => {
  const handleClick = (elementID,e) => {
    //checking if the function is passed as a prop
    if(handleCancel){
      console.log("hide Modal");
      handleCancel();
    }
    if(onClick){
      console.log("onClick");
      onClick(elementID);
    }
    if(showModal){
      console.log("show Modal")
      showModal();
    } 
    if(handleSubmit){
      console.log("handleSubmit");
      handleSubmit(e);
    }
    
  }

  return (
    <button className={`font-semibold rounded-md p-2 w-26 lg:h-14 lg:w-26 ${name === "Cancel" ? "bg-white text-red-400 border border-red-300" : "bg-primaryLight text-white" }`} onClick={(e) => handleClick(e.currentTarget.id,e)} id = {name} >
      {name ? name : 'Button'}
    </button>
  );
}

export default TaskButton;
