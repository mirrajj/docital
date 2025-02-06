//reuseable component to display task details in a modal used in the task table

const TaskDetailsModal = ({item}) => {
    
  return (
   
    <tr className='bg-white shadow-md grid col-span-full w-fit border relative left-2/4 rounded-xl p-4 mt-2'>
    <td className="size-6 rotate-45 bg-white -mt-7 rounded-sm border-l border-t left-1/2 relative">

    </td>
      <td className='text-primaryDark w-full text-xs flex flex-col gap-2 list-none'>
        <li>Name : <strong>{item.task_name}</strong></li>
        <li>Title : <strong>{item.description}</strong></li>
        <li>Completion Window : <strong>{item.completion_window}</strong></li>
        <li>Frequency : <strong>{item.frequency}</strong></li>
        <li>Last Paused : <strong>{item.paused_at}</strong></li>
      </td>
      
    </tr>
    
  );
}

export default TaskDetailsModal;
