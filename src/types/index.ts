export interface ListAction<T> {
  type: string;
  index?: number;
  payload?: T
  loadedData?: any,
}

export interface Prompt {
  short: string;
  full: string;
}

export interface User {
  name: string;
  prompt?: Prompt;
}