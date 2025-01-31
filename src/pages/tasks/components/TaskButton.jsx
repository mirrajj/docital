//reuseable button component for task page

const TaskButton = ({onClick,handleCancel,showModal,name,loading}) => {
  const handleClick = (e) => {
    //checking if the function is passed as a prop
    if(handleCancel){
      console.log("hide Modal");
      handleCancel();
    }
    if(onClick){
      console.log("onClick");
      onClick(e);
    }
    if(showModal){
      console.log("show Modal")
      showModal();
    }
  }

  return (
    <button className={`font-semibold rounded-md p-2 w-26 lg:h-14 lg:w-26 ${name === "Cancel" ? "bg-white text-red-400 border border-red-300" : "bg-primaryLight text-white" }`} onClick={(e) => handleClick(e)} id = {name} type = {name === "Cancel" ? "button" : "submit"} >
      {name ? name : 'Button'}
    </button>
  );
}

export default TaskButton;
