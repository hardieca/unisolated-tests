import { Auth } from "aws-amplify";
import { FORM_ERROR } from "final-form";
import React, { useContext, useState } from "react";
import { Form, Field } from "react-final-form";
import { useTranslation } from "react-i18next";
import { Button } from "src/components/presentation/buttons/Button";
import { FormGroup } from "src/components/presentation/form";
import { Label } from "src/components/presentation/form/Label";
import { Textbox } from "src/components/presentation/form/Textbox";
import { H1 } from "src/components/presentation/headings";
import { CbsaLogo } from "src/components/presentation/icons/CbsaLogo";
import { logger } from "src/logger";
import { Error } from "src/components/presentation/form/Error";
import {
  Wrapper,
  CbsaBar,
  MainContentWrapper,
  MainContent,
  AppTitlePane,
  H1Spacer,
  SignIn,
  FormWrapper,
} from "src/routes/Account/containers/commonStyles/AccountStyles";
import { Redirect, useHistory } from "react-router-dom";
import { useQuery } from "src/hooks/useQuery";
import { setUser } from "src/modules/accountModule";
import { userService } from "src/services/userService";
import { AppContext } from "src/context/AppContext";
import { SubmitError } from "src/components/presentation/form/SubmitError";
import { ERROR_CODES } from "src/constants/ERROR_CODES";

/**
 * Form values interface
 */
interface FormValues {
  /**
   * Old password
   */
  oldPassword: string;
  /**
   * New password
   */
  newPassword: string;
  /**
   * Confirm new password
   */
  confirmNewPassword: string;
}

/**
 * Update password form
 * @returns Update password form
 */
export const UpdatePassword = () => {
  const { dispatch } = useContext(AppContext);
  const { t } = useTranslation();
  const history = useHistory();
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  const query = useQuery();
  const username = query.get("username");

  if (!username) {
    return <Redirect to="/account/login" />;
  }

  if (isPasswordChanged) {
    return <Redirect to="/" />;
  }

  /**
   * Validates form values
   * @returns A collection of errors
   * @param values Form values
   */
  const validate = (values: FormValues) => {
    const errors: Partial<FormValues> = {};

    if (!values.oldPassword) {
      errors.oldPassword = t("required");
    }

    if (!values.newPassword) {
      errors.newPassword = t("required");
    }

    if (!values.confirmNewPassword) {
      errors.confirmNewPassword = t("required");
    }

    if (values.newPassword !== values.confirmNewPassword) {
      errors.confirmNewPassword = t("passwords_must_match");
    }

    return errors;
  };

  return (
    <Wrapper>
      <CbsaBar>
        <CbsaLogo />
      </CbsaBar>
      <MainContentWrapper>
        <MainContent>
          <AppTitlePane>
            <H1>
              <H1Spacer>
                Commerce Électronique – Inspection et Notation d’Examen
              </H1Spacer>
              E-Commerce Low Value Inspection System
            </H1>
            <SignIn>
              Veuillez vous connecter pour continuer
              <br />
              Please update your password to continue
            </SignIn>
          </AppTitlePane>
          <FormWrapper>
            <Form
              validate={validate}
              onSubmit={async (values: FormValues): Promise<unknown> => {
                try {
                  if (!username) {
                    history.push("/account/login");
                  }

                  const user = await Auth.signIn(username, values.oldPassword);
                  if (user.challengeName !== "NEW_PASSWORD_REQUIRED") {
                    history.push("/account/login");
                    return {};
                  }

                  await Auth.completeNewPassword(user, values.newPassword);
                  userService.setUser(user);
                  dispatch(setUser(user));
                  // Update succeeded
                  setIsPasswordChanged(true);

                  return {};
                } catch (err) {
                  if (err.code) {
                    switch (err.code) {
                      case ERROR_CODES.INVALID_PASSWORD_EXCEPTION:
                        return { [FORM_ERROR]: t("password_doesnt_conform") };
                      case ERROR_CODES.NOT_AUTHORIZED_EXCEPTION:
                        return { [FORM_ERROR]: t("username_or_password") };
                      default: {
                        logger.error(err);
                        return { [FORM_ERROR]: t("unknown_error") };
                      }
                    }
                  }

                  logger.error(err);
                  return { [FORM_ERROR]: t("unknown_error") };
                }
              }}
            >
              {({
                submitError,
                handleSubmit,
                submitting,
                pristine,
                errors,
              }) => (
                <form onSubmit={handleSubmit}>
                  <Field<string> name="oldPassword" type="password">
                    {({ input, meta }) => (
                      <FormGroup>
                        <Label>
                          Old password / Old Password
                          <br />
                          <Textbox input={input} meta={meta} />
                        </Label>
                        <Error name="oldPassword" />
                      </FormGroup>
                    )}
                  </Field>
                  <Field<string> name="newPassword" type="password">
                    {({ input, meta }) => (
                      <FormGroup>
                        <Label>
                          New Password / New Password
                          <br />
                          <Textbox input={input} meta={meta} />
                        </Label>
                        <Error name="newPassword" />
                      </FormGroup>
                    )}
                  </Field>
                  <Field<string> name="confirmNewPassword" type="password">
                    {({ input, meta }) => (
                      <FormGroup>
                        <Label>
                          Confirm Password / Confirm Password
                          <br />
                          <Textbox input={input} meta={meta} />
                        </Label>
                        <Error name="confirmNewPassword" />
                      </FormGroup>
                    )}
                  </Field>

                  {submitError && (
                    <SubmitError aria-label={submitError}>
                      {submitError}
                    </SubmitError>
                  )}
                  <Button
                    disabled={submitting || pristine || errors.length > 0}
                    type="submit"
                  >
                    Submit / Submit
                  </Button>
                </form>
              )}
            </Form>
          </FormWrapper>
        </MainContent>
      </MainContentWrapper>
    </Wrapper>
  );
};
