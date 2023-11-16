import { beforeEach } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { Attribute, Component, Watch } from './index.ts';
import { expect } from 'vitest';

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

  it('should prepare observerd attribute', () => {
    Attribute({ observed: true })(target, 'test');

    expect(target.componentAttributes).toEqual([{ propertyKey: 'test' }]);
    expect(target.observedAttributes).toEqual(['test']);
  });

  it('should prepare a watched function member', () => {
    Watch('test')(target, 'watchedFn');

    expect(target.componentAttributes).toEqual([{ propertyKey: 'test', watchFn: 'watchedFn' }]);
    expect(target.observedAttributes).toEqual(['test']);
  });

  it('should create a webcomponent class', () => {
    const c = class Element extends HTMLElement {};
    Attribute({ observed: true })(c.prototype, 'fooBar');
    Attribute({ observed: true })(c.prototype, 'bacon');

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
