/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  each
} from '../algorithm/iteration';

import {
  ISequence
} from '../algorithm/sequence';

import {
  JSONObject
} from '../algorithm/json';

import {
  Vector
} from '../collections/vector';

import {
  IDisposable
} from '../core/disposable';

import {
  ISignal, clearSignalData, defineSignal
} from '../core/signaling';


/**
 * An enum of the change types which occur on an observable vector.
 */
export
type VectorChangeType = 'insert' | 'remove' | 'clear' | 'set' | 'swap';


/**
 * The changed args object which is emitted by an observable vector.
 */
export
interface IVectorChangedArgs<T> {
  /**
   * The type of change undergone by the vector.
   */
  type: VectorChangeType;

  /**
   * The new index associated with the change.
   *
   * The semantics of this value depend upon the change type:
   *   - `'clear'`: Always `0`.
   *   - `'insert'`: The index of the inserted item.
   *   - `'set'`: The index of the set item.
   *   - `'remove'`: Always `-1`.
   *   - `'swap'`: Always `0`.
   */
  newIndex: number;

  /**
   * The new value associated with the change.
   *
   * The semantics of this value depend upon the change type:
   *   - `'clear'`: Always `undefined`.
   *   - `'insert'`: The item which was inserted.
   *   - `'remove'`: Always `undefined`.
   *   - `'set'`: The new item at the index.
   *   - `'swap'`: The new sequence of items.
   */
  newValue: T | ISequence<T>;

  /**
   * The old index associated with the change.
   *
   * The semantics of this value depend upon the change type:
   *   - `'clear'`: Always `0`.
   *   - `'insert'`: Always `-1`.
   *   - `'remove'`: The index of the removed item.
   *   - `'set'`: The index of the set item.
   *   - `'swap'`: Always `0`.
   */
  oldIndex: number;

  /**
   * The old value associated with the change.
   *
   * The semantics of this value depend upon the change type:
   *   - `'clear'`: The sequence of items which were removed.
   *   - `'insert'`: Always `undefined`.
   *   - `'remove'`: The item which was removed.
   *   - `'set'`: The old item at the index.
   *   - `'swap'`: The sequence of items which were removed.
   */
  oldValue: T | ISequence<T>;
}


/**
 * A generic vector data structure which can be observed for changes.
 */
export
interface IObservableVector<T> extends Vector<T>, IDisposable {
  /**
   * A signal emitted when the vector has changed.
   */
  changed: ISignal<IObservableVector<T>, IVectorChangedArgs<T>>;
}


/**
 * The default implementation of an observable vector.
 */
export
class ObservableVector<T> extends Vector<T> implements IObservableVector<T> {
  /**
   * A signal emitted when the vector has changed.
   */
  changed: ISignal<IObservableVector<T>, IVectorChangedArgs<T>>;

  /**
   * Test whether the vector has been disposed.
   *
   * #### Notes
   * This is a read-only property.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose of the observable vector.
   *
   * #### Notes
   * It is unsafe to use the vector after it has been disposed.
   *
   * All calls made to this method after the first are a no-op.
   */
  dispose(): void {
    // Do nothing if the vector is already disposed.
    if (this.isDisposed) {
      return;
    }
    super.clear();
    clearSignalData(this);
    this._isDisposed = true;
  }

  /**
   * Set the value at the specified index.
   *
   * @param index - The positive integer index of interest.
   *
   * @param value - The value to set at the specified index.
   *
   * #### Complexity
   * Constant.
   *
   * #### Iterator Validity
   * No changes.
   *
   * #### Undefined Behavior
   * An `index` which is non-integral or out of range.
   */
  set(index: number, value: T): void {
    let oldValue = this.at(index);
    super.set(index, value);
    this.onChange({
      type: 'set',
      oldIndex: index,
      oldValue,
      newIndex: index,
      newValue: value
    });
  }

  /**
   * Add a value to the back of the vector.
   *
   * @param value - The value to add to the back of the vector.
   *
   * #### Complexity
   * Constant.
   *
   * #### Iterator Validity
   * No changes.
   */
  pushBack(value: T): void {
    super.pushBack(value);
    this.onChange({
      type: 'insert',
      oldIndex: -1,
      oldValue: void 0,
      newIndex: this.length - 1,
      newValue: value
    });
  }

  /**
   * Remove and return the value at the back of the vector.
   *
   * @returns The value at the back of the vector, or `undefined` if
   *   the vector is empty.
   *
   * #### Complexity
   * Constant.
   *
   * #### Iterator Validity
   * Iterators pointing at the removed value are invalidated.
   */
  popBack(): T {
    let oldIndex = this.length - 1;
    let oldValue = super.popBack();
    this.onChange({
      type: 'remove',
      oldIndex,
      oldValue,
      newIndex: -1,
      newValue: void 0
    });
    return oldValue;
  }

