//reuseable button component for task page

const TaskButton = ({onClick,handleCancel,showModal,name}) => {
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
    <button className={`bg-primaryLighter text-white  font-semibold rounded-md p-2 w-26 lg:h-14 lg:w-26`} onClick={(e) => handleClick(e)} id = {name}>
      {name ? name : 'Button'}
    </button>
  );
}

export default TaskButton;
