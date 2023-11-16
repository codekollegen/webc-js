# WebC.js

This project aims at easing the process of creating a custom webcomponent with typescript.

If you don't know what a custom webcomponent is, i highly recommend getting into that topic. A good starting point is here at [web.dev](https://web.dev/articles/custom-elements-v1).

## Install

```sh
pnpm i -D webc-js
```

## Usage

Usually you're trying to reflect your component attributes with getters and setters. Along with that you have observedAttributes that trigger the attributeChangedCallback whenever one of the observed attributes changes its value.

The small WebC.js lib aims at making that process easier giving you some kind of frameworkish look.

```ts
@Component
class MyComponent extends HTMLElement {
  @Attribute()
  someAttribute;

  @Attribute({ observed: true })
  someObservedAttribute;

  constructor() {
    ...
  }

  connectedCallback() {
    ...
  }

  @Watch('someObservedAttribute')
  someFunction() {
    // call me when "someObservedAttribute" changes
  }

  ...
}
```
