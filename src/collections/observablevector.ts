/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  toArray
} from '../algorithm/iteration';

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
   *   - `'swap'`: The new `items[]`.
   */
  newValue: T | T[];

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
   *   - `'clear'`: The `items[]` which were removed.
   *   - `'insert'`: Always `undefined`.
   *   - `'remove'`: The item which was removed.
   *   - `'set'`: The old item at the index.
   *   - `'swap'`: The `items[]` which were removed.
   */
  oldValue: T | T[];
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
    this.changed.emit({
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
    this.changed.emit({
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
    this.changed.emit({
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
    this.changed.emit({
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
    this.changed.emit({
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
    let oldValue = toArray(this);
    super.clear();
    this.changed.emit({
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
    let oldValue = toArray(this);
    super.swap(other);
    let newValue = toArray(this);
    this.changed.emit({
      type: 'swap',
      oldIndex: 0,
      oldValue,
      newIndex: 0,
      newValue
    });
  }

  private _isDisposed = false;
}


// Define the signals for the `ObservableVector` class.
defineSignal(ObservableVector.prototype, 'changed');
