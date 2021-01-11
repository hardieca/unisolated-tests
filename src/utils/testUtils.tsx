/* eslint-disable no-restricted-imports */
import React from "react";
import {
  render,
  RenderOptions,
  RenderResult,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";


/**
 * Wrapper component that supplies providers for our tests
 * @param props Props
 * @param props.children Children
 * @returns our wrapped component with necessary provders
 */
const Wrapper: React.FC = ({ children }) => {
  return (
      <MemoryRouter>
          {children}
      </MemoryRouter>
  );
};

/**
 * Wraps testing-libraries render function so that we can centralize the
 * supply of providers to our test
 * @param ui - The React element to render
 * @param options - rendering options
 * @returns the result of the render
 */
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "queries">,
): RenderResult => render(ui, { wrapper: Wrapper, ...options });

/**
 * Utility method that extracts query utilities from the form group that
 * encompasses the form control element of interest
 * @param el a form element control
 * @returns query utilities for the form group element
 */
export const getUtilsFromFormGroup = (el: HTMLElement) => {
  const selector = "div.formGroup";

  const formGroup = el.closest(selector);
  const utils = within(formGroup! as HTMLElement);
  return utils;
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
