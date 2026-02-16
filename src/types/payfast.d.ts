declare global {
  interface Window {
    payfast_do_onsite_payment?: (options: {
      uuid: string;
      callback?: (result: boolean | string) => void;
      before_on_continue?: () => void;
      before_close?: () => void;
    }) => void;
    payfast_do_onsite?: (options: {
      uuid: string;
      callback?: (result: boolean | string) => void;
      before_on_continue?: () => void;
      before_close?: () => void;
    }) => void;
  }
}

export {};
