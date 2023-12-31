# WebC.js

This project aims at easing the process of creating a custom webcomponent with typescript.

If you don't know what a custom webcomponent is, i highly recommend getting into that topic. A good starting point is here at [web.dev](https://web.dev/articles/custom-elements-v1).

## Install

```sh
pnpm i -D webcjs
```

## Usage

Usually you're trying to reflect your component attributes with getters and setters. Along with that you have observedAttributes that trigger the attributeChangedCallback whenever one of the observed attributes changes its value.

The small WebC.js lib aims at making that process easier giving you some kind of frameworkish look.

```ts
@Component
class MyComponent extends HTMLElement {
  @Attribute()
  someAttribute = "defaultValue";

  @Attribute({ observed: true })
  someObservedAttribute = "";

  @Attribute()
  someBooleanAttribute = false;

  constructor() {
    ...
  }

  connectedCallback() {
    ...
  }

  @Watch('someObservedAttribute')
  someFunction(oldValue, newValue) {
    // call me when "someObservedAttribute" changes
  }

  ...
}

customElements.define('my-component', MyComponent)
```

From the outside you can reach your components attributes like the following:

```ts
const myComp = document.querySelector('my-component');
const asMember = myComp.someAttribute;
const asFunction = myComp.getAttribute('some-attribute');
```

With this approach you don't need to add repetitive code:

- getters & setters
- static observedAttributes
- attributeChangedCallback

Without the decorators your webcomponent would look something like this:

```ts
class MyComponent extends HTMLElement {
  static get observedAttributes() {
    return ['some-observed-attribute'];
  }

  constructor() {
    ...
  }

  connectedCallback() {
    ...
  }

  get someAttribute() {
    return this.getAttribute('some-attribute');
  }

  set someObservedAttribute(value) {
    if ( value ) {
      this.setAttribute('some-attribute', value);
    } else {
      this.removeAttribute('some-attribute');
    }
  }

  get someBooleanAttribute() {
    return this.hasAttribute('some-boolean-attribute');
  }

  set someBooleanAttribute(value) {
    if ( value ) {
      this.setAttribute('some-boolean-attribute', '');
    } else {
      this.removeAttribute('some-boolean-attribute');
    }
  }

  get someObservedAttribute() {
    return this.getAttribute('some-observed-attribute');
  }

  set someObservedAttribute(value) {
    if ( value ) {
      this.setAttribute('some-observed-attribute', value);
    } else {
      this.removeAttribute('some-observed-attribute');
    }
  }

  attributeChangedCallback(attributeName, oldVal, newVal) {
    if ( attributeName === 'some-observed-attribute') {
      this.someFunction();
    }
  }

  someFunction() {
    // call me when "someObservedAttribute" changes
  }
}
```
