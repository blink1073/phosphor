/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import expect = require('expect.js');

import {
  simulate
} from 'simulate-event';

import {
  each
} from '../../../lib/algorithm/iteration';

import {
  JSONObject
} from '../../../lib/algorithm/json';

import {
  DisposableSet
} from '../../../lib/core/disposable'

import {
  sendMessage
} from '../../../lib/core/messaging';

import {
  CommandItem, CommandPalette
} from '../../../lib/ui/commandpalette';

import {
  commands, ICommand
} from '../../../lib/ui/commands';

import {
  keymap, KeyBinding
} from '../../../lib/ui/keymap';

import {
  Widget, WidgetMessage
} from '../../../lib/ui/widget';


class LogPalette extends CommandPalette {

  events: string[] = [];

  dispose(): void {
    super.dispose();
    this.events.length = 0;
  }

  handleEvent(event: Event): void {
    super.handleEvent(event);
    this.events.push(event.type);
  }
}


describe('ui/commandpalette', () => {

  describe('CommandItem', () => {

    describe('#constructor()', () => {

      it('should accept a command item options argument', () => {
        let item = new CommandItem({ command: 'test' });
        expect(item).to.be.a(CommandItem);
      });

    });

    describe('#command', () => {

      it('should return the command name of a command item', () => {
        let item = new CommandItem({ command: 'test' });
        expect(item.command).to.be('test');
      });

      it('should be read-only', () => {
        let item = new CommandItem({ command: 'test' });
        expect(() => { item.command = 'test-1'; }).to.throwError();
      });

    });

    describe('#args', () => {

      it('should return the args of a command item', () => {
        let options: CommandItem.IOptions = {
          args: { foo: 'bar', baz: 'qux' } as JSONObject,
          command: 'test'
        };
        let item = new CommandItem(options);
        expect(item.args).to.eql(options.args);
      });

      it('should be read-only', () => {
        let options: CommandItem.IOptions = {
          args: { foo: 'bar', baz: 'qux' } as JSONObject,
          command: 'test'
        };
        let item = new CommandItem(options);
        expect(() => { item.args = null; }).to.throwError();
      });

    });

    describe('#label', () => {

      it('should return the label of a command item', () => {
        let options: ICommand = { execute: () => { }, label: 'test label' };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(item.label).to.be(options.label);
        command.dispose();
      });

      it('should be read-only', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(() => { item.label = 'test label'; }).to.throwError();
        command.dispose();
      });

    });

    describe('#caption', () => {

      it('should return the caption of a command item', () => {
        let options: ICommand = { execute: () => { }, caption: 'test caption' };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(item.caption).to.be(options.caption);
        command.dispose();
      });

      it('should be read-only', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(() => { item.caption = 'test caption'; }).to.throwError();
        command.dispose();
      });

    });

    describe('#className', () => {

      it('should return the class name of a command item', () => {
        let options: ICommand = { execute: () => { }, className: 'testClass' };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(item.className).to.be(options.className);
        command.dispose();
      });

      it('should be read-only', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(() => { item.className = 'testClass'; }).to.throwError();
        command.dispose();
      });

    });

    describe('#isEnabled', () => {

      it('should return whether a command item is enabled', () => {
        let called = false;
        let options: ICommand = {
          execute: () => { },
          isEnabled: () => called = true
        };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(called).to.be(false);
        expect(item.isEnabled).to.be(true);
        expect(called).to.be(true);
        command.dispose();
      });

      it('should be read-only', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(() => { item.isEnabled = false; }).to.throwError();
        command.dispose();
      });

    });

    describe('#isToggled', () => {

      it('should return whether a command item is toggled', () => {
        let toggled = false;
        let options: ICommand = {
          execute: () => { },
          isToggled: () => toggled = !toggled
        };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(item.isToggled).to.be(true);
        expect(item.isToggled).to.be(false);
        expect(item.isToggled).to.be(true);
        command.dispose();
      });

      it('should be read-only', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(() => { item.isToggled = false; }).to.throwError();
        command.dispose();
      });

    });

    describe('#isVisible', () => {

      it('should return whether a command item is visible', () => {
        let called = false;
        let options: ICommand = {
          execute: () => { },
          isVisible: () => called = true
        };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(called).to.be(false);
        expect(item.isVisible).to.be(true);
        expect(called).to.be(true);
        command.dispose();
      });

      it('should be read-only', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(() => { item.isVisible = false; }).to.throwError();
        command.dispose();
      });

    });

    describe('#keyBinding', () => {

      it('should return the key binding of a command item', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let binding = keymap.addBinding({
          keys: ['Ctrl A'],
          selector: 'body',
          command: 'test'
        });
        let item = new CommandItem({ command: 'test' });
        expect(item.keyBinding).to.be.a(KeyBinding);
        expect(item.keyBinding.keys).to.eql(['Ctrl A']);
        binding.dispose();
        command.dispose();
      });

      it('should be read-only', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(() => { item.keyBinding = null; }).to.throwError();
        command.dispose();
      });

    });

    describe('#category', () => {

      it('should return the category of a command item', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test', category: 'random' });
        expect(item.category).to.be('random');
        command.dispose();
      });

      it('should default the category to `"general"`', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(item.category).to.be('general');
        command.dispose();
      });

      it('should be read-only', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        expect(() => { item.category = 'random'; }).to.throwError();
        command.dispose();
      });

    });

  });

  describe('CommandPalette', () => {

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        let palette = new CommandPalette();
        expect(palette).to.be.a(CommandPalette);
        expect(palette.node.classList.contains('p-CommandPalette')).to.be(true);
        palette.dispose();
      });

      it('should accept command palette instantiation options', () => {
        let options: CommandPalette.IOptions = {};
        let palette = new CommandPalette(options);
        expect(palette).to.be.a(CommandPalette);
        expect(palette.node.classList.contains('p-CommandPalette')).to.be(true);
        palette.dispose();
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the command palette', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        let palette = new CommandPalette();
        palette.addItem(item);
        palette.dispose();
        expect(palette.items).to.be.empty();
        expect(palette.isDisposed).to.be(true);
        command.dispose();
      });

    });

    describe('#searchNode', () => {

      it('should return the search node of a command palette', () => {
        let palette = new CommandPalette();
        let node = palette.searchNode;
        expect(node).to.be.ok();
        expect(node.classList.contains('p-CommandPalette-search')).to.be(true);
        palette.dispose();
      });

      it('should be read-only', () => {
        let palette = new CommandPalette();
        expect(() => { palette.searchNode = null; }).to.throwError();
        palette.dispose();
      });

    });

    describe('#inputNode', () => {

      it('should return the input node of a command palette', () => {
        let palette = new CommandPalette();
        let node = palette.inputNode;
        expect(node).to.be.ok();
        expect(node.classList.contains('p-CommandPalette-input')).to.be(true);
        palette.dispose();
      });

      it('should be read-only', () => {
        let palette = new CommandPalette();
        expect(() => { palette.inputNode = null; }).to.throwError();
        palette.dispose();
      });

    });

    describe('#contentNode', () => {

      it('should return the content node of a command palette', () => {
        let palette = new CommandPalette();
        let node = palette.contentNode;
        expect(node).to.be.ok();
        expect(node.classList.contains('p-CommandPalette-content')).to.be(true);
        palette.dispose();
      });

      it('should be read-only', () => {
        let palette = new CommandPalette();
        expect(() => { palette.contentNode = null; }).to.throwError();
        palette.dispose();
      });

    });

    describe('#items', () => {

      it('should return the items in a command palette', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        let palette = new CommandPalette();
        expect(palette.items).to.be.empty();
        palette.addItem(item);
        expect(palette.items).to.have.length(1);
        expect(palette.items.at(0).command).to.be('test');
        palette.dispose();
        command.dispose();
      });

      it('should be read-only', () => {
        let palette = new CommandPalette();
        expect(() => { palette.items = null; }).to.throwError();
        palette.dispose();
      });

    });

    describe('#renderer', () => {

      it('should get the renderer for the command palette', () => {
        let renderer = Object.create(CommandPalette.defaultRenderer);
        let palette = new CommandPalette({ renderer });
        expect(palette.renderer).to.be(renderer);
      });

      it('should be read-only', () => {
        let palette = new CommandPalette();
        expect(() => { palette.renderer = null; }).to.throwError();
      });

    });

    describe('#addItem()', () => {

      it('should add an item to a command palette', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        let palette = new CommandPalette();
        expect(palette.items).to.be.empty();
        expect(palette.addItem(item).command).to.be('test');
        expect(palette.items).to.have.length(1);
        expect(palette.items.at(0).command).to.be('test');
        palette.dispose();
        command.dispose();
      });

      it('should add the shortcut for an item to a command palette', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let binding = keymap.addBinding({
          keys: ['Ctrl A'],
          selector: 'body',
          command: 'test'
        });
        let item = new CommandItem({ command: 'test' });
        let palette = new CommandPalette();
        let content = palette.contentNode;

        Widget.attach(palette, document.body);
        expect(palette.items).to.be.empty();
        expect(palette.addItem(item).command).to.be('test');
        sendMessage(palette, WidgetMessage.UpdateRequest);

        let node = content.querySelector('.p-CommandPalette-item');
        let shortcut = node.querySelector('.p-CommandPalette-itemShortcut');

        expect(node).to.be.ok();
        expect(shortcut).to.be.ok();
        expect(shortcut.textContent.length).to.be.greaterThan(0);
        expect(palette.items).to.have.length(1);
        expect(palette.items.at(0).command).to.be('test');

        palette.dispose();
        binding.dispose();
        command.dispose();
      });

    });

    describe('#removeItem()', () => {

      it('should remove an item from a command palette by item', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        let palette = new CommandPalette();
        Widget.attach(palette, document.body);
        expect(palette.items).to.be.empty();
        palette.addItem(item);
        expect(palette.items).to.have.length(1);
        palette.removeItem(item);
        expect(palette.items).to.be.empty();
        palette.dispose();
        command.dispose();
      });

      it('should remove an item from a command palette by index', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        let palette = new CommandPalette();
        Widget.attach(palette, document.body);
        expect(palette.items).to.be.empty();
        palette.addItem(item);
        expect(palette.items).to.have.length(1);
        palette.removeItem(0);
        expect(palette.items).to.be.empty();
        palette.dispose();
        command.dispose();
      });

      it('should do nothing if the item is not contained in a palette', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let item = new CommandItem({ command: 'test' });
        let palette = new CommandPalette();
        Widget.attach(palette, document.body);
        expect(palette.items).to.be.empty();
        palette.removeItem(0);
        expect(palette.items).to.be.empty();
        palette.dispose();
        command.dispose();
      });

    });

    describe('#clearItems()', () => {

      it('should remove all items from a command palette', () => {
        let options: ICommand = { execute: () => { } };
        let command = commands.addCommand('test', options);
        let palette = new CommandPalette();
        Widget.attach(palette, document.body);
        expect(palette.items).to.be.empty();
        palette.addItem(new CommandItem({ command: 'test', category: 'one' }));
        palette.addItem(new CommandItem({ command: 'test', category: 'two' }));
        expect(palette.items).to.have.length(2);
        palette.clearItems();
        expect(palette.items).to.be.empty();
        palette.dispose();
        command.dispose();
      });

    });

    describe('#handleEvent()', () => {

      it('should handle click, keydown, and input events', () => {
        let palette = new LogPalette();
        Widget.attach(palette, document.body);
        each(['click', 'keydown', 'input'], type => {
          simulate(palette.node, type);
          expect(palette.events).to.contain(type);
        });
        palette.dispose();
      });

      context('click', () => {

        it('should trigger a command when its item is clicked', () => {
          let called = false;
          let options: ICommand = { execute: () => called = true };
          let command = commands.addCommand('test', options);
          let palette = new CommandPalette();
          let content = palette.contentNode;

          palette.addItem({ command: 'test' });
          sendMessage(palette, WidgetMessage.UpdateRequest);
          Widget.attach(palette, document.body);

          let node = content.querySelector('.p-CommandPalette-item');

          expect(node).to.be.ok();
          simulate(node, 'click');
          expect(called).to.be(true);

          palette.dispose();
          command.dispose();
        });

        it('should ignore if it is not a left click', () => {
          let called = false;
          let options: ICommand = { execute: () => called = true };
          let command = commands.addCommand('test', options);
          let palette = new CommandPalette();
          let content = palette.contentNode;

          palette.addItem({ command: 'test' });
          sendMessage(palette, WidgetMessage.UpdateRequest);
          Widget.attach(palette, document.body);

          let node = content.querySelector('.p-CommandPalette-item');

          expect(node).to.be.ok();
          simulate(node, 'click', { button: 1 });
          expect(called).to.be(false);

          palette.dispose();
          command.dispose();
        });

      });

      context('keydown', () => {

        it('should navigate down if down arrow is pressed', () => {
          let options: ICommand = { execute: () => { } };
          let command = commands.addCommand('test', options);
          let palette = new CommandPalette();
          let content = palette.contentNode;

          palette.addItem({ command: 'test' });
          sendMessage(palette, WidgetMessage.UpdateRequest);
          Widget.attach(palette, document.body);

          let node = content.querySelector('.p-mod-active');

          expect(node).to.not.be.ok();
          simulate(palette.node, 'keydown', { keyCode: 40 }); // Down arrow
          simulate(palette.node, 'keydown', { keyCode: 40 }); // Down arrow
          node = content.querySelector('.p-CommandPalette-item.p-mod-active');
          expect(node).to.be.ok();

          palette.dispose();
          command.dispose();
        });

        it('should navigate up if up arrow is pressed', () => {
          let options: ICommand = { execute: () => { } };
          let command = commands.addCommand('test', options);
          let palette = new CommandPalette();
          let content = palette.contentNode;

          palette.addItem({ command: 'test' });
          sendMessage(palette, WidgetMessage.UpdateRequest);
          Widget.attach(palette, document.body);

          let node = content.querySelector('.p-mod-active');

          expect(node).to.not.be.ok();
          simulate(palette.node, 'keydown', { keyCode: 38 }); // Up arrow
          node = content.querySelector('.p-CommandPalette-item.p-mod-active');
          expect(node).to.be.ok();

          palette.dispose();
          command.dispose();
        });

        it('should ignore if modifier keys are pressed', () => {
          let called = false;
          let options: ICommand = { execute: () => called = true };
          let command = commands.addCommand('test', options);
          let palette = new CommandPalette();
          let content = palette.contentNode;

          palette.addItem({ command: 'test' });
          sendMessage(palette, WidgetMessage.UpdateRequest);
          Widget.attach(palette, document.body);

          let node = content.querySelector('.p-mod-active');

          expect(node).to.not.be.ok();
          each(['altKey', 'ctrlKey', 'shiftKey', 'metaKey'], key => {
            let options: any = { keyCode: 38 };
            options[key] = true;
            simulate(palette.node, 'keydown', options);
            node = content.querySelector('.p-CommandPalette-item.p-mod-active');
            expect(node).to.not.be.ok();
          });

          palette.dispose();
          command.dispose();
        });

        it('should trigger active item if enter is pressed', () => {
          let called = false;
          let options: ICommand = { execute: () => called = true };
          let command = commands.addCommand('test', options);
          let palette = new CommandPalette();
          let content = palette.contentNode;

          palette.addItem({ command: 'test' });
          sendMessage(palette, WidgetMessage.UpdateRequest);
          Widget.attach(palette, document.body);

          expect(content.querySelector('.p-mod-active')).to.not.be.ok();
          simulate(palette.node, 'keydown', { keyCode: 40 }); // Down arrow
          simulate(palette.node, 'keydown', { keyCode: 40 }); // Down arrow
          simulate(palette.node, 'keydown', { keyCode: 13 }); // Enter
          expect(called).to.be(true);

          palette.dispose();
          command.dispose();
        });

        it('should trigger active category if enter is pressed', () => {
          let palette = new CommandPalette();
          let categories = ['A', 'B'];
          let names = [
            ['A', 'B', 'C', 'D', 'E'],
            ['F', 'G', 'H', 'I', 'J']
          ];
          let disposables = new DisposableSet();
          disposables.add(palette);
          names.forEach((values, index) => {
            let category = categories[index];
            values.forEach(command => {
              let options: ICommand = { execute: () => { }, label: command };
              palette.addItem({ category, command });
              disposables.add(commands.addCommand(command, options));
            });
          });

          sendMessage(palette, WidgetMessage.UpdateRequest);
          Widget.attach(palette, document.body);

          let content = palette.contentNode;
          let items = () => content.querySelectorAll('.p-CommandPalette-item');

          expect(items()).to.have.length(10);
          expect(content.querySelector('.p-mod-active')).to.not.be.ok();
          simulate(palette.node, 'keydown', { keyCode: 40 }); // Down arrow
          simulate(palette.node, 'keydown', { keyCode: 13 }); // Enter
          sendMessage(palette, WidgetMessage.UpdateRequest);
          expect(items()).to.have.length(5);

          disposables.dispose();
        });

      });

      context('input', () => {

        it('should filter the list of visible items', () => {
          let palette = new CommandPalette();
          let disposables = new DisposableSet();
          disposables.add(palette);
          ['A', 'B', 'C', 'D', 'E'].forEach(name => {
            let options: ICommand = { execute: () => { }, label: name };
            let command = commands.addCommand(name, options);
            palette.addItem({ command: name });
            disposables.add(command);
          });

          sendMessage(palette, WidgetMessage.UpdateRequest);
          Widget.attach(palette, document.body);

          let content = palette.contentNode;
          let itemClass = '.p-CommandPalette-item';
          let items = () => content.querySelectorAll(itemClass);

          expect(items()).to.have.length(5);
          palette.inputNode.value = 'A';
          sendMessage(palette, WidgetMessage.UpdateRequest);
          expect(items()).to.have.length(1);

          disposables.dispose();
        });

        it('should filter by both text and category', () => {
          let palette = new CommandPalette();
          let categories = ['Z', 'Y'];
          let names = [
            ['A1', 'B2', 'C3', 'D4', 'E5'],
            ['F1', 'G2', 'H3', 'I4', 'J5']
          ];
          let disposables = new DisposableSet();
          disposables.add(palette);
          names.forEach((values, index) => {
            let category = categories[index];
            values.forEach(command => {
              let options: ICommand = { execute: () => { }, label: command };
              palette.addItem({ category, command });
              disposables.add(commands.addCommand(command, options));
            });
          });

          sendMessage(palette, WidgetMessage.UpdateRequest);
          Widget.attach(palette, document.body);

          let content = palette.contentNode;
          let catSelector = '.p-CommandPalette-header';
          let items = () => content.querySelectorAll('.p-CommandPalette-item');
          let input = (value: string) => {
            palette.inputNode.value = value;
            sendMessage(palette, WidgetMessage.UpdateRequest);
          };

          expect(items()).to.have.length(10);
          input(`${categories[1]}:`); // Category match
          expect(items()).to.have.length(5);
          input(`${categories[1]}: B`); // No match
          expect(items()).to.have.length(0);
          input(`${categories[1]}: I`); // Category and text match
          expect(items()).to.have.length(1);

          input('1'); // Multi-category match
          expect(palette.node.querySelectorAll(catSelector)).to.have.length(2);
          expect(items()).to.have.length(2);
          simulate(palette.node, 'keydown', { keyCode: 38 }); // Up arrow
          simulate(palette.node, 'keydown', { keyCode: 13 }); // Enter
          let cat = categories.sort().map(cat => cat.toLowerCase())[0];
          expect(palette.inputNode.value).to.be(`${cat}: 1`);

          disposables.dispose();
        });

      });

    });

  });

});
