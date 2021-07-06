export interface PopConfirmationDialogDataInterface {
  display?: string;
  body: string;
  option?: object;
  align?: 'left' | 'center' | 'right';
}

export interface PopMessageDialogDataInterface {
  heading?: string;
  message: string;
}

export interface PopNavigationDialogDataInterface {
  basePath?: string;
  display?: string;
  list: PopNavigationDialogItemInterface[];
}


export interface PopNavigationDialogItemInterface {
  id: string | number;
  name: string;
  path?: string;
}
