import { camelize, kebabize } from './util.js';

type Constructor = new (...args: any[]) => {};

type WannabeAttribute = {
  propertyKey: string;
  watchFn?: string;
};

/**
 * Will add an attribute to the webcomponent that has
 * getters and setters
 */
export function Attribute({ observed }: { observed?: boolean } = {}) {
  return function (target: any, propertyKey: string) {
    const attribute = { propertyKey };
    target.componentAttributes ??= [];

    const isIn = target.componentAttributes.find((a: WannabeAttribute) => a.propertyKey === attribute.propertyKey);

    if (!isIn) {
      target.componentAttributes.push(attribute);
    }

    if (observed) {
      target.observedAttributes = [...new Set([...(target.observedAttributes ?? []), kebabize(propertyKey)])];
    }
  };
}

/**
 * Attach this decorator to a function that you want to
 * execute when the given attribute or array of attributes change
 */
export function Watch(attributes: string | string[] = []) {
  return function (target: any, propertyKey: string) {
    try {
      attributes = !Array.isArray(attributes) ? [attributes] : attributes;
      attributes.forEach((attr) => {
        Attribute({ observed: true })(target, attr);
        const componentAttribute: WannabeAttribute = target.componentAttributes.find(
          (a: WannabeAttribute) => a.propertyKey === attr
        );

        componentAttribute.watchFn = propertyKey;
      });
    } catch (e) {
      console.error(e);
    }
  };
}

/**
 * 🚀 Will skyrocket your webcomponent by combining the
 * magic of public attributes, observability and callbacks on attribute change
 * into a powerhouse of a webcomponent
 */
export function Component<T extends Constructor>(Base: T) {
  return class Component extends Base {
    [key: string]: any;

    static get observedAttributes() {
      return Base.prototype.observedAttributes ?? [];
    }

    constructor(...args: any[]) {
      super();

      const props = args[0] ?? {};

      Object.entries(props).forEach(([key, value]) => {
        const cK = camelize(key);

        const isAttribute = Base.prototype.componentAttributes.find((a: WannabeAttribute) => a.propertyKey === cK);
        const isMember = cK in this;

        if (!isAttribute && isMember) {
          this[cK] = value;
        }
      });

      Base.prototype.componentAttributes?.forEach((attribute: WannabeAttribute) => {
        const { propertyKey } = attribute;
        const propertyIsBoolean = typeof this[propertyKey] === 'boolean';

        const attributeDefault =
          props[kebabize(propertyKey)] || Object.getOwnPropertyDescriptor(this, propertyKey)?.value;

        Object.defineProperty(this, propertyKey, {
          get: () =>
            propertyIsBoolean
              ? this.hasAttribute(kebabize(propertyKey))
              : this.getAttribute(kebabize(propertyKey)) ?? attributeDefault,
          set: (value: any) => {
            if (
              value === null ||
              value === undefined ||
              (propertyIsBoolean && (value === false || value === 'false'))
            ) {
              this.removeAttribute(kebabize(propertyKey));
            } else {
              this.setAttribute(kebabize(propertyKey), propertyIsBoolean ? '' : value);
            }
          },
        });
      });
    }

    async attributeChangedCallback(attributeName: string, oldValue: any, newValue: any) {
      if (oldValue !== newValue) {
        const watchFn = Base.prototype.componentAttributes?.find(
          (a: WannabeAttribute) => a.propertyKey === camelize(attributeName)
        )?.watchFn;

        await this[watchFn]?.apply(this, [oldValue, newValue]);
      }
    }
  };
}
