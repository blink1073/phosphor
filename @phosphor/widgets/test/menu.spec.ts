/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

import {
  expect
} from 'chai';

import {
  simulate
} from 'simulate-event';

import {
  JSONObject
} from '@phosphor/coreutils';

import {
  DisposableSet
} from '@phosphor/disposable';

import {
  Message
} from '@phosphor/messaging';

import {
  CommandRegistry
} from '@phosphor/commands';

import {
  VirtualDOM
} from '@phosphor/virtualdom';

import {
  Menu, Widget
} from '@phosphor/widgets';


class LogMenu extends Menu {

  events: string[] = [];

  methods: string[] = [];

  handleEvent(event: Event): void {
    super.handleEvent(event);
    this.events.push(event.type);
  }

  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.methods.push('onAfterAttach');
  }

  protected onBeforeDetach(msg: Message): void {
    super.onBeforeDetach(msg);
    this.methods.push('onBeforeDetach');
  }

  protected onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
    this.methods.push('onUpdateRequest');
  }

  protected onCloseRequest(msg: Message): void {
    super.onCloseRequest(msg);
    this.methods.push('onCloseRequest');
  }
}


describe('@phosphor/widgets', () => {

  const DEFAULT_CMD = 'menu.spec.ts:defaultCmd';

  const disposables = new DisposableSet();

  let commands: CommandRegistry;

  before(() => {
    commands = new CommandRegistry();
    let cmd = commands.addCommand(DEFAULT_CMD, {
      execute: (args: JSONObject) => { return args; },
      label: 'LABEL',
      icon: 'foo',
      className: 'bar',
      isToggled: (args: JSONObject) => { return true; },
      mnemonic: 1
    });
    let kbd = commands.addKeyBinding({
      keys: ['A'],
      selector: '*',
      command: DEFAULT_CMD
    });
    disposables.add(cmd);
    disposables.add(kbd);
  });

  after(() => {
    disposables.dispose();
  });

  describe('IMenuItem', () => {

    let menu: Menu;

    beforeEach(() => {
      menu = new Menu({ commands });
    });

    describe('#type', () => {

      it('should get the type of the menu item', () => {
        let item = menu.addItem({ type: 'separator' });
        expect(item.type).to.equal('separator');
      });

      it("should default to `'command'`", () => {
        let item = menu.addItem({});
        expect(item.type).to.equal('command');
      });

    });

    describe('#command', () => {

      it('should get the command to execute when the item is triggered', () => {
        let item = menu.addItem({ command: 'foo' });
        expect(item.command).to.equal('foo');
      });

      it('should default to an empty string', () => {
        let item = menu.addItem({});
        expect(item.command).to.equal('');
      });

    });

    describe('#args', () => {

      it('should get the arguments for the command', () => {
        let item = menu.addItem({ args: { foo: 1 } });
        expect(item.args).to.deep.equal({ foo: 1 });
      });

      it('should default to `null`', () => {
        let item = menu.addItem({});
        expect(item.args).to.equal(null);
      });

    });

    describe('#submenu', () => {

      it('should get the submenu for the item', () => {
        let submenu = new Menu({ commands });
        let item = menu.addItem({ submenu: submenu });
        expect(item.submenu).to.equal(submenu);
      });


      it('should default to `null`', () => {
        let item = menu.addItem({});
        expect(item.submenu).to.equal(null);
      });

    });

    describe('#label', () => {

      it('should get the label of a command item for a `command` type', () => {
        let disposable = commands.addCommand('test', {
          execute: (args: JSONObject) => { return args; },
          label: 'foo'
        });
        let item = menu.addItem({ command: 'test' });
        expect(item.label).to.equal('foo');
        disposable.dispose();
      });

      it('should get the title label of a submenu item for a `submenu` type', () => {
        let submenu = new Menu({ commands });
        submenu.title.label = 'foo';
        let item = menu.addItem({ type: 'submenu', submenu: submenu });
        expect(item.label).to.equal('foo');
      });

      it('should default to an empty string', () => {
        let item = menu.addItem({});
        expect(item.label).to.equal('');

        item = menu.addItem({ type: 'separator' });
        expect(item.label).to.equal('');
      });

    });

    describe('#mnemonic', () => {

      it('should get the mnemonic index of a command item for a `command` type', () => {
        let disposable = commands.addCommand('test', {
          execute: (args: JSONObject) => { return args; },
          mnemonic: 1
        });
        let item = menu.addItem({ command: 'test' });
        expect(item.mnemonic).to.equal(1);
        disposable.dispose();
      });

      it('should get the title mnemonic of a submenu item for a `submenu` type', () => {
        let submenu = new Menu({ commands });
        submenu.title.mnemonic = 1;
        let item = menu.addItem({ type: 'submenu', submenu: submenu });
        expect(item.mnemonic).to.equal(1);
      });


      it('should default to `-1`', () => {
        let item = menu.addItem({});
        expect(item.mnemonic).to.equal(-1);

        item = menu.addItem({ type: 'separator' });
        expect(item.mnemonic).to.equal(-1);
      });

    });

    describe('#icon', () => {

      it('should get the icon class of a command item for a `command` type', () => {
        let disposable = commands.addCommand('test', {
          execute: (args: JSONObject) => { return args; },
          icon: 'foo'
        });
        let item = menu.addItem({ command: 'test' });
        expect(item.icon).to.equal('foo');
        disposable.dispose();
      });

      it('should get the title icon of a submenu item for a `submenu` type', () => {
        let submenu = new Menu({ commands });
        submenu.title.icon = 'foo';
        let item = menu.addItem({ type: 'submenu', submenu: submenu });
        expect(item.icon).to.equal('foo');
      });

      it('should default to an empty string', () => {
        let item = menu.addItem({});
        expect(item.icon).to.equal('');

        item = menu.addItem({ type: 'separator' });
        expect(item.icon).to.equal('');
      });

    });

    describe('#caption', () => {

      it('should get the caption of a command item for a `command` type', () => {
        let disposable = commands.addCommand('test', {
          execute: (args: JSONObject) => { return args; },
          caption: 'foo'
        });
        let item = menu.addItem({ command: 'test' });
        expect(item.caption).to.equal('foo');
        disposable.dispose();
      });

      it('should get the title caption of a submenu item for a `submenu` type', () => {
        let submenu = new Menu({ commands });
        submenu.title.caption = 'foo';
        let item = menu.addItem({ type: 'submenu', submenu: submenu });
        expect(item.caption).to.equal('foo');
      });

      it('should default to an empty string', () => {
        let item = menu.addItem({});
        expect(item.caption).to.equal('');

        item = menu.addItem({ type: 'separator' });
        expect(item.caption).to.equal('');
      });

    });

    describe('#className', () => {

      it('should get the extra class name of a command item for a `command` type', () => {
        let disposable = commands.addCommand('test', {
          execute: (args: JSONObject) => { return args; },
          className: 'foo'
        });
        let item = menu.addItem({ command: 'test' });
        expect(item.className).to.equal('foo');
        disposable.dispose();
      });

      it('should get the title extra class name of a submenu item for a `submenu` type', () => {
        let submenu = new Menu({ commands });
        submenu.title.className = 'foo';
        let item = menu.addItem({ type: 'submenu', submenu: submenu });
        expect(item.className).to.equal('foo');
      });

      it('should default to an empty string', () => {
        let item = menu.addItem({});
        expect(item.className).to.equal('');

        item = menu.addItem({ type: 'separator' });
        expect(item.className).to.equal('');
      });

    });

    describe('#isEnabled', () => {

      it('should get whether the command is enabled for a `command` type', () => {
        let disposable = commands.addCommand('test', {
          execute: (args: JSONObject) => { return args; },
          isEnabled: (args: JSONObject) => { return false; },
        });
        let item = menu.addItem({ command: 'test' });
        expect(item.isEnabled).to.equal(false);
        disposable.dispose();
      });

      it('should get whether there is a submenu for a `submenu` type', () => {
        let submenu = new Menu({ commands });
        let item = menu.addItem({ type: 'submenu', submenu: submenu });
        expect(item.isEnabled).to.equal(true);
        item = menu.addItem({ type: 'submenu'});
        expect(item.isEnabled).to.equal(false);
      });

      it('should default to `false` for a command item', () => {
        let item = menu.addItem({});
        expect(item.isEnabled).to.equal(false);
      });

      it('should be `true` for a separator item', () => {
        let item = menu.addItem({ type: 'separator' });
        expect(item.isEnabled).to.equal(true);
      });

    });

    describe('#isToggled', () => {

      it('should get whether the command is toggled for a `command` type', () => {
        let disposable = commands.addCommand('test', {
          execute: (args: JSONObject) => { return args; },
          isToggled: (args: JSONObject) => { return false; },
        });
        let item = menu.addItem({ command: 'test' });
        expect(item.isToggled).to.equal(false);
        disposable.dispose();
      });

      it('should default to `false` for a command item', () => {
        let item = menu.addItem({});
        expect(item.isToggled).to.equal(false);
      });

      it('should be `false` for other item types', () => {
        let item = menu.addItem({ type: 'separator' });
        expect(item.isToggled).to.equal(false);
        item = menu.addItem({ type: 'submenu' });
        expect(item.isToggled).to.equal(false);
      });

    });

    describe('#isVisible', () => {

      it('should get whether the command is visible for a `command` type', () => {
        let disposable = commands.addCommand('test', {
          execute: (args: JSONObject) => { return args; },
          isVisible: (args: JSONObject) => { return false; },
        });
        let item = menu.addItem({ command: 'test' });
        expect(item.isVisible).to.equal(false);
        disposable.dispose();
      });

      it('should get whether there is a submenu for a `submenu` type', () => {
        let submenu = new Menu({ commands });
        let item = menu.addItem({ type: 'submenu', submenu: submenu });
        expect(item.isVisible).to.equal(true);
        item = menu.addItem({ type: 'submenu'});
        expect(item.isVisible).to.equal(false);
      });

      it('should default to `false` for a command item', () => {
        let item = menu.addItem({});
        expect(item.isVisible).to.equal(false);
      });

      it('should be `true` for a separator item', () => {
        let item = menu.addItem({ type: 'separator' });
        expect(item.isVisible).to.equal(true);
      });

    });

    describe('#keyBinding', () => {

      it('should get the key binding for the menu item', () => {
        let binding = {
          keys: ['A'],
          selector: '*',
          command: 'test'
        };
        let disposable = commands.addKeyBinding(binding);
        let item = menu.addItem({ command: 'test' });
        expect(item.keyBinding!.keys).to.deep.equal(['A']);
        disposable.dispose();
      });

      it('should default to `null`', () => {
        let item = menu.addItem({ command: 'test' });
        expect(item.keyBinding).to.equal(null);
        item = menu.addItem({ type: 'separator' });
        expect(item.keyBinding).to.equal(null);
        item = menu.addItem({ type: 'submenu' });
        expect(item.keyBinding).to.equal(null);
      });

    });

  });

  describe('Menu', () => {

    describe('#constructor()', () => {

      it('should take no arguments', () => {
        let menu = new Menu({ commands });
        expect(menu).to.be.an.instanceof(Menu);
      });

      it('should take options for initializing the menu', () => {
        let renderer = new Menu.Renderer();
        let menu = new Menu({
          renderer,
          commands: new CommandRegistry()
        });
        expect(menu).to.be.an.instanceof(Menu);
      });

      it('should add the `p-Menu` class', () => {
        let menu = new Menu({ commands });
        expect(menu.hasClass('p-Menu')).to.equal(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the menu', () => {
        let menu = new Menu({ commands });
        menu.addItem({});
        menu.dispose();
        expect(menu.items).to.deep.equal([]);
        expect(menu.isDisposed).to.equal(true);
      });

    });

    describe('#aboutToClose', () => {

      it('should be emitted just before the menu is closed', () => {
        let called = false;
        let menu = new Menu({ commands });
        Widget.attach(menu, document.body);
        menu.aboutToClose.connect((sender, args) => {
          expect(sender).to.equal(menu);
          expect(args).to.equal(void 0);
          expect(menu.isAttached).to.equal(true);
          called = true;
        });
        menu.close();
        expect(called).to.equal(true);
        menu.dispose();
      });

      it('should not be emitted if the menu is not attached', () => {
        let called = false;
        let menu = new Menu({ commands });
        Widget.attach(menu, document.body);
        menu.aboutToClose.connect(() => { called = true; });
        Widget.detach(menu);
        menu.close();
        expect(called).to.equal(false);
      });

    });

    describe('menuRequested', () => {

      it('should be emitted when a left arrow key is pressed and a submenu cannot be opened or closed', () => {
        let menu = new Menu({ commands });
        let called = false;
        Widget.attach(menu, document.body);
        menu.menuRequested.connect((sender, args) => {
          expect(sender).to.equal(menu);
          expect(args).to.equal('previous');
          called = true;
        });
        simulate(menu.node, 'keydown', { keyCode: 37 });
        expect(called).to.equal(true);
        menu.dispose();
      });

      it('should be emitted when a right arrow key is pressed and a submenu cannot be opened or closed', () => {
        let menu = new Menu({ commands });
        Widget.attach(menu, document.body);
        let called = false;
        menu.menuRequested.connect((sender, args) => {
          expect(sender).to.equal(menu);
          expect(args).to.equal('next');
          called = true;
        });
        simulate(menu.node, 'keydown', { keyCode: 39 });
        expect(called).to.equal(true);
        menu.dispose();
      });

      it('should only be emitted for the root menu in a hierarchy', () => {
        let sub = new Menu({ commands });
        let menu = new Menu({ commands });
        let item = menu.addItem({ type: 'submenu', submenu: sub });
        Widget.attach(menu, document.body);
        menu.activeItem = item;
        menu.triggerActiveItem();
        let called = false;
        let subCalled = false;
        menu.menuRequested.connect((sender, args) => {
          expect(sender).to.equal(menu);
          expect(args).to.equal('next');
          called = true;
        });
        sub.menuRequested.connect(() => { subCalled = true; });
        simulate(sub.node, 'keydown', { keyCode: 39 });
        expect(called).to.equal(true);
        expect(subCalled).to.equal(false);
        menu.dispose();
      });

    });

    describe('#parentMenu', () => {

      it('should get the parent menu of the menu', () => {
        let sub = new Menu({ commands });
        let menu = new Menu({ commands });
        let item = menu.addItem({ type: 'submenu', submenu: sub });
        Widget.attach(menu, document.body);
        menu.activeItem = item;
        menu.triggerActiveItem();
        expect(sub.parentMenu).to.equal(menu);
        menu.dispose();
      });

      it('should be `null` if the menu is not an open submenu', () => {
        let sub = new Menu({ commands });
        let menu = new Menu({ commands });
        menu.addItem({ type: 'submenu', submenu: sub });
        Widget.attach(menu, document.body);
        expect(sub.parentMenu).to.equal(null);
        expect(menu.parentMenu).to.equal(null);
        menu.dispose();
      });

    });

    describe('#childMenu', () => {

      it('should get the child menu of the menu', () => {
        let sub = new Menu({ commands });
        let menu = new Menu({ commands });
        let item = menu.addItem({ type: 'submenu', submenu: sub });
        Widget.attach(menu, document.body);
        menu.activeItem = item;
        menu.triggerActiveItem();
        expect(menu.childMenu).to.equal(sub);
        menu.dispose();
      });

      it('should be `null` if the menu does not have an open submenu', () => {
        let sub = new Menu({ commands });
        let menu = new Menu({ commands });
        menu.addItem({ type: 'submenu', submenu: sub });
        Widget.attach(menu, document.body);
        expect(menu.childMenu).to.equal(null);
        menu.dispose();
      });

    });

    describe('#rootMenu', () => {

      it('should get the root menu of the menu hierarchy', () => {
        let subSub = new Menu({ commands });
        let sub = new Menu({ commands });
        let subItem =  sub.addItem({ type: 'submenu', submenu: subSub });
        let menu = new Menu({ commands });
        let item = menu.addItem({ type: 'submenu', submenu: sub });
        Widget.attach(menu, document.body);
        menu.activeItem = item;
        menu.triggerActiveItem();
        sub.activeItem = subItem;
        sub.triggerActiveItem();
        expect(subSub.rootMenu).to.equal(menu);
        menu.dispose();
      });

      it('should be itself if the menu is not an open submenu', () => {
        let subSub = new Menu({ commands });
        let sub = new Menu({ commands });
        sub.addItem({ type: 'submenu', submenu: subSub });
        let menu = new Menu({ commands });
        menu.addItem({ type: 'submenu', submenu: sub });
        Widget.attach(menu, document.body);
        expect(sub.rootMenu).to.equal(sub);
        expect(subSub.rootMenu).to.equal(subSub);
        menu.dispose();
      });

    });

    describe('#leafMenu', () => {

      it('should get the leaf menu of the menu hierarchy', () => {
        let subSub = new Menu({ commands });
        let sub = new Menu({ commands });
        let subItem = sub.addItem({ type: 'submenu', submenu: subSub });
        let menu = new Menu({ commands });
        let item = menu.addItem({ type: 'submenu', submenu: sub });
        Widget.attach(menu, document.body);
        menu.activeItem = item;
        menu.triggerActiveItem();
        sub.activeItem = subItem;
        sub.triggerActiveItem();
        expect(menu.leafMenu).to.equal(subSub);
        menu.dispose();
      });

      it('should be itself if the menu does not have an open submenu', () => {
        let subSub = new Menu({ commands });
        let sub = new Menu({ commands });
        sub.addItem({ type: 'submenu', submenu: subSub });
        let menu = new Menu({ commands });
        menu.addItem({ type: 'submenu', submenu: sub });
        Widget.attach(menu, document.body);
        expect(menu.leafMenu).to.equal(menu);
        expect(sub.leafMenu).to.equal(sub);
        menu.dispose();
      });

    });

    describe('#contentNode', () => {

      it('should get the menu content node', () => {
        let menu = new Menu({ commands });
        let content = menu.contentNode;
        expect(content.classList.contains('p-Menu-content')).to.equal(true);
      });

    });

    describe('#renderer', () => {

      it('should get the renderer for the menu', () => {
        let renderer = Object.create(Menu.defaultRenderer);
        let menu = new Menu({ renderer , commands });
        expect(menu.renderer).to.equal(renderer);
      });

    });

    describe('#items', () => {

      it('should get a read-only array of the menu items in the menu', () => {
        let menu = new Menu({ commands });
        menu.addItem({ command: 'foo' });
        menu.addItem({ command: 'bar' });
        let items = menu.items;
        expect(items.length).to.equal(2);
        expect(items[0].command).to.equal('foo');
        expect(items[1].command).to.equal('bar');
      });

    });

    describe('#activeItem', () => {

      it('should get the currently active menu item', () => {
        let menu = new Menu({ commands });
        let item = menu.addItem({ command: DEFAULT_CMD });
        menu.activeIndex = 0;
        expect(menu.activeItem).to.equal(item);
      });

      it('should be `null` if no menu item is active', () => {
        let menu = new Menu({ commands });
        expect(menu.activeItem).to.equal(null);
        menu.addItem({ command: DEFAULT_CMD });
        expect(menu.activeItem).to.equal(null);
      });

      it('should set the currently active menu item', () => {
        let menu = new Menu({ commands });
        expect(menu.activeItem).to.equal(null);
        let item = menu.addItem({ command: DEFAULT_CMD});
        menu.activeItem = item;
        expect(menu.activeItem).to.equal(item);
      });

      it('should set to `null` if the item cannot be activated', () => {
        let menu = new Menu({ commands });
        expect(menu.activeItem).to.equal(null);
        let item = menu.addItem({ type: 'separator' });
        menu.activeItem = item;
        expect(menu.activeItem).to.equal(null);
      });

    });

    describe('#activeIndex', () => {

      it('should get the index of the currently active menu item', () => {
        let menu = new Menu({ commands });
        let item =  menu.addItem({ command: DEFAULT_CMD });
        menu.activeItem = item;
        expect(menu.activeIndex).to.equal(0);
      });

      it('should add `p-mod-active` to the item', () => {
        let menu = new Menu({ commands });
        let item = menu.addItem({ command: DEFAULT_CMD });
        menu.activeItem = item;
        let tab = menu.contentNode.children[0] as HTMLElement;
        expect(tab.classList.contains('p-mod-active')).to.equal(true);
      });

      it('should be `-1` if no menu item is active', () => {
        let menu = new Menu({ commands });
        expect(menu.activeIndex).to.equal(-1);
        menu.addItem({ command: DEFAULT_CMD });
        expect(menu.activeIndex).to.equal(-1);
      });

      it('should set the currently active menu item index', () => {
        let menu = new Menu({ commands });
        expect(menu.activeIndex).to.equal(-1);
        menu.addItem({ command: DEFAULT_CMD });
        menu.activeIndex = 0;
        expect(menu.activeIndex).to.equal(0);
      });

      it('should set to `-1` if the item cannot be activated', () => {
        let menu = new Menu({ commands });
        let disposable = commands.addCommand('test', {
          execute: (args: JSONObject) => { return args; },
          isEnabled: (args: JSONObject) => { return false; },
        });
        menu.addItem({ command: 'test' });
        menu.activeIndex = 0;
        expect(menu.activeIndex).to.equal(-1);
        disposable.dispose();
      });

    });

    describe('#activateNextItem()', () => {

      it('should activate the next selectable item in the menu', () => {
        let disposable = commands.addCommand('test', {
          execute: (args: JSONObject) => { return args; },
          isVisible: (args: JSONObject) => { return false; },
        });
        let menu = new Menu({ commands });
        menu.addItem({ command: 'test' });
        menu.addItem({ command: DEFAULT_CMD });
        menu.activateNextItem();
        expect(menu.activeIndex).to.equal(1);
        disposable.dispose();
      });

      it('should set the index to `-1` if no item is selectable', () => {
        let menu = new Menu({ commands });
        menu.addItem({ type: 'separator' });
        menu.addItem({ type: 'separator' });
        menu.activateNextItem();
        expect(menu.activeIndex).to.equal(-1);
      });

    });

    describe('#activatePreviousItem()', () => {

      it('should activate the next selectable item in the menu', () => {
        let disposable = commands.addCommand('test', {
          execute: (args: JSONObject) => { return args; },
          isVisible: (args: JSONObject) => { return false; },
        });
        let menu = new Menu({ commands });
        menu.addItem({ command: 'test' });
        menu.addItem({ command: DEFAULT_CMD });
        menu.activatePreviousItem();
        expect(menu.activeIndex).to.equal(1);
        disposable.dispose();
      });

      it('should set the index to `-1` if no item is selectable', () => {
        let menu = new Menu({ commands });
        menu.addItem({ type: 'separator' });
        menu.addItem({ type: 'separator' });
        menu.activatePreviousItem();
        expect(menu.activeIndex).to.equal(-1);
      });

    });

    describe('#triggerActiveItem()', () => {

      it('should execute a command if it is the active item', () => {
        let called = false;
        let disposable = commands.addCommand('test', {
          execute: (args: JSONObject) => { called = true; }
        });
        let menu = new Menu({ commands });
        menu.addItem({ command: 'test' });
        Widget.attach(menu, document.body);
        menu.activeIndex = 0;
        menu.triggerActiveItem();
        expect(called).to.equal(true);
        disposable.dispose();
        menu.dispose();
      });

      it('should open a submenu and activate the first item', () => {
        let sub = new Menu({ commands });
        sub.addItem({ command: DEFAULT_CMD });
        let menu = new Menu({ commands });
        menu.addItem({ type: 'submenu', submenu: sub });
        Widget.attach(menu, document.body);
        menu.activeIndex = 0;
        menu.triggerActiveItem();
        expect(sub.parentMenu).to.equal(menu);
        expect(sub.activeIndex).to.equal(0);
        menu.dispose();
      });

      it('should be a no-op if the menu is not attached', () => {
        let sub = new Menu({ commands });
        sub.addItem({ command: DEFAULT_CMD });
        let menu = new Menu({ commands });
        menu.addItem({ type: 'submenu', submenu: sub });
        menu.activeIndex = 0;
        menu.triggerActiveItem();
        expect(sub.parentMenu).to.equal(null);
        expect(sub.activeIndex).to.equal(-1);
      });

      it('should be a no-op if there is no active item', () => {
        let sub = new Menu({ commands });
        sub.addItem({ command: DEFAULT_CMD });
        let menu = new Menu({ commands });
        menu.addItem({ type: 'submenu', submenu: sub });
        Widget.attach(menu, document.body);
        menu.triggerActiveItem();
        expect(sub.parentMenu).to.equal(null);
        expect(sub.activeIndex).to.equal(-1);
        menu.dispose();
      });

    });

    describe('#addItem()', () => {

      it('should add a menu item to the end of the menu', () => {
        let menu = new Menu({ commands });
        menu.addItem({});
        let item = menu.addItem({ command: 'test'});
        expect(item.command).to.equal('test');
        expect(menu.items[1]).to.equal(item);
      });

      it('should accept an existing menu item and convert them into a new menu item', () => {
        let menu = new Menu({ commands });
        let item = menu.addItem({ command: 'test' });
        let newItem = menu.addItem(item);
        expect(newItem).to.not.equal(item);
        expect(newItem.command).to.equal('test');
      });

    });

    describe('#insertItem()', () => {

      it('should insert a menu item into the menu at the specified index', () => {
        let menu = new Menu({ commands });
        menu.addItem({});
        let item = menu.insertItem(0, { command: 'test' });
        expect(menu.items[0]).to.equal(item);
      });

      it('should accept an options object to be converted into a menu item', () => {
        let menu = new Menu({ commands });
        menu.insertItem(0, {});
      });

      it('should clamp the index to the bounds of the items', () => {
        let menu = new Menu({ commands });
        menu.addItem({});
        let item = menu.insertItem(2, {});
        expect(menu.items[1]).to.equal(item);
        item = menu.insertItem(-1, {});
        expect(menu.items[0]).to.equal(item);
      });

      it('should close the menu if attached', () => {
        let menu = new Menu({ commands });
        menu.open(0, 0);
        let called = false;
        menu.aboutToClose.connect(() => { called = true; });
        menu.insertItem(0, {});
        expect(called).to.equal(true);
        menu.dispose();
      });

    });

    describe('#removeItem()', () => {

      it('should remove a menu item from the menu by value', () => {
        let menu = new Menu({ commands });
        let item = menu.addItem({});
        menu.removeItem(item);
        expect(menu.items.length).to.equal(0);
      });

      it('should return the index of the removed item', () => {
        let menu = new Menu({ commands });
        let item = menu.addItem({});
        expect(menu.removeItem(item)).to.equal(0);
      });

      it('should return `-1` if the item is not in the menu', () => {
        let menu = new Menu({ commands });
        let item = menu.addItem({});
        expect(menu.removeItem(item)).to.equal(0);
        expect(menu.removeItem(item)).to.equal(-1);
      });

      it('should close the menu if it is attached', () => {
        let menu = new Menu({ commands });
        let item = menu.addItem({});
        menu.open(0, 0);
        let called = false;
        menu.aboutToClose.connect(() => { called = true; });
        menu.removeItem(item);
        expect(called).to.equal(true);
        menu.dispose();
      });

    });

    describe('#removeItemAt()', () => {

      it('should remove a menu item from the menu by index', () => {
        let menu = new Menu({ commands });
        menu.addItem({});
        menu.removeItemAt(0);
        expect(menu.items.length).to.equal(0);
      });

      it('should return the item which was removed', () => {
        let menu = new Menu({ commands });
        let item = menu.addItem({});
        expect(menu.removeItemAt(0)).to.equal(item);
      });

      it('should return `null` if the index is out of range', () => {
        let menu = new Menu({ commands });
        let item = menu.addItem({});
        expect(menu.removeItemAt(0)).to.equal(item);
        expect(menu.removeItemAt(0)).to.equal(null);
      });

      it('should close the menu if it is attached', () => {
        let menu = new Menu({ commands });
        menu.addItem({});
        menu.open(0, 0);
        let called = false;
        menu.aboutToClose.connect(() => { called = true; });
        menu.removeItemAt(0);
        expect(called).to.equal(true);
        menu.dispose();
      });

    });

    describe('#clearItems()', () => {

      it('should remove all items from the menu', () => {
        let menu = new Menu({ commands });
        let disposable0 = commands.addCommand('test0', {
          execute: (args: JSONObject) => { return args; }
        });
        let disposable1 = commands.addCommand('test1', {
          execute: (args: JSONObject) => { return args; }
        });
        menu.addItem({ command: 'test0' });
        menu.addItem({ command: 'test1' });
        menu.activeIndex = 1;
        menu.clearItems();
        expect(menu.items.length).to.equal(0);
        expect(menu.activeIndex).to.equal(-1);
        disposable0.dispose();
        disposable1.dispose();
      });

      it('should close the menu if it is attached', () => {
        let menu = new Menu({ commands });
        let called = false;
        menu.aboutToClose.connect(() => { called = true; });
        Widget.attach(menu, document.body);
        menu.clearItems();
        expect(called).to.equal(true);
        menu.dispose();
      });

    });

    describe('#open()', () => {

      it('should open the menu at the specified location', () => {
        let menu = new Menu({ commands });
        menu.addItem({ command: DEFAULT_CMD });
        menu.open(10, 10);
        expect(menu.node.style.left).to.equal('10px');
        expect(menu.node.style.top).to.equal('10px');
        menu.dispose();
      });

      it('should be adjusted to fit naturally on the screen', () => {
        let menu = new Menu({ commands });
        menu.addItem({ command: DEFAULT_CMD });
        menu.open(-10, 10000);
        expect(menu.node.style.left).to.equal('0px');
        expect(menu.node.style.top).to.not.equal('10000px');
        menu.dispose();
      });

      it('should accept flags to force the location', () => {
        let menu = new Menu({ commands });
        menu.addItem({ command: DEFAULT_CMD });
        menu.open(10000, 10000, { forceX: true, forceY: true });
        expect(menu.node.style.left).to.equal('10000px');
        expect(menu.node.style.top).to.equal('10000px');
        menu.dispose();
      });

      it('should bail if already attached', () => {
        let menu = new Menu({ commands });
        menu.addItem({ command: DEFAULT_CMD });
        menu.open(10, 10);
        menu.open(100, 100);
        expect(menu.node.style.left).to.equal('10px');
        expect(menu.node.style.top).to.equal('10px');
        menu.dispose();
      });

      context('separators', () => {

        it('should hide leading separators', () => {
          let menu = new Menu({ commands });
          menu.addItem({ type: 'separator' });
          menu.addItem({ command: DEFAULT_CMD });
          menu.addItem({ type: 'separator' });
          menu.addItem({ type: 'submenu', submenu: new Menu({ commands }) });
          menu.open(0, 0);
          let seps = menu.node.getElementsByClassName('p-type-separator');
          expect(seps.length).to.equal(2);
          expect(seps[0].classList.contains('p-mod-hidden')).to.equal(true);
          expect(seps[1].classList.contains('p-mod-hidden')).to.equal(false);
          menu.dispose();
        });

        it('should hide trailing separators', () => {
          let menu = new Menu({ commands });
          menu.addItem({ command: DEFAULT_CMD });
          menu.addItem({ type: 'separator' });
          menu.addItem({ type: 'submenu', submenu: new Menu({ commands }) });
          menu.addItem({ type: 'separator' });
          menu.open(0, 0);
          let seps = menu.node.getElementsByClassName('p-type-separator');
          expect(seps.length).to.equal(2);
          expect(seps[0].classList.contains('p-mod-hidden')).to.equal(false);
          expect(seps[1].classList.contains('p-mod-hidden')).to.equal(true);
          menu.dispose();
        });

        it('should hide consecutive separators', () => {
          let menu = new Menu({ commands });
          menu.addItem({ command: DEFAULT_CMD });
          menu.addItem({ type: 'separator' });
          menu.addItem({ type: 'separator' });
          menu.addItem({ type: 'submenu', submenu: new Menu({ commands }) });
          menu.open(0, 0);
          let seps = menu.node.getElementsByClassName('p-type-separator');
          expect(seps.length).to.equal(2);
          expect(seps[0].classList.contains('p-mod-hidden')).to.equal(false);
          expect(seps[1].classList.contains('p-mod-hidden')).to.equal(true);
          menu.dispose();
        });

      });

    });

    describe('#handleEvent()', () => {

      let menu: Menu;

      beforeEach(() => {
        menu = new Menu({ commands });
      });

      afterEach(() => {
        menu.dispose();
      });

      context('keydown', () => {

        it('should trigger the active item on enter', () => {
          let called = false;
          let disposable = commands.addCommand('test', {
            execute: (args: JSONObject) => { called = true; }
          });
          menu.addItem({ command: 'test' });
          menu.activeIndex = 0;
          menu.open(0, 0);
          simulate(menu.node, 'keydown', { keyCode: 13 });
          expect(called).to.equal(true);
          menu.dispose();
          disposable.dispose();
        });

        it('should close the menu on escape', () => {
          let called = false;
          menu.aboutToClose.connect(() => { called = true; });
          menu.open(0, 0);
          simulate(menu.node, 'keydown', { keyCode: 27 });
          expect(called).to.equal(true);
          menu.dispose();
        });

        it('should close the menu on left arrow if there is a parent menu', () => {
          let sub = new Menu({ commands });
          let called = false;
          sub.addItem({ command: DEFAULT_CMD });
          menu.addItem({ type: 'submenu', submenu: sub });
          menu.open(0, 0);
          menu.activateNextItem();
          menu.triggerActiveItem();
          sub.aboutToClose.connect(() => { called = true; });
          simulate(sub.node, 'keydown', { keyCode: 37 });
          expect(called).to.equal(true);
          menu.dispose();
        });

        it('should activate the previous item on up arrow', () => {
          menu.addItem({ command: DEFAULT_CMD });
          let disposable = commands.addCommand('test', {
            execute: (args: JSONObject) => { return args; }
          });
          menu.addItem({ command: 'test' });
          menu.open(0, 0);
          simulate(menu.node, 'keydown', { keyCode: 38 });
          expect(menu.activeIndex).to.equal(1);
          menu.dispose();
          disposable.dispose();
        });

        it('should trigger the active item on right arrow if the item is a submenu', () => {
          let sub = new Menu({ commands });
          sub.addItem({ command: DEFAULT_CMD });
          menu.addItem({ type: 'submenu', submenu: sub });
          menu.open(0, 0);
          menu.activateNextItem();
          simulate(menu.node, 'keydown', { keyCode: 39 });
          expect(menu.childMenu).to.equal(sub);
          menu.dispose();
        });

        it('should activate the next itom on down arrow', () => {
          menu.addItem({ command: DEFAULT_CMD });
          let disposable = commands.addCommand('test', {
            execute: (args: JSONObject) => { return args; }
          });
          menu.addItem({ command: 'test' });
          menu.open(0, 0);
          simulate(menu.node, 'keydown', { keyCode: 40 });
          expect(menu.activeIndex).to.equal(0);
          menu.dispose();
          disposable.dispose();
        });

        it('should activate the first matching mnemonic', () => {
          let sub0 = new Menu({ commands });
          sub0.title.label = 'foo';
          sub0.title.mnemonic = 0;
          let disposable0 = commands.addCommand('test0', {
            execute: (args: JSONObject) => { return args; }
          });
          sub0.addItem({ command: 'test0' });

          let sub1 = new Menu({ commands });
          sub1.title.label = 'oof';
          sub1.title.mnemonic = 2;
          let disposable1 = commands.addCommand('test1', {
            execute: (args: JSONObject) => { return args; }
          });
          sub1.addItem({ command: 'test1' });

          menu.addItem({ type: 'submenu', submenu: sub0 });
          menu.addItem({ type: 'separator' });
          menu.addItem({ type: 'submenu', submenu: sub1 });
          menu.addItem({ type: 'submenu', submenu: new Menu({ commands }) });

          menu.open(0, 0);
          simulate(menu.node, 'keydown', { keyCode: 70 });
          expect(menu.activeIndex).to.equal(0);

          menu.dispose();
          disposable0.dispose();
          disposable1.dispose();
        });

        it('should trigger a lone matching mnemonic', () => {
          let called = false;
          let disposable = commands.addCommand('test', {
            execute: (args: JSONObject) => { called = true; },
            label: 'foo',
            mnemonic: 1
          });
          menu.addItem({ command: 'test' });

          menu.open(0, 0);
          simulate(menu.node, 'keydown', { keyCode: 79 });  // O
          expect(called).to.equal(true);

          menu.dispose();
          disposable.dispose();
        });

        it('should activate an item with no matching mnemonic, but matching first character', () => {
          let called = false;
          let disposable = commands.addCommand('test', {
            execute: (args: JSONObject) => { called = true; },
            label: 'foo'
          });
          menu.addItem({ command: 'test' });

          menu.open(0, 0);
          simulate(menu.node, 'keydown', { keyCode: 70 });  // F
          expect(menu.activeIndex).to.equal(0);
          expect(called).to.equal(false);

          menu.dispose();
          disposable.dispose();
        });

      });

      context('mouseup', () => {

        it('should trigger the active item', () => {
          let called = false;
          let disposable = commands.addCommand('test', {
            execute: (args: JSONObject) => { called = true; },
          });
          menu.addItem({ command: 'test' });
          menu.activeIndex = 0;
          menu.open(0, 0);
          simulate(menu.node, 'mouseup');
          expect(called).to.equal(true);
          menu.dispose();
          disposable.dispose();
        });

        it('should bail if not a left mouse button', () => {
          let called = false;
          let disposable = commands.addCommand('test', {
            execute: (args: JSONObject) => { called = true; },
          });
          menu.addItem({ command: 'test' });
          menu.activeIndex = 0;
          menu.open(0, 0);
          simulate(menu.node, 'mouseup', { button: 1 });
          expect(called).to.equal(false);
          menu.dispose();
          disposable.dispose();
        });

      });

      context('mousemove', () => {

        it('should set the active index', () => {
          menu.addItem({ command: DEFAULT_CMD });
          menu.open(0, 0);
          let node = menu.node.getElementsByClassName('p-Menu-item')[0];
          let rect = node.getBoundingClientRect();
          simulate(menu.node, 'mousemove', { clientX: rect.left, clientY: rect.top });
          expect(menu.activeIndex).to.equal(0);
          menu.dispose();
        });

        it('should open a child menu after a timeout', (done) => {
          let sub = new Menu({ commands });
          sub.addItem({ command: DEFAULT_CMD });
          sub.title.label = 'LABEL';
          menu.addItem({ type: 'submenu', submenu: sub });
          menu.open(0, 0);
          let node = menu.node.getElementsByClassName('p-Menu-item')[0];
          let rect = node.getBoundingClientRect();
          simulate(menu.node, 'mousemove', { clientX: rect.left, clientY: rect.top });
          expect(menu.activeIndex).to.equal(0);
          expect(sub.isAttached).to.equal(false);
          setTimeout(() => {
            expect(sub.isAttached).to.equal(true);
            menu.dispose();
            done();
          }, 500);
        });

        it('should close an open sub menu', (done) => {
          let sub = new Menu({ commands });
          sub.addItem({ command: DEFAULT_CMD });
          sub.title.label = 'LABEL';
          menu.addItem({ command: DEFAULT_CMD });
          menu.addItem({ type: 'submenu', submenu: sub });
          menu.open(0, 0);
          menu.activeIndex = 1;
          menu.triggerActiveItem();
          let node = menu.node.getElementsByClassName('p-Menu-item')[0];
          let rect = node.getBoundingClientRect();
          simulate(menu.node, 'mousemove', { clientX: rect.left, clientY: rect.top });
          expect(menu.activeIndex).to.equal(0);
          expect(sub.isAttached).to.equal(true);
          setTimeout(() => {
            expect(sub.isAttached).to.equal(false);
            menu.dispose();
            done();
          }, 500);
        });

      });

      context('mouseleave', () => {

        it('should reset the active index', () => {
          let sub = new Menu({ commands });
          sub.addItem({ command: DEFAULT_CMD });
          sub.title.label = 'LABEL';
          menu.addItem({ type: 'submenu', submenu: sub });
          menu.open(0, 0);
          let node = menu.node.getElementsByClassName('p-Menu-item')[0];
          let rect = node.getBoundingClientRect();
          simulate(menu.node, 'mousemove', { clientX: rect.left, clientY: rect.top });
          expect(menu.activeIndex).to.equal(0);
          simulate(menu.node, 'mouseleave', { clientX: rect.left, clientY: rect.top });
          expect(menu.activeIndex).to.equal(-1);
          menu.dispose();
        });

      });

      context('mousedown', () => {

        it('should not close the menu if on a child node', () => {
          menu.addItem({ command: DEFAULT_CMD });
          menu.open(0, 0);
          let called = false;
          menu.aboutToClose.connect(() => { called = true; });
          let rect = menu.node.getBoundingClientRect();
          simulate(menu.node, 'mousedown', { clientX: rect.left, clientY: rect.top });
          expect(called).to.equal(false);
          menu.dispose();
        });

        it('should close the menu if not on a child node', () => {
          menu.addItem({ command: DEFAULT_CMD });
          menu.open(0, 0);
          let called = false;
          menu.aboutToClose.connect(() => { called = true; });
          simulate(menu.node, 'mousedown', { clientX: -10 });
          expect(called).to.equal(true);
          menu.dispose();
        });

      });

    });

    describe('#onAfterAttach()', () => {

      it('should add event listeners', () => {
        let menu = new LogMenu({ commands });
        let node = menu.node;
        Widget.attach(menu, document.body);
        expect(menu.methods.indexOf('onAfterAttach')).to.not.equal(-1);
        simulate(node, 'keydown');
        expect(menu.events.indexOf('keydown')).to.not.equal(-1);
        simulate(node, 'mouseup');
        expect(menu.events.indexOf('mouseup')).to.not.equal(-1);
        simulate(node, 'mousemove');
        expect(menu.events.indexOf('mousemove')).to.not.equal(-1);
        simulate(node, 'mouseenter');
        expect(menu.events.indexOf('mouseenter')).to.not.equal(-1);
        simulate(node, 'mouseleave');
        expect(menu.events.indexOf('mouseleave')).to.not.equal(-1);
        simulate(node, 'contextmenu');
        expect(menu.events.indexOf('contextmenu')).to.not.equal(-1);
        simulate(document.body, 'mousedown');
        expect(menu.events.indexOf('mousedown')).to.not.equal(-1);
        menu.dispose();
      });

    });

    describe('#onBeforeDetach()', () => {

      it('should remove event listeners', () => {
        let menu = new LogMenu({ commands });
        let node = menu.node;
        Widget.attach(menu, document.body);
        Widget.detach(menu);
        expect(menu.methods.indexOf('onBeforeDetach')).to.not.equal(-1);
        simulate(node, 'keydown');
        expect(menu.events.indexOf('keydown')).to.equal(-1);
        simulate(node, 'mouseup');
        expect(menu.events.indexOf('mouseup')).to.equal(-1);
        simulate(node, 'mousemove');
        expect(menu.events.indexOf('mousemove')).to.equal(-1);
        simulate(node, 'mouseenter');
        expect(menu.events.indexOf('mouseenter')).to.equal(-1);
        simulate(node, 'mouseleave');
        expect(menu.events.indexOf('mouseleave')).to.equal(-1);
        simulate(node, 'contextmenu');
        expect(menu.events.indexOf('contextmenu')).to.equal(-1);
        simulate(document.body, 'mousedown');
        expect(menu.events.indexOf('mousedown')).to.equal(-1);
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should be called prior to opening', () => {
        let menu = new LogMenu({ commands });
        menu.open(0, 0);
        expect(menu.methods.indexOf('onUpdateRequest')).to.not.equal(-1);
        menu.dispose();
      });

    });

    describe('#onCloseRequest()', () => {

      it('should be called when the menu is closed', () => {
        let menu = new LogMenu({ commands });
        menu.open(0, 0);
        menu.close();
        expect(menu.methods.indexOf('onCloseRequest')).to.not.equal(-1);
        menu.dispose();
      });

      it('should reset the active index', () => {
        let menu = new LogMenu({ commands });
        menu.addItem({ command: DEFAULT_CMD });
        menu.activeIndex = 0;
        menu.open(0, 0);
        menu.close();
        expect(menu.methods.indexOf('onCloseRequest')).to.not.equal(-1);
        expect(menu.activeIndex).to.equal(-1);
        menu.dispose();
      });

      it('should close any open child menu', () => {
        let sub = new Menu({ commands });
        sub.addItem({ command: DEFAULT_CMD });
        let menu = new LogMenu({ commands });
        menu.addItem({ type: 'submenu', submenu: sub });
        menu.open(0, 0);
        menu.activateNextItem();
        menu.triggerActiveItem();
        expect(menu.childMenu).to.equal(sub);
        menu.close();
        expect(menu.methods.indexOf('onCloseRequest')).to.not.equal(-1);
        expect(menu.childMenu).to.equal(null);
        menu.dispose();
      });

      it('should remove the menu from its parent and activate the parent', (done) => {
        let sub = new LogMenu({ commands });
        sub.addItem({ command: DEFAULT_CMD });
        let menu = new LogMenu({ commands });
        menu.addItem({ type: 'submenu', submenu: sub });
        menu.open(0, 0);
        menu.activateNextItem();
        menu.triggerActiveItem();
        expect(menu.childMenu).to.equal(sub);
        sub.close();
        expect(sub.methods.indexOf('onCloseRequest')).to.not.equal(-1);
        expect(menu.childMenu).to.equal(null);
        requestAnimationFrame(() => {
          expect(document.activeElement).to.equal(menu.node);
          menu.dispose();
          done();
        });
      });

      it('should emit the `aboutToClose` signal if attached', () => {
        let menu = new LogMenu({ commands });
        let called = false;
        menu.open(0, 0);
        menu.aboutToClose.connect((sender, args) => {
          expect(sender).to.equal(menu);
          expect(args).to.equal(void 0);
          called = true;
        });
        menu.close();
        expect(menu.methods.indexOf('onCloseRequest')).to.not.equal(-1);
        expect(called).to.equal(true);
        menu.dispose();
      });

    });

    describe('.Renderer', () => {

      let menu = new LogMenu({ commands });

      const renderer = Menu.defaultRenderer;
      const data: IRenderData = {
        item: menu.addItem({ command: DEFAULT_CMD }),
        active: true,
        collapsed: false
      };


      describe('#renderItem()', () => {

        it('should render the virtual element for a menu item', () => {
          let node = VirtualDOM.realize(renderer.renderItem(data));
          expect(node.getElementsByClassName('p-Menu-itemLabel').length).to.equal(1);
          expect(node.getElementsByClassName('p-Menu-itemShortcut').length).to.equal(1);
          expect(node.getElementsByClassName('p-Menu-itemSubmenuIcon').length).to.equal(1);
          expect(node.classList.contains('p-Menu-item')).to.equal(true);
          expect(node.classList.contains('p-mod-disabled')).to.equal(false);
        });

      });

      describe('#renderIcon()', () => {

        it('should render the icon element for a menu item', () => {
          let node = VirtualDOM.realize(renderer.renderIcon(data));
          expect(node.className).to.contain('p-Menu-itemIcon');
        });

      });

      describe('#renderLabel', () => {

        it('should render the label element for a menu item', () => {
          let node = VirtualDOM.realize(renderer.renderLabel(data));
          expect(node.className).to.contain('p-Menu-itemLabel');
          expect(node.textContent).to.be('LABEL');
        });

      });

      describe('#renderShortcut()', () => {

        it('should render the shortcut element for a menu item', () => {
          let node = VirtualDOM.realize(renderer.renderShortcut(data));
          expect(node.className).to.contain('p-Menu-itemShortcut');
          expect(node.textContent).to.be('A');
        });

      });

      describe('#renderSubmenu()', () => {

        it('should render the submenu icon element for a menu item', () => {
          let node = VirtualDOM.realize(renderer.renderSubmenu(data));
          expect(node.className).to.contain('p-Menu-itemSubmenuIcon');
        });

      });

      describe('#createItemClass()', () => {

        it('should create the class name for a menu item', () => {
          let value = renderer.createItemClass(data);
          expect(value).to.contain('p-Menu-item');
          expect(value).to.not.contain('p-mod-disabled');
          expect(value).to.contain('p-mod-toggled');
          expect(value).to.not.contain('p-mod-hidden');
          expect(value).to.not.contain('p-mod-active');
          expect(value).to.not.contain('p-mod-collapsed');
          expect(value).to.contain('bar');
        });

      });

      describe('#createItemDataset()', () => {

        it('should create the dataseet for a menu item', () => {
          let dataset = renderer.createItemDataset(data);
          expect(dataset['command']).to.equal(DEFAULT_CMD);
          expect(dataset['type']).to.equal('command');
        });

      });

      describe('#createIconClass()', () => {

        it('should create the class name for a menu item icon', () => {
          let value = renderer.createIconClass(data);
          expect(value).to.contain('p-Menu-itemIcon');
          expect(value).to.contain('foo');
        });

      });

      describe('#formatLabel()', () => {

        it('should create the render content for the label node', () => {
          let parts = VirtualDOM.realize(renderer.formatLabel(data));
          expect(node.getElementsByClassName('p-Menu-itemMnemonic').length).to.equal(1);
        });

      });

      describe('#formatShortcut()', () => {

        it('should create the render content for the shortcut node', () => {
          let node = VirtualDOM.realize(renderer.formatLabel(data));
          expect
        });

      });

    });

    describe('.defaultRenderer', () => {

      it('should be an instance of `Renderer`', () => {
        expect(Menu.defaultRenderer).to.be.an.instanceof(Menu.Renderer);
      });

    });

  });

});