  /**
   * Insert a value into the vector at a specific index.
   *
   * @param index - The positive integer index of interest.
   *
   * @param value - The value to set at the specified index.
   *
   * #### Complexity
   * Linear.
   *
   * #### Iterator Validity
   * No changes.
   *
   * #### Undefined Behavior
   * An `index` which is non-integral or out of range.
   */
  insert(index: number, value: T): void {
    super.insert(index, value);
    this.onChange({
      type: 'insert',
      oldIndex: -1,
      oldValue: void 0,
      newIndex: index,
      newValue: value
    });
  }

  /**
   * Remove the value at a specific index from the vector.
   *
   * @param index - The positive integer index of interest.
   *
   * #### Complexity
   * Linear.
   *
   * #### Iterator Validity
   * Iterators pointing at the removed value and beyond are invalidated.
   *
   * #### Undefined Behavior
   * An `index` which is non-integral or out of range.
   */
  remove(index: number): void {
    let oldValue = this.at(index);
    super.remove(index);
    this.onChange({
      type: 'remove',
      oldIndex: index,
      oldValue,
      newIndex: -1,
      newValue: void 0
    });
  }

  /**
   * Remove all values from the vector.
   *
   * #### Complexity
   * Linear.
   *
   * #### Iterator Validity
   * All current iterators are invalidated.
   */
  clear(): void {
    let oldValue = new Vector(this);
    super.clear();
    this.onChange({
      type: 'clear',
      oldIndex: 0,
      oldValue,
      newIndex: 0,
      newValue: void 0
    });
  }

  /**
   * Swap the contents of the vector with the contents of another.
   *
   * @param other - The other vector holding the contents to swap.
   *
   * #### Complexity
   * Linear.
   *
   * #### Iterator Validity
   * All current iterators remain valid, but will now point to the
   * contents of the other vector involved in the swap.
   */
  swap(other: Vector<T>): void {
    let oldValue = new Vector(this);
    super.swap(other);
    this.onChange({
      type: 'swap',
      oldIndex: 0,
      oldValue,
      newIndex: 0,
      newValue: this
    });
  }

  /**
   * Handle a change in the vector.
   *
   * #### Notes
   * The default implementation is to emit the `changed` signal.
   */
  protected onChange(change: IVectorChangedArgs<T>): void {
    this.changed.emit(change);
  }

  private _isDisposed = false;
}


// Define the signals for the `ObservableVector` class.
defineSignal(ObservableVector.prototype, 'changed');



/**
 * An object which is JSON-able.
 */
export
interface IJSONable {
  /**
   * Convert the object to JSON.
   */
  toJSON(): JSONObject;
}


/**
 * An observable vector that supports undo/redo actions.
 */
export
class ObservableUndoableVector<T extends IJSONable> extends ObservableVector<T> {
  /**
   * Construct a new undoable observable vector.
   */
  constructor(factory: (value: JSONObject) => T) {
    super();
    this._factory = factory;
  }

  /**
   * Whether the object can redo changes.
   *
   * #### Notes
   * This is a read-only property.
   */
  get canRedo(): boolean {
    return this._index < this._stack.length - 1;
  }

  /**
   * Whether the object can undo changes.
   *
   * #### Notes
   * This is a read-only property.
   */
  get canUndo(): boolean {
    return this._index >= 0;
  }

  /**
   * Get whether the object is disposed.
   *
   * #### Notes
   * This is a read-only property.
   */
  get isDisposed(): boolean {
    return this._stack === null;
  }

  /**
   * Dispose of the resources held by the model.
   */
  dispose(): void {
    // Do nothing if already disposed.
    if (this.isDisposed) {
      return;
    }
    this._factory = null;
    this._stack = null;
    super.dispose();
  }

  /**
   * Begin a compound operation.
   */
  beginCompoundOperation(isUndoAble?: boolean): void {
    this._inCompound = true;
    this._isUndoable = (isUndoAble !== false);
    this._madeCompoundChange = false;
  }

  /**
   * End a compound operation.
   */
  endCompoundOperation(): void {
    this._inCompound = false;
    this._isUndoable = true;
    if (this._madeCompoundChange) {
      this._index++;
    }
  }

  /**
   * Undo an operation.
   */
  undo(): void {
    if (!this.canUndo) {
      return;
    }
    let changes = this._stack[this._index];
    this._isUndoable = false;
    for (let change of changes.reverse()) {
      this._undoChange(change);
    }
    this._isUndoable = true;
    this._index--;
  }

  /**
   * Redo an operation.
   */
  redo(): void {
    if (!this.canRedo) {
      return;
    }
    this._index++;
    let changes = this._stack[this._index];
    this._isUndoable = false;
    for (let change of changes) {
      this._redoChange(change);
    }
    this._isUndoable = true;
  }

