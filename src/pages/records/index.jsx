import { useState } from "react";
import RecordHeader from "./components/RecordHeader";
import RecordDetail from "./components/RecordDetail";
import RecordList from "./components/RecordList";

const Record = () => {
     

    return (
        <div className="">
            {/* <RecordHeader onCategoryChange={handleCategoryChange} onDateFilter={handleDateFilter} /> */}
            {/* <RecordDetail type = {type} /> */}
            <RecordList />
        </div>

    );
}
export default Record;