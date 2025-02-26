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

const TaskSwitch = ({ checked, updateTaskStatus, itemID,setShowSucess,setShowError }) => {
  const [isChecked,setIsChecked] = useState(null);

  useEffect(() => {
    setIsChecked(checked);
  }, []);

  const onChange = () => {
    const newCheckedState = !checked;
    setIsChecked(newCheckedState);
    updateTaskStatus(itemID, newCheckedState, setShowSucess, setShowError);
  };


  return (
    <StyledSwitch color="primary" onChange={(e) => onChange(e)} size="small" checked={isChecked} />
  );
}

export default TaskSwitch;
