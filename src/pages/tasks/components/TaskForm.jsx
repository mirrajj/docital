import TaskButton from './TaskButton';

const TaskForm = ({btnType,handleCancel}) => {

    return (
        <div className={`${btnType === "Create New" ? "container mx-auto  px-4 py-10  bg-gradient-to-b from-primaryFaint from-5% via-white m-2" :
            " container lg:max-w-3xl lg:w-8/12  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-10 bg-white rounded-2xl shadow-darker   z-20 bg-gradient-to-b from-primaryFaint from-5% via-white"} `}>
            {/* {${btnType === "Create Task"}} */}
            <div className='text-primaryDark mb-6 '>
                <h3 className='font-bold'>Create and Manage Tasks</h3>
                <h4 className='tracking-wider'>All * Inputs Are Required</h4>
            </div>
            <hr className="bg-primaryDark" />
            <form className='text-sm text-primaryDark lg:flex lg:flex-wrap lg:justify-between ' onSubmit={(e) => e.preventDefault()}>
                <div className='lg:basis-1/2'>

                    <div className=' form-group lg:grow'>
                        <label htmlFor="title" >Title *</label>
                        <input type="text" id="title" name="title" className='border w-2/3' required />
                    </div>
                    <div className=' form-group lg:grow'>
                        <label htmlFor="department">Department *</label>
                        <input type="text" id="department" name="department" className='border w-2/3' required />
                    </div>
                    <div className=' form-group lg:grow'>
                        <label htmlFor="assignee">Assignee</label>
                        <input type="text" id="assignee" name="assignee" className='border w-2/3' required />
                    </div>
                </div>
                <div className='lg:basis-1/2'>
                    <div className=' form-group lg:grow'>
                        <label htmlFor="completed">Completed</label>
                        <input type="text" id="completed" name="completed" className='border w-2/3' />
                    </div>
                    <div className=' form-group lg:grow'>
                        <label htmlFor="one-time">One Time</label>
                        <input type="checkbox" id="one-time" name="one-time" />
                    </div>
                    <div className='form-group lg:grow'>
                        <label htmlFor="one-time">Attach Instruction</label>
                        <input type="file" />
                    </div>
                </div>
                <div className="justify-self-end flex gap-2 lg:grow lg:flex lg:justify-end lg:gap-2">
                    {/* buttons for task cancel and submit or create */}
                    <TaskButton name='Create Task'/>
                    <TaskButton name='Cancel' handleCancel={handleCancel} />
                </div>
            </form>
        </div>
    );
}
export default TaskForm;