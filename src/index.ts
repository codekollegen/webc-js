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

    /**
     * Add the attribute name to a temporary array called componentAttributes
     * that is later used by the Component decorator
     */
    if (!isIn) {
      target.componentAttributes.push(attribute);
    }

    if (observed) {
      /**
       * If observed, add the attribute name to a temporary array called
       * observedAttributes that is later used by the Component decorator
       */
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

        /**
         * Enhance the object in the temporary array called componentAttributes
         * with a property called watchFn. This property is later used by the
         * Component decorator
         */
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
  /**
   * Return a new class that extends the given Base class
   * which acts as the webcomponent
   */
  return class Component extends Base {
    [key: string]: any;

    /**
     * The static observedAttributes getter is used by the webcomponent
     * to fire the attributeChangedCallback whenever an attribute
     * in the array changes its value
     */
    static get observedAttributes() {
      return Base.prototype.observedAttributes ?? [];
    }

    constructor(...args: any[]) {
      super();

      const props = args[0] ?? {};

      /**
       * If additional props are handed into the component add
       * them as properties to the component
       */
      Object.entries(props).forEach(([key, value]) => {
        const cK = camelize(key);

        const isAttribute = Base.prototype.componentAttributes.find((a: WannabeAttribute) => a.propertyKey === cK);
        const isMember = cK in this;

        if (!isAttribute && isMember) {
          this[cK] = value;
        }
      });

      /**
       * Create getters and setters for each attribute that is
       * defined in the componentAttributes array (which was created
       * by the Attribute decorator before)
       */
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

    /**
     * The attributeChangedCallback is called whenever an attribute
     * in the observedAttributes array changes its value
     */
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
