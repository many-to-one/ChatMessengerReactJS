import React from 'react'

const QuestionFriend = ({ message, isOpen, onConfirm, onCancel }) => {
  return isOpen ? (
    <div>
       <div className="conf_dialog">
         <button onClick={onCancel}>Cancel</button>
         <p>{ message }</p>
          <button onClick={onConfirm}>Add</button>
       </div>
     </div>
  ) 
  :
  null
}

export default QuestionFriend
