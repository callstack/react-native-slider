# Web Example

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Setup

This example project can be used to test/demo this project in the context of
`react-native-web`. Here's how to use it:

1. Build the library:
    ```sh
    # go to the `package` folder
    cd ../package
    # build the library
    npm run prepare
    # go back to the example
    cd ../example-web
    ```
2. Run the dev server:
    ```sh
    npm start
    ```


:warning: **NOTE**: each time you make a change to the underlying lib you'll
need to run `npm run prepare` and `npm start` again.
