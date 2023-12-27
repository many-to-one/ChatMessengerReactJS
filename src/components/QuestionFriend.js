import React from 'react'
import { TiTickOutline, TiTimesOutline } from "react-icons/ti";

const QuestionFriend = ({ message, isOpen, onConfirm, onCancel }) => {
  return isOpen ? (
    <div>
       <div className="conf_dialog">

         <p>{ message }</p>

          <TiTickOutline 
           size={30}
           onClick={onConfirm}
           color='#77037B'
          />

          <TiTimesOutline 
           size={30}
           onClick={onCancel}
           color='#77037B'
          />

       </div>
     </div>
  ) 
  :
  null
}

export default QuestionFriend
