//reuseable component to display task details in a modal used in the task table

const TaskDetailsModal = ({item}) => {
    
  return (
    <tr className='bg-white shadow-light grid col-span-full w-4/5 border  rounded-br-xl rounded-bl-xl rounded-tr-xl mx-auto p-4 lg:flex lg:justify-between lg:items-center'>
      <td className='text-primaryDark w-full     text-sm flex flex-col lg:flex-row lg:justify-evenly lg:items-center'>
        <li>Name : <strong>{item.task_name}</strong></li>
        <li>Title : <strong>{item.description}</strong></li>
        <li>Active : <strong>{item.status}</strong></li>
      </td>
      
    </tr>
  );
}

export default TaskDetailsModal;
