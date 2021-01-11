// import original module declarations
import "styled-components";
import { Theme } from "src/styles/lightTheme";

declare module "styled-components" {
  /**
   * Extends styled component default theme with our custom theme
   */
  export interface DefaultTheme extends Theme {}
}
