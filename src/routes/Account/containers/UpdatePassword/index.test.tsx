import userEvent from "@testing-library/user-event";
import React from "react";
import { Auth } from "aws-amplify";
import { UpdatePassword } from "src/routes/Account/containers/UpdatePassword";
import {
  render,
  screen,
  waitFor,
  getUtilsFromFormGroup,
} from "src/utils/testUtils";
import { ERROR_CODES } from "src/constants/ERROR_CODES";
import { AmplifyError } from "src/routes/Account/utilities/AmplifyError";

const mockHistoryPush = jest.fn();

// Mock out useLocation so we can supply an expected querystring param to UpdatePassword
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

const renderUpdatePassword = async () => {
  render(<UpdatePassword />);

  const oldPasswordTextbox = await screen.findByLabelText(/old password/gi);
  const newPasswordTextbox = await screen.findByLabelText(/new password/gi);
  const confirmNewPasswordTextbox = await screen.findByLabelText(
    /confirm password/gi,
  );
  const submitButton = await screen.findByRole("button", {
    name: /submit/gi,
  });

  return {
    oldPasswordTextbox,
    newPasswordTextbox,
    confirmNewPasswordTextbox,
    submitButton,
  };
};

describe("UpdatePassword", () => {
  test("should show error if unknown error is encountered", async () => {
    // Simulate Amplify throwing an unexpected error
    const signInSpy = jest.spyOn(Auth, "signIn");
    signInSpy.mockImplementation(() => {
      throw new Error();
    });

    const {
      oldPasswordTextbox,
      newPasswordTextbox,
      confirmNewPasswordTextbox,
      submitButton,
    } = await renderUpdatePassword();

    await userEvent.type(oldPasswordTextbox, "oldpassword");
    await userEvent.type(newPasswordTextbox, "badpassword");
    await userEvent.type(confirmNewPasswordTextbox, "badpassword");
    userEvent.click(submitButton);

    const alert = await screen.findByRole("alert", {
      name: /an unknown error has occurred/gi,
    });
    expect(signInSpy).toHaveBeenCalledWith("someusername", "oldpassword");
    expect(alert).toBeInTheDocument();
  });
  test("should show error if username or password is incorrect", async () => {
    const signInSpy = jest.spyOn(Auth, "signIn");
    signInSpy.mockImplementation(() =>
      Promise.resolve({
        challengeName: "NEW_PASSWORD_REQUIRED",
      }),
    );

    const completeNewPasswordSpy = jest.spyOn(Auth, "completeNewPassword");
    // Simulate password policy violation
    completeNewPasswordSpy.mockImplementation(() => {
      throw new AmplifyError(ERROR_CODES.NOT_AUTHORIZED_EXCEPTION);
    });

    const {
      oldPasswordTextbox,
      newPasswordTextbox,
      confirmNewPasswordTextbox,
      submitButton,
    } = await renderUpdatePassword();

    await userEvent.type(oldPasswordTextbox, "oldpassword");
    await userEvent.type(newPasswordTextbox, "badpassword");
    await userEvent.type(confirmNewPasswordTextbox, "badpassword");
    userEvent.click(submitButton);

    const alert = await screen.findByRole("alert", {
      name: /username or password is incorrect/gi,
    });
    expect(signInSpy).toHaveBeenCalledWith("someusername", "oldpassword");
    expect(alert).toBeInTheDocument();
  });

  test("should show error if new password doesn't conform to policy", async () => {
    const signInSpy = jest.spyOn(Auth, "signIn");
    signInSpy.mockImplementation(() =>
      Promise.resolve({
        challengeName: "NEW_PASSWORD_REQUIRED",
      }),
    );

    const completeNewPasswordSpy = jest.spyOn(Auth, "completeNewPassword");
    // Simulate password policy violation
    completeNewPasswordSpy.mockImplementation(() => {
      throw new AmplifyError("InvalidPasswordException");
    });

    const {
      oldPasswordTextbox,
      newPasswordTextbox,
      confirmNewPasswordTextbox,
      submitButton,
    } = await renderUpdatePassword();

    await userEvent.type(oldPasswordTextbox, "oldpassword");
    await userEvent.type(newPasswordTextbox, "badpassword");
    await userEvent.type(confirmNewPasswordTextbox, "badpassword");
    userEvent.click(submitButton);

    const alert = await screen.findByRole("alert", {
      name: /password does not conform to policy/gi,
    });
    expect(signInSpy).toHaveBeenCalledWith("someusername", "oldpassword");
    expect(alert).toBeInTheDocument();
  });
  test("shows errors when required fields are missing", async () => {
    render(<UpdatePassword />);

    const oldPasswordTextbox = await screen.findByLabelText(/old password/gi);
    const newPasswordTextbox = await screen.findByLabelText(/new password/gi);
    const confirmNewPasswordTextbox = await screen.findByLabelText(
      /confirm password/gi,
    );
    const submitButton = await screen.findByRole("button", {
      name: /submit/gi,
    });

    await userEvent.type(oldPasswordTextbox, "");
    await userEvent.type(newPasswordTextbox, "");
    await userEvent.type(confirmNewPasswordTextbox, "");
    userEvent.tab();
    submitButton.click();

    let utils = getUtilsFromFormGroup(oldPasswordTextbox);
    expect(
      await utils.findByRole("alert", {
        name: /required/i,
      }),
    ).toBeInTheDocument();

    utils = getUtilsFromFormGroup(newPasswordTextbox);
    expect(
      await utils.findByRole("alert", {
        name: /required/i,
      }),
    ).toBeInTheDocument();

    utils = getUtilsFromFormGroup(confirmNewPasswordTextbox);
    expect(
      await utils.findByRole("alert", {
        name: /required/i,
      }),
    ).toBeInTheDocument();
  });
  test("show error when new password and confirm password don't match", async () => {
    const {
      oldPasswordTextbox,
      newPasswordTextbox,
      confirmNewPasswordTextbox,
      submitButton,
    } = await renderUpdatePassword();

    await userEvent.type(oldPasswordTextbox, "oldpassword");
    await userEvent.type(newPasswordTextbox, "newpassword");
    await userEvent.type(confirmNewPasswordTextbox, "nomatch");

    userEvent.tab();
    submitButton.click();

    const utils = getUtilsFromFormGroup(confirmNewPasswordTextbox);
    expect(
      await utils.findByRole("alert", {
        name: /passwords must match/i,
      }),
    ).toBeInTheDocument();
  });
  test("should redirect user upon successful update", async () => {
    const signInSpy = jest.spyOn(Auth, "signIn");
    signInSpy.mockImplementation(() =>
      Promise.resolve({
        challengeName: "NEW_PASSWORD_REQUIRED",
      }),
    );

    const completeNewPasswordSpy = jest.spyOn(Auth, "completeNewPassword");

    completeNewPasswordSpy.mockImplementation(() => Promise.resolve());

    const {
      oldPasswordTextbox,
      newPasswordTextbox,
      confirmNewPasswordTextbox,
      submitButton,
    } = await renderUpdatePassword();

    await userEvent.type(oldPasswordTextbox, "oldpassword");
    await userEvent.type(newPasswordTextbox, "badpassword");
    await userEvent.type(confirmNewPasswordTextbox, "badpassword");
    userEvent.click(submitButton);

    expect(signInSpy).toHaveBeenCalledWith("someusername", "oldpassword");
    waitFor(() => expect(mockHistoryPush).toHaveBeenCalledWith("/"));
  });

  test("show redirect to login if user does not have NEW_PASSWORD_REQUIRED challenge from Amplify", async () => {
    const signInSpy = jest.spyOn(Auth, "signIn");
    signInSpy.mockImplementation(() =>
      Promise.resolve({
        challengeName: "NOT_NEW_PASSWORD_REQUIRED",
      }),
    );

    const {
      oldPasswordTextbox,
      newPasswordTextbox,
      confirmNewPasswordTextbox,
      submitButton,
    } = await renderUpdatePassword();

    await userEvent.type(oldPasswordTextbox, "old");
    await userEvent.type(newPasswordTextbox, "new");
    await userEvent.type(confirmNewPasswordTextbox, "new");
    userEvent.click(submitButton);

    waitFor(() =>
      expect(mockHistoryPush).toHaveBeenCalledWith("/account/login"),
    );
  });
});
