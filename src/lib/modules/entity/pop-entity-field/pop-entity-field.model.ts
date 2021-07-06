import { Dictionary, PopBaseEventInterface } from '../../../pop-common.model';


export interface EntityFieldComponentInterface {
  /**
   * A method to subject the field state to edit
   * @param id
   * @param archive
   */
  onEdit?(event?: PopBaseEventInterface, dataKey?: number): boolean;

  /**
   * A method to add an additional values to the field
   * @param id
   * @param archive
   */
  onAdd?(event?: PopBaseEventInterface): boolean;

  /**
   * A method to remove an additional values from this field
   * @param id
   * @param archive
   */
  onRemove?(event?: PopBaseEventInterface, dataKey?: number): boolean;

  /**
   * A method to remove an additional values from this field
   * @param id
   * @param archive
   */
  onPatch?(event?: PopBaseEventInterface, dataKey?: number, column?: string): Promise<boolean>;

  /**
   * A method to handle when an edit is closed
   * @param id
   * @param archive
   */
  onClose?(event?: PopBaseEventInterface, dataKey?: number): boolean;


  /**
   * A method to handle actions from this field
   * @param id
   * @param archive
   */
  onActionButtonClick?(event: PopBaseEventInterface): boolean;

  /**
   * A method to handle field item events from this field
   * @param id
   * @param archive
   */
  onBubbleEvent?(name?: string, extension?: Dictionary<any>, event?: PopBaseEventInterface): boolean;
}
