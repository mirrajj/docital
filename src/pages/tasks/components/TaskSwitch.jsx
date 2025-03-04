import { useState,useEffect } from 'react';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

const StyledSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase': {
    //   color: theme.palette.primary.main,

    '&.Mui-checked': {
      color: "#fff",
    },
    '&.Mui-checked + .MuiSwitch-track': {
      backgroundColor: "green",
    },
  },
}));

const TaskSwitch = ({ item, updateTaskStatus, itemID,setShowSucess,setShowError }) => {
  const [isChecked,setIsChecked] = useState(item.active);

  const onChange = () => {
    // const newCheckedState = !isChecked;
    // setIsChecked(newCheckedState);
    updateTaskStatus(itemID, !isChecked, setShowSucess, setShowError);
  };

  



  return (
    <StyledSwitch color="primary" onChange={(e) => onChange(e)} size="small" checked={item.active} />
  );
}

export default TaskSwitch;
