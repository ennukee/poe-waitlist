import React, { MouseEventHandler, useState } from 'react'
import './Prompt.css';
import { Prompt as PromptType } from 'src/types';

interface Props {
  isSelected: boolean;
  canBeDeleted: boolean;
  index: number;
  dispatch: Function;
  value: PromptType;
  onClick: any;
}

export default function Prompt({
  isSelected,
  canBeDeleted,
  index,
  dispatch,
  value,
  onClick,
}: Props) {
  const [shortNameInput, setShortNameInput] = useState<string>(value.short);
  const [fullNameInput, setFullNameInput] = useState<string>(value.full);
  const [editMode, setEditMode] = useState<boolean>(false);

  const handleDeletePrompt = () => {
    // TODO, using index prop
    dispatch({
      type: 'remove',
      index,
    })
  }

  const handleEditClick = () => {
    setEditMode(true);
  }

  const handleShortNameChange = (event: any) => {
    setShortNameInput(event.target.value)
  }

  const handleFullNameChange = (event: any) => {
    setFullNameInput(event.target.value)
  }

  const handleSaveClick = () => {
    dispatch({
      type: 'modify',
      index,
      payload: {
        short: shortNameInput,
        full: fullNameInput
      }
    })
    setEditMode(false);
  }

  return editMode ? (
    <div className="prompt-item edit-mode">
      <div id="inputs" className="individual">
        <div className="input-group short">
          <label htmlFor="prompt-short-input">Shorthand</label>
          <input
            className="input"
            id="prompt-short-input"
            value={shortNameInput}
            onChange={handleShortNameChange}
            placeholder="Short way to describe it"
          />
        </div>
        <div className="input-group long">
          <label htmlFor="prompt-long-input">Full message</label>
          <input
            className="input"
            id="prompt-long-input"
            value={fullNameInput}
            onChange={handleFullNameChange}
            placeholder="Message to be used in the whisper message"
          />
        </div>
        <div className="trigger-save"><span onClick={handleSaveClick}>Save</span></div>
      </div>
    </div>
  ) : (
    <div className={`prompt-item view-mode ${isSelected && 'selected'}`} onClick={() => onClick(index)}>
      {canBeDeleted && <div className="delete" onClick={handleDeletePrompt}>x</div>}
      <div className="prompt-data">
        <div className="prompt-short-name">{value.short}</div>
        <div className={`prompt-full-name ${!value.full && 'default'}`}>{value.full ? value.full : '(blank prompt)'}</div>
      </div>
      <div className="trigger-edit"><span onClick={handleEditClick}>Edit</span></div>
    </div>
  )
}
