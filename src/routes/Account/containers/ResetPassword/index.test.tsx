import userEvent from "@testing-library/user-event";
import React from "react";
import { Auth } from "aws-amplify";
import { ResetPassword } from "src/routes/Account/containers/ResetPassword";
import { render, screen, getUtilsFromFormGroup } from "src/utils/testUtils";
import { AmplifyError } from "src/routes/Account/utilities/AmplifyError";

const mockHistoryPush = jest.fn();

// Mock out useLocation so we can supply an expected querystring param
// Mock out useHistory so we can spy on it and assert user get "redirected" as expected
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useLocation: () => ({
    search: "?username=someusername",
  }),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

const assertErrorShown = async (
  element: HTMLElement,
  errorMessage = /required/,
) => {
  const utils = getUtilsFromFormGroup(element);
  expect(
    await utils.findByRole("alert", {
      name: errorMessage,
    }),
  ).toBeInTheDocument();
};

const renderResetPassword = async () => {
  render(<ResetPassword />);

  const passwordTextbox = await screen.findByLabelText(
    /Password \/ Mot de passe/i,
  );
  const confirmPasswordTextbox = await screen.findByLabelText(
    /^Confirm Password/i,
  );
  const codeTextbox = await screen.findByLabelText(/^code/i);
  const submitButton = await screen.findByRole("button", {
    name: /submit/gi,
  });

  return {
    passwordTextbox,
    confirmPasswordTextbox,
    codeTextbox,
    submitButton,
  };
};

describe("ResetPassword", () => {
  afterEach((): void => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  test("shows errors when required fields are missing", async () => {
    const {
      passwordTextbox,
      confirmPasswordTextbox,
      codeTextbox,
      submitButton,
    } = await renderResetPassword();

    userEvent.tab();
    submitButton.click();

    assertErrorShown(passwordTextbox);
    assertErrorShown(confirmPasswordTextbox);
    assertErrorShown(codeTextbox);
  });
  test("should show error if password doesn't conform to policy", async () => {
    const forgotPasswordMock = jest.spyOn(Auth, "forgotPasswordSubmit");
    forgotPasswordMock.mockImplementation(() =>
      Promise.reject(new AmplifyError("InvalidPasswordException")),
    );

    const {
      passwordTextbox,
      confirmPasswordTextbox,
      codeTextbox,
      submitButton,
    } = await renderResetPassword();

    userEvent.type(passwordTextbox, "somepassword");
    userEvent.type(confirmPasswordTextbox, "somepassword");
    userEvent.type(codeTextbox, "123456");
    userEvent.click(submitButton);

    expect(
      await screen.findByRole("alert", {
        name: "Password does not conform to policy",
      }),
    ).toBeInTheDocument();
  });
});