  /**
   * Clear the change stack.
   */
  clearUndo(): void {
    this._index = -1;
    this._stack = [];
  }

  /**
   * Handle a change in the list.
   */
  protected onChange(change: IVectorChangedArgs<T>): void {
    if (!this._isUndoable) {
      this.changed.emit(change);
      return;
    }
    // Clear everything after this position if necessary.
    if (!this._inCompound || !this._madeCompoundChange) {
      this._stack = this._stack.slice(0, this._index + 1);
    }
    // Copy the change.
    let evt = this._copyChange(change);
    // Put the change in the stack.
    if (this._stack[this._index + 1]) {
      this._stack[this._index + 1].push(evt);
    } else {
      this._stack.push([evt]);
    }
    // If not in a compound operation, increase index.
    if (!this._inCompound) {
      this._index++;
    } else {
      this._madeCompoundChange = true;
    }
    this.changed.emit(change);
  }

  /**
   * Undo a change event.
   */
  private _undoChange(change: IVectorChangedArgs<JSONObject>): void {
    let value: T;
    switch (change.type) {
    case 'add':
      this.remove(change.oldIndex);
      break;
    case 'set':
      value = this._createValue(change.oldValue as JSONObject);
      this.set(change.oldIndex, value);
      break;
    case 'insert':
      value = this._createValue(change.oldValue as JSONObject);
      this.insert(change.oldIndex, value);
      break;
    case 'clear':
    case 'swap':
      let values = this._createValues(change.oldValue as ISequence<JSONObject>);
      this.swap(values);
      break;
    default:
      return;
    }
  }

  /**
   * Redo a change event.
   */
  private _redoChange(change: IVectorChangedArgs<JSONObject>): void {
    let value: T;
    switch (change.type) {
    case 'add':
      value = this._createValue(change.newValue as JSONObject);
      this.insert(change.newIndex, value);
      break;
    case 'set':
      value = this._createValue(change.newValue as JSONObject);
      this.set(change.newIndex, value);
      break;
    case 'remove':
      this.remove(change.oldIndex);
      break;
    case 'clear':
      this.clear();
      break;
    case 'swap':
      let values = this._createValues(change.newValue as ISequence<JSONObject>);
      this.swap(values);
      break;
    default:
      return;
    }
  }

  /**
   * Create a value from JSON.
   */
  private _createValue(data: JSONObject): T {
    let factory = this._factory;
    return factory(data);
  }

  /**
   * Create a list of cell models from JSON.
   */
  private _createValues(bundles: ISequence<JSONObject>): Vector<T> {
    let values = new Vector<T>();
    each(bundles, bundle => {
      values.pushBack(this._createValue(bundle));
    });
    return values;
  }

  /**
   * Copy a change as JSON.
   */
  private _copyChange(change: IVectorChangedArgs<T>): IVectorChangedArgs<JSONObject> {
    let oldValue: JSONObject = null;
    let newValue: JSONObject = null;
    switch (change.type) {
    case 'add':
    case 'set':
    case 'remove':
      if (change.oldValue) {
        oldValue = (change.oldValue as T).toJSON();
      }
      if (change.newValue) {
        newValue = (change.newValue as T).toJSON();
      }
      break;
    case 'swap':
      return this._copySwap(change);
    case 'clear':
      return this._copyClear(change);
    default:
      return;
    }
    return {
      type: change.type,
      oldIndex: change.oldIndex,
      newIndex: change.newIndex,
      oldValue,
      newValue
    };
  }

  /**
   * Copy a swap change as JSON.
   */
  private _copySwap(change: IVectorChangedArgs<T>): IVectorChangedArgs<JSONObject> {
    let oldValue = new Vector<JSONObject>();
    each(change.oldValue as ISequence<T>, value => {
      oldValue.pushBack(value.toJSON());
    });
    let newValue = new Vector<JSONObject>();
    each(change.newValue as ISequence<T>, value => {
      newValue.pushBack(value.toJSON());
    });
    return {
      type: 'swap',
      oldIndex: change.oldIndex,
      newIndex: change.newIndex,
      oldValue,
      newValue
    };
  }

  /**
   * Copy a clear change as JSON.
   */
  private _copyClear(change: IVectorChangedArgs<T>): IVectorChangedArgs<JSONObject> {
    let oldValue = new Vector<JSONObject>();
    each(change.oldValue as ISequence<T>, value => {
      oldValue.pushBack(value.toJSON());
    });
    return {
      type: 'swap',
      oldIndex: change.oldIndex,
      newIndex: change.newIndex,
      oldValue,
      newValue: void 0
    };
  }

  private _inCompound = false;
  private _isUndoable = true;
  private _madeCompoundChange = false;
  private _index = -1;
  private _stack: IVectorChangedArgs<JSONObject>[][] = [];
  private _factory: (value: JSONObject) => T = null;
}
