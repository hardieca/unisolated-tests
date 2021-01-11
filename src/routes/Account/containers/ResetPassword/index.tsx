import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { Form, Field, useField } from "react-final-form";
import { useQuery } from "src/hooks/useQuery";
import { FormErrors } from "src/types";
import { Auth } from "aws-amplify";
import { FORM_ERROR } from "final-form";

const Error = (props: any) => {
  const {
    meta: { touched, error },
  } = useField(props.name, { subscription: { touched: true, error: true } });
  return touched && error ? (
    // add aria-label to set accessible name for span
    <div aria-label={error} role="alert">
      {error}
    </div>
  ) : null;
};

/**
 * Form values interface
 */
interface FormValues {
  /**
   * Password
   */
  password: string;
  /**
   * Confirm password
   */
  confirmPassword: string;
  /**
   * Code to reset password
   */
  resetCode: string;
}

/**
 * Allows users to reset their password after an admin has forced a reset
 * @returns the Reset Password screen
 */
export const ResetPassword = () => {
  const history = useHistory();
  const query = useQuery();
  const username = query.get("username");

  const [isPasswordReset, setIsPasswordReset] = useState(false);

  if (!username) {
    return <Redirect to="/account/login" />;
  }

  if (isPasswordReset) {
    return <Redirect to="/" />;
  }

  /**
   * Validates form values
   * @returns A collection of errors
   * @param values Form values
   */
  const validate = (values: FormValues) => {
    const errors: FormErrors<FormValues> = {};

    if (!values.password) {
      errors.password = "Required";
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = "Required";
    }

    if (!values.resetCode) {
      errors.resetCode = "Required";
    }

    return errors;
  };

  return (
    <div>
      <h1>Reset password</h1>
      <div>
        <Form
          validate={validate}
          onSubmit={async (values: FormValues): Promise<unknown> => {
            try {
              if (!username) {
                history.push("/account/login");
              }

              // Reset password uses forgot password flow /shrug
              await Auth.forgotPasswordSubmit(
                username,
                values.resetCode,
                values.password,
              );

              // Reset has succeeded, log in user and redirect
              const user = await Auth.signIn(username, values.password);
              // userService.setUser(user);
              // dispatch(setUser(user));
              setIsPasswordReset(true);

              return {};
            } catch (err) {
              if (err.code) {
                switch (err.code) {
                  case "InvalidPasswordException":
                    return {
                      [FORM_ERROR]: "Password does not conform to policy",
                    };
                  default: {
                    return { [FORM_ERROR]: "An unknown error has occurred" };
                  }
                }
              }

              return { [FORM_ERROR]: "An unknown error has occurred" };
            }
          }}
        >
          {({ submitError, handleSubmit, submitting, pristine, errors }) => (
            <form onSubmit={handleSubmit}>
              <Field name="password" type="password">
                {({ input, meta }) => (
                  <div className="formGroup">
                    <label>
                      Password / Mot de passe
                      <br />
                      <input {...input} />
                    </label>
                    <Error name="password" />
                  </div>
                )}
              </Field>
              <Field name="confirmPassword" type="password">
                {({ input, meta }) => (
                  <div className="formGroup">
                    <label>
                      Confirm Password / Confirm Password
                      <br />
                      <input {...input} />
                    </label>
                    <Error name="confirmPassword" />
                  </div>
                )}
              </Field>
              <Field name="resetCode" type="text">
                {({ input, meta }) => (
                  <div className="formGroup">
                    <label>
                      Code / Code
                      <br />
                      <input {...input} />
                    </label>
                    <Error name="resetCode" />
                  </div>
                )}
              </Field>
              {submitError ? (
                <div role="alert" aria-label={submitError}>
                  {submitError}
                </div>
              ) : (
                undefined
              )}
              <button
                disabled={submitting || pristine || errors.length > 0}
                type="submit"
              >
                Submit / Submit
              </button>
            </form>
          )}
        </Form>
      </div>
    </div>
  );
};
