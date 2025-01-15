import { useState } from "react";
import RecordHeader from "./components/RecordHeader";
import RecordDetail from "./components/RecordDetail";
import RecordList from "./components/RecordList";

const Record = () => {
    const [recordType,setRecordType] = useState("cleaning");
    const recordData = [
        {id : 1, type : "drying" , content : "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Saepe, accusamus?" },
        {id : 2, type : "rawMaterial" , content : "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Saepe, accusamus?" },
        {id : 3, type : "finished-product-inspection" , content : "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Saepe, accusamus?" },
        {id : 4, type : "cleaning" , content : "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Saepe, accusamus?" },
        {id : 5, type : "waste" , content : "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Saepe, accusamus?" },
    ]
    const type = [null || recordData.find((item) => item.type === recordType ? item : null)];

    return (
        <div>
            <RecordHeader setRecordType = {setRecordType} recordData = {recordData} />
            <RecordDetail type = {type} />
            <RecordList recordType={recordType} />
        </div>

    );
}
export default Record;