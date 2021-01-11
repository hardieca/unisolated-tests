import { CALL_API } from "./api";
import { AppState } from "src/context/AppContext";
import {
  AnyStyledComponent,
  StyledComponent,
  StyledComponentInnerComponent,
} from "styled-components";

/**
 * Extracts the type of a component's props type
 * Usage example: type PropsType = ExtractPropsType<typeof SomeComponent>;
 */
export type ExtractPropsType<T> = T extends React.ComponentType<infer P>
  ? P
  : T extends React.Component<infer P>
  ? P
  : T extends React.FunctionComponent<infer P>
  ? P
  : never;

/**
 * Extract props from styled components. Note this does not extract
 * intrinsic props from HTML elements. For that, use ExtractIntrinsicStyledProps.
 */
export type ExtractStyledProps<
  C extends AnyStyledComponent
> = C extends StyledComponent<any, any, infer O, any>
  ? O
  : C extends StyledComponent<any, any, infer O>
  ? O
  : never;

/**
 * Extract props from styled components and also the intrinsic props
 * from the underlying HTML element they are styling.
 */
export type ExtractIntrinsicStyledProps<
  C extends AnyStyledComponent
> = React.ComponentProps<StyledComponentInnerComponent<C>> &
  ExtractStyledProps<C>;

/**
 * Extracts a union type from an array:
 *
 * const myData = ["foo", "bar", "baz"] as const;
 * type MyDataUnion = ExtractUnionFromArray<typeof myData>; // "foo" | "bar" | "baz"
 */
export type ExtractUnionFromArray<T> = T extends ArrayLike<infer U> ? U : never;

/**
 * An array of values constrained to the values of the typed interface parameter
 *
 * interface Foo {
 *   bar: string,
 *   baz: number,
 * }
 *
 * type KeyArray = ExtractArratOfKeys<Foo>;
 * const KeyArray: KeyArray = ["bar", "baz"];
 */
export type ExtractArrayOfKeys<T> = (keyof T)[];

/**
 * Extracts a union type from a selection of keys
 *
 * interface Foo {
 *   bar: string,
 *   baz: number,
 *   foo: boolean
 * }
 *
 * type KeyUnion = ExtractUnionFromKeys<Foo, "bar" | "baz">
 *
 * const keyArray: KeyArray = ["bar", "baz"]; // Works!
 * const keyArray2: KeyArray = ["bar", "baz", "foo"]; // Error, foo not part of union
 */
export type ExtractUnionFromKeys<T, U> = Extract<keyof T, U>;

/**
 * Makes a type or interface indexable
 */
export type Indexable<T> = T & { [index: string]: any };

/**
 * Map object of type T, keyed by string.
 */
export interface ObjectMap<T = any> {
  [key: string]: T;
}

/**
 * Map object of type T, keyed by number
 */
export interface ObjectNumberMap<T = any> {
  [key: number]: T;
}

/**
 * Reducer action
 */
export interface Action {
  /**
   * Indicates the type of action, reducers shall act upon certain actions
   * based on their type
   */
  type: string;
}

/**
 * Reducer action with varied payload
 *
 * e.g. { "type": "someAction", "foo": "bar", "baz": 0 }
 */
export interface AnyAction extends Action, ObjectMap {}

/**
 * An action that triggers an API request when dispatched
 */
export interface ApiAction extends Action {
  /**
   * This type is specified to the special CALL_API
   * constant which triggers an API request
   */
  type: typeof CALL_API;
  /**
   * The path to the endpoint
   * e.g. /person/100
   */
  endpoint: string;
  /**
   * Querystring parameters
   */
  params?: ObjectMap<string>;
  /**
   * The types of an ApiRequest are used to manage state during
   * the course of a request.
   *
   * The types should indicate the request, success and error states
   * of a request
   *
   * e.g. PERSON_REQUEST, PERSON_SUCCESS, PERSON_ERROR
   */
  types: [string, string, string];
  /**
   * Config object used to configure requests
   */
  requestInit?: RequestInit & {
    /**
     * HTTP method
     */
    method: "GET" | "PATCH" | "PUT" | "POST" | "DELETE";
  };
  /**
   * Controls whether or not the action shows the spinner or not
   */
  isBackgroundRequest?: boolean;
  /**
   * Supply an extra argument that will be supplied back when the
   * response is received
   */
  extraArg?: any;
}

/**
 * Request action, dispatched when API request is initiated
 */
export interface RequestAction<T extends string> extends Action {
  /**
   * @inheritdoc
   */
  type: T;
  /**
   * Extra argument to pass back to reducer
   */
  extraArg?: any;
}

/**
 * Success action, dispatched when API request succeeds
 */
export interface SuccessAction<T extends string, R> extends Action {
  /**
   * @inheritdoc
   */
  type: T;
  /**
   * API response payload
   */
  response: R;
  /**
   * Extra argument to pass back to reducer
   */
  extraArg?: any;
}

/**
 * Error action, dispatched with API request fails
 */
export interface ErrorAction<T extends string> extends Action {
  /**
   * @inheritdoc
   */
  type: T;
  /**
   * Error message if API request fails
   */
  error: string;
  /**
   * Extra argument to pass back to reducer
   */
  extraArg?: any;
}

/**
 * Wraps an expression in a function
 */
export type Thunk = (dispatch: React.Dispatch<Action>, state: AppState) => void;

/**
 * State store interface
 */
export interface Store {
  /**
   * Retrieves current state
   */
  getState: () => AppState;
  /**
   * Action dispatcher
   */
  dispatch: React.Dispatch<Action>;
}

/**
 * Middleware type
 */
export type Middleware = (
  store: Store,
) => (next: React.Dispatch<Action>) => (action: Action) => any;

/**
 * Convenience interface to supply an ID prop
 */
export interface IdProps {
  /**
   * Unique identifier
   */
  id: string;
}

/**
 * Generic repo interface for mock repositories
 */
export interface Repo<T> {
  /**
   * Create an item
   */
  create?(item: T): T | undefined;
  /**
   * Retrieve single item method
   */
  get?(id: number | string, ...args: any[]): T;
  /**
   * Retrieve collection method
   */
  getList?(...args: any[]): T[];
  /**
   * Retrieve paginated collection method
   */
  getPaginatedList?(...args: any[]): PaginatedListItems<T>;
  /**
   * Resets mock data
   */
  reset?(): void;
  /**
   * Updates item
   */
  update?(...args: any[]): void;
}

/**
 * Represents a paginated list of items returned by the API
 */
export interface PaginatedListItems<T> {
  /**
   * Current pagination page
   */
  current_page: number;
  /**
   * Current items per pagination count
   */
  current_page_items_count: number;
  /**
   * Total number of items in collection
   */
  total_items_count: number;
  /**
   * Total number of pagination pages
   */
  total_pages_count: number;
  /**
   * List items
   */
  items: T[];
}

/**
 * Options to indicate current page, page size, and ordering
 */
export interface GetPaginatedListOptions {
  /**
   * Current pagination page
   */
  page: number;
  /**
   * Pagination page size limit
   */
  limit: number;
  /**
   * Column to order by
   */
  orderby?: string;
  /**
   * Ordering direction
   */
  direction?: "asc" | "desc";
}

/**
 * Indicates that the object provides a key used for
 * localization
 */
export interface Localized {
  /**
   * Localization key
   */
  key: string;
}

/**
 * Takes the form values object of a Final Form submission
 * and creates a type to submit errors in a validation routine
 */
export type FormErrors<T> = {
  [P in keyof T]?: string;
};

/**
 * API error object
 */
export interface APIError {
  /**
   * API response status code
   */
  status: number;
}
