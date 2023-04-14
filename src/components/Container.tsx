import React, { useState, useEffect, useReducer, useCallback } from 'react'
import { Prompt, ListAction, User } from 'src/types';
import { Prompt as PromptComponent } from 'src/components';

import './Container.css';

const initialUsers: User[] = [];
const userReducer = (state: User[], action: ListAction<User>): User[] => {
  function saveToBrowser(endState: User[]) {
    localStorage.setItem('userList', JSON.stringify(endState))
    return endState
  }
  switch (action.type) {
    case 'add':
      return saveToBrowser([...state, action.payload as User]);
    case 'remove':
      return saveToBrowser([...state.slice(0, action.index), ...state.slice(action.index as number + 1)]);
    case 'modify':
      return saveToBrowser([
        ...state.slice(0, action.index),
        action.payload as User,
        ...state.slice(action.index as number + 1),
      ])
    case 'load':
      return action.loadedData
    default:
      throw new Error();
  }
}

const initialPrompts: Prompt[] = [{ short: 'Blank', full: '' }];
const promptReducer = (state: Prompt[], action: ListAction<Prompt>): Prompt[] => {
  function saveToBrowser(endState: Prompt[]) {
    localStorage.setItem('promptList', JSON.stringify(endState))
    return endState
  }
  switch (action.type) {
    case 'add':
      return saveToBrowser([...state, action.payload as Prompt]);
    case 'remove':
      return saveToBrowser([...state.slice(0, action.index), ...state.slice(action.index as number + 1)]);
    case 'modify':
      return saveToBrowser([
        ...state.slice(0, action.index),
        action.payload as Prompt,
        ...state.slice(action.index as number + 1),
      ])
    case 'load':
      return action.loadedData
    default:
      throw new Error();
  }
}

// Don't use this as a good example of how to separate your code into isolated components, like this should be
export default function Container() {
  const [users, changeUsers] = useReducer(userReducer, initialUsers);
  const [prompts, changePrompts] = useReducer(promptReducer, initialPrompts);
  const [userInput, setUserInput] = useState<string>('')
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | undefined>(undefined);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number | undefined>(undefined);
  const [promptShortName, setPromptShortName] = useState<string>('');
  const [promptFullName, setPromptFullName] = useState<string>('');

  useEffect(() => {
    const savedUsers = localStorage.getItem('userList')
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers)
      if (parsed.length > 0) {
        changeUsers({
          type: 'load',
          loadedData: parsed,
        })
      }
    }

    const savedPrompts = localStorage.getItem('promptList')
    if (savedPrompts) {
      const parsed = JSON.parse(savedPrompts)
      if (parsed.length > 0) {
        changePrompts({
          type: 'load',
          loadedData: parsed,
        })
      }
    }
  })

  const handleUserInputKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      changeUsers({
        type: 'add',
        payload: {
          name: event.target.value,
        }
      })
      setUserInput('')
    }
  }

  const handleUserInputChange = (event: any) => {
    setUserInput(event.target.value)
  }

  const handleDeleteUser = (index: number) => {
    changeUsers({
      type: 'remove',
      index,
    })
  }

  const handleSelectUser = async (index: number | undefined) => {
    setSelectedUserIndex(index);

    if (index !== undefined) {
      if (users[index].name) {
        const prompt = `@${users[index].name} ${users[index].prompt?.full ?? ''}`;
        await navigator.clipboard.writeText(prompt);
      } else {
        const prompt = users[index].prompt?.full ?? '';
        await navigator.clipboard.writeText(prompt);
      }
    }
  }

  const handlePromptShortNameChange = (event: any) => {
    setPromptShortName(event.target.value);
  }

  const handlePromptFullNameChange = (event: any) => {
    setPromptFullName(event.target.value);
  }

  const handleAddPrompt = useCallback(() => {
    changePrompts({
      type: 'add',
      payload: {
        short: promptShortName,
        full: promptFullName,
      }
    })
    setPromptShortName('')
    setPromptFullName('')
  }, [promptShortName, promptFullName])

  const handlePromptClick = useCallback((index: number) => {
    if (index !== undefined && selectedUserIndex !== undefined) {
      changeUsers({
        type: 'modify',
        index: selectedUserIndex,
        payload: {
          name: users[selectedUserIndex].name,
          prompt: prompts[index],
        },
      })
    }
  }, [selectedUserIndex, users, prompts])

  useEffect(() => {
    if (selectedUserIndex !== undefined) {
      setSelectedPromptIndex(prompts.findIndex(prompt => prompt.short === users[selectedUserIndex].prompt?.short))
    } else {
      setSelectedPromptIndex(undefined)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, selectedUserIndex])

  return (
    <div className="main">
      <div className="users">
        <div className="input-group">
          <label htmlFor="user-input">Username</label>
          <input
            className="input"
            id="user-input"
            type="text"
            placeholder="Enter new user name"
            onChange={handleUserInputChange}
            onKeyDown={handleUserInputKeyDown}
            value={userInput}
          />
        </div>
        <div className="user-list">
            <div
              className={`default user-item ${selectedUserIndex === undefined && 'selected'}`}
              onClick={() => handleSelectUser(undefined)}
            >
              <div className="user-name">Empty</div>
              <div className="user-prompt">Use to unselect</div>
            </div>
          {users.map((user: User, index: number) => (
            <div
              className={`user-item ${index === selectedUserIndex && 'selected'}`}
              key={`${user.name}${index}`}
              onClick={() => handleSelectUser(index)}
            >
              <div className="delete" onClick={() => handleDeleteUser(index)}>x</div>
              <div className="user-name">{user.name}</div>
              <div className="user-prompt">{user.prompt?.short}</div>
            </div>
          ))}
        </div>
      </div>
      <div id="divider" />
      <div className="prompt-section">
        <div id="inputs">
          <div className="input-group short">
            <label htmlFor="prompt-short-input">Shorthand</label>
            <input
              className="input"
              id="prompt-short-input"
              value={promptShortName}
              onChange={handlePromptShortNameChange}
              placeholder="Short way to describe it"
            />
          </div>
          <div className="input-group long">
            <label htmlFor="prompt-long-input">Full message</label>
            <input
              className="input"
              id="prompt-long-input"
              value={promptFullName}
              onChange={handlePromptFullNameChange}
              placeholder="Message to be used in the whisper message"
            />
          </div>
          <div id="add-prompt" onClick={handleAddPrompt}>Add</div>
        </div>
        <div id="prompts">
          {prompts.map((prompt: Prompt, index: number) => (
            <PromptComponent
              isSelected={index === selectedPromptIndex}
              onClick={handlePromptClick}
              canBeDeleted={prompts.length > 1}
              index={index}
              dispatch={changePrompts}
              value={prompt}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
