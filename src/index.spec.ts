import { expect, describe, it, beforeEach } from 'vitest';
import { Attribute, Component, Watch } from './index.ts';

describe('Decorators', () => {
  let target;

  beforeEach(() => {
    target = class Test {};
  });

  it('should prepare unobserved attribute', () => {
    Attribute()(target, 'test');

    expect(target.componentAttributes).toEqual([{ propertyKey: 'test' }]);
    expect(target.observedAttributes).toBeUndefined();
  });

  it('should prepare observed attribute', () => {
    Watch('test')(target, 'watcherFn');

    expect(target.componentAttributes).toEqual([{ propertyKey: 'test', watchFn: 'watcherFn' }]);
  });

  it('should create a webcomponent class', () => {
    const c = class Element extends HTMLElement {};
    Watch('fooBar')(c.prototype, 'fooBarWatcherFn');
    Watch('bacon')(c.prototype, 'baconWatcherFn');

    const comp = Component(c);

    expect(comp.prototype instanceof Element).toBe(true);
    expect(comp.observedAttributes).toEqual(['foo-bar', 'bacon']);

    const compObj = new comp();

    const getters = Object.entries(Object.getOwnPropertyDescriptors(compObj))
      .filter(([key, descriptor]) => typeof descriptor.get === 'function')
      .map(([key]) => key);

    expect(getters).toEqual(['fooBar', 'bacon']);

    compObj.setAttribute('foo-bar', 'baz');
    expect(compObj.fooBar).toEqual('baz');
  });
});
